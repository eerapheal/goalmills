package worker

import (
	"context"
	"fmt"
	"log"
	"sync"
	"sync/atomic"
	"time"
)

// EmailJob represents a single email dispatch task
type EmailJob struct {
	ID               string
	To               string
	Subject          string
	HTMLBody         string
	UnsubscribeToken string
	CampaignID       string
	Attempt          int
	MaxRetries       int
	SendFunc         func(ctx context.Context, job EmailJob) error
}

// PoolStats holds telemetry and delivery counters
type PoolStats struct {
	TotalQueued   int64
	TotalSent     int64
	TotalFailed   int64
	ActiveWorkers int64
}

// WorkerPool manages concurrent email workers
type WorkerPool struct {
	workers    int
	jobQueue   chan EmailJob
	stats      PoolStats
	rateLimiter *time.Ticker
	wg         sync.WaitGroup
	ctx        context.Context
	cancel     context.CancelFunc
}

// NewWorkerPool initializes a high-throughput worker pool
func NewWorkerPool(workers int, queueSize int, maxEmailsPerSec int) *WorkerPool {
	ctx, cancel := context.WithCancel(context.Background())
	interval := time.Second / time.Duration(maxEmailsPerSec)
	if maxEmailsPerSec <= 0 {
		interval = time.Millisecond * 20 // default 50 emails/sec
	}

	return &WorkerPool{
		workers:     workers,
		jobQueue:    make(chan EmailJob, queueSize),
		rateLimiter: time.NewTicker(interval),
		ctx:         ctx,
		cancel:      cancel,
	}
}

// Start launches worker goroutines
func (p *WorkerPool) Start() {
	for i := 0; i < p.workers; i++ {
		p.wg.Add(1)
		go p.workerLoop(i)
	}
	log.Printf("[WorkerPool] Started %d concurrent email dispatch workers", p.workers)
}

func (p *WorkerPool) workerLoop(workerID int) {
	defer p.wg.Done()

	for {
		select {
		case <-p.ctx.Done():
			return
		case job, ok := <-p.jobQueue:
			if !ok {
				return
			}

			atomic.AddInt64(&p.stats.ActiveWorkers, 1)

			// Obey rate limiter
			<-p.rateLimiter.C

			err := p.executeWithRetry(job)
			if err != nil {
				atomic.AddInt64(&p.stats.TotalFailed, 1)
				log.Printf("[Worker %d] FAILED delivery to %s (Campaign: %s): %v", workerID, job.To, job.CampaignID, err)
			} else {
				atomic.AddInt64(&p.stats.TotalSent, 1)
			}

			atomic.AddInt64(&p.stats.ActiveWorkers, -1)
		}
	}
}

func (p *WorkerPool) executeWithRetry(job EmailJob) error {
	var lastErr error
	maxRetries := job.MaxRetries
	if maxRetries <= 0 {
		maxRetries = 3
	}

	for attempt := 1; attempt <= maxRetries; attempt++ {
		job.Attempt = attempt
		if job.SendFunc != nil {
			err := job.SendFunc(p.ctx, job)
			if err == nil {
				return nil
			}
			lastErr = err
		}

		// Exponential backoff: 200ms, 400ms, 800ms
		backoff := time.Duration(1<<uint(attempt-1)) * 200 * time.Millisecond
		time.Sleep(backoff)
	}

	return fmt.Errorf("exceeded max retries (%d): %w", maxRetries, lastErr)
}

// Submit queues an email dispatch job
func (p *WorkerPool) Submit(job EmailJob) bool {
	select {
	case p.jobQueue <- job:
		atomic.AddInt64(&p.stats.TotalQueued, 1)
		return true
	default:
		log.Printf("[WorkerPool] Queue full! Dropped email job for %s", job.To)
		return false
	}
}

// GetStats returns current worker metrics
func (p *WorkerPool) GetStats() PoolStats {
	return PoolStats{
		TotalQueued:   atomic.LoadInt64(&p.stats.TotalQueued),
		TotalSent:     atomic.LoadInt64(&p.stats.TotalSent),
		TotalFailed:   atomic.LoadInt64(&p.stats.TotalFailed),
		ActiveWorkers: atomic.LoadInt64(&p.stats.ActiveWorkers),
	}
}

// Stop gracefully stops the pool
func (p *WorkerPool) Stop() {
	close(p.jobQueue)
	p.cancel()
	p.rateLimiter.Stop()
	p.wg.Wait()
	log.Printf("[WorkerPool] Gracefully terminated. Stats: Sent=%d, Failed=%d", p.stats.TotalSent, p.stats.TotalFailed)
}

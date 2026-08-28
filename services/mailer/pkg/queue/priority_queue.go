package queue

import (
	"context"
	"log"
	"sync"
	"sync/atomic"

	"github.com/goalmills/mailer/pkg/bounce"
	"github.com/goalmills/mailer/pkg/ratelimiter"
)

type JobPriority int

const (
	PriorityNormal JobPriority = 1
	PriorityHigh   JobPriority = 10
)

type EmailTask struct {
	ID               string
	To               string
	Subject          string
	HTMLBody         string
	UnsubscribeToken string
	CampaignID       string
	RecipientID      string
	Priority         JobPriority
	Attempt          int
	SendFunc         func(ctx context.Context, task EmailTask) error
	OnSuccess        func(task EmailTask)
	OnFailure        func(task EmailTask, analysis bounce.BounceAnalysis)
}

type PriorityQueueManager struct {
	highQueue     chan EmailTask
	normalQueue   chan EmailTask
	domainLimiter *ratelimiter.DomainRateLimiter
	activeWorkers int64
	totalSent     int64
	totalFailed   int64
	totalBounced  int64
	workers       int
	wg            sync.WaitGroup
	ctx           context.Context
	cancel        context.CancelFunc
}

func NewPriorityQueueManager(workers int, highCap int, normalCap int) *PriorityQueueManager {
	ctx, cancel := context.WithCancel(context.Background())
	return &PriorityQueueManager{
		highQueue:     make(chan EmailTask, highCap),
		normalQueue:   make(chan EmailTask, normalCap),
		domainLimiter: ratelimiter.NewDomainRateLimiter(),
		workers:       workers,
		ctx:           ctx,
		cancel:        cancel,
	}
}

func (pq *PriorityQueueManager) Start() {
	for i := 0; i < pq.workers; i++ {
		pq.wg.Add(1)
		go pq.workerLoop(i)
	}
	log.Printf("[PriorityQueueManager] Started %d priority dispatch workers with per-domain rate limiting", pq.workers)
}

func (pq *PriorityQueueManager) workerLoop(workerID int) {
	defer pq.wg.Done()

	for {
		select {
		case <-pq.ctx.Done():
			return

		// Prioritize High Queue first
		case task, ok := <-pq.highQueue:
			if !ok {
				return
			}
			pq.processTask(workerID, task)

		// If high queue empty, read from normal queue
		default:
			select {
			case <-pq.ctx.Done():
				return
			case task, ok := <-pq.highQueue:
				if !ok {
					return
				}
				pq.processTask(workerID, task)
			case task, ok := <-pq.normalQueue:
				if !ok {
					return
				}
				pq.processTask(workerID, task)
			}
		}
	}
}

func (pq *PriorityQueueManager) processTask(workerID int, task EmailTask) {
	atomic.AddInt64(&pq.activeWorkers, 1)
	defer atomic.AddInt64(&pq.activeWorkers, -1)

	// Respect domain-specific rate limit (Gmail / Outlook / Yahoo / Apple / Generic)
	pq.domainLimiter.Wait(task.To)

	if task.SendFunc != nil {
		err := task.SendFunc(pq.ctx, task)
		if err == nil {
			atomic.AddInt64(&pq.totalSent, 1)
			if task.OnSuccess != nil {
				task.OnSuccess(task)
			}
			return
		}

		// Error handling & Bounce Classification
		analysis := bounce.ClassifySMTPError(err, task.Attempt)
		if analysis.Type == bounce.BounceTypeHard {
			atomic.AddInt64(&pq.totalBounced, 1)
			log.Printf("[Worker %d] HARD BOUNCE: %s (Suppressing permanently): %v", workerID, task.To, err)
		} else if analysis.Type == bounce.BounceTypeSoft {
			atomic.AddInt64(&pq.totalBounced, 1)
			log.Printf("[Worker %d] SOFT BOUNCE: %s (Retry in %v): %v", workerID, task.To, analysis.NextRetryIn, err)
		} else {
			atomic.AddInt64(&pq.totalFailed, 1)
		}

		if task.OnFailure != nil {
			task.OnFailure(task, analysis)
		}
	}
}

func (pq *PriorityQueueManager) Submit(task EmailTask) bool {
	if task.Priority >= PriorityHigh {
		select {
		case pq.highQueue <- task:
			return true
		default:
			log.Printf("[PriorityQueue] High queue full! Dropping job for %s", task.To)
			return false
		}
	}

	select {
	case pq.normalQueue <- task:
		return true
	default:
		log.Printf("[PriorityQueue] Normal queue full! Dropping job for %s", task.To)
		return false
	}
}

func (pq *PriorityQueueManager) Stop() {
	pq.cancel()
	close(pq.highQueue)
	close(pq.normalQueue)
	pq.domainLimiter.Stop()
	pq.wg.Wait()
}

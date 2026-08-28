package ratelimiter

import (
	"strings"
	"sync"
	"time"
)

// DomainType identifies major mail providers
type DomainType string

const (
	DomainGmail   DomainType = "gmail"
	DomainOutlook DomainType = "outlook"
	DomainYahoo   DomainType = "yahoo"
	DomainICloud  DomainType = "icloud"
	DomainGeneric DomainType = "generic"
)

// DomainRateLimiter maintains separate token buckets for each provider
type DomainRateLimiter struct {
	limiters map[DomainType]*time.Ticker
	mu       sync.RWMutex
}

// NewDomainRateLimiter sets up conservative, provider-friendly throughput caps
func NewDomainRateLimiter() *DomainRateLimiter {
	limiters := make(map[DomainType]*time.Ticker)

	// Gmail: max 15/sec
	limiters[DomainGmail] = time.NewTicker(time.Second / 15)

	// Outlook / Hotmail / Live: max 10/sec
	limiters[DomainOutlook] = time.NewTicker(time.Second / 10)

	// Yahoo / AOL: max 8/sec
	limiters[DomainYahoo] = time.NewTicker(time.Second / 8)

	// Apple iCloud: max 5/sec
	limiters[DomainICloud] = time.NewTicker(time.Second / 5)

	// Generic / Other: max 25/sec
	limiters[DomainGeneric] = time.NewTicker(time.Second / 25)

	return &DomainRateLimiter{
		limiters: limiters,
	}
}

// ClassifyDomain returns the DomainType for an email address
func ClassifyDomain(email string) DomainType {
	parts := strings.Split(strings.ToLower(strings.TrimSpace(email)), "@")
	if len(parts) != 2 {
		return DomainGeneric
	}
	domain := parts[1]

	if strings.Contains(domain, "gmail") || strings.Contains(domain, "googlemail") {
		return DomainGmail
	}
	if strings.Contains(domain, "outlook") || strings.Contains(domain, "hotmail") || strings.Contains(domain, "live") || strings.Contains(domain, "msn") {
		return DomainOutlook
	}
	if strings.Contains(domain, "yahoo") || strings.Contains(domain, "ymail") || strings.Contains(domain, "aol") {
		return DomainYahoo
	}
	if strings.Contains(domain, "icloud") || strings.Contains(domain, "me.com") || strings.Contains(domain, "mac.com") {
		return DomainICloud
	}

	return DomainGeneric
}

// Wait blocks until a token is available for the given recipient domain
func (d *DomainRateLimiter) Wait(email string) {
	domainType := ClassifyDomain(email)

	d.mu.RLock()
	ticker, exists := d.limiters[domainType]
	if !exists {
		ticker = d.limiters[DomainGeneric]
	}
	d.mu.RUnlock()

	<-ticker.C
}

// Stop closes all tickers
func (d *DomainRateLimiter) Stop() {
	d.mu.Lock()
	defer d.mu.Unlock()
	for _, ticker := range d.limiters {
		ticker.Stop()
	}
}

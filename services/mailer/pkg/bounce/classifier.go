package bounce

import (
	"strings"
	"time"
)

type BounceType string

const (
	BounceTypeNone BounceType = "NONE"
	BounceTypeHard BounceType = "HARD_BOUNCE"
	BounceTypeSoft BounceType = "SOFT_BOUNCE"
)

type BounceAnalysis struct {
	Type        BounceType
	IsPermanent bool
	ShouldRetry bool
	NextRetryIn time.Duration
	Reason      string
}

// ClassifySMTPError evaluates SMTP status codes and text to classify bounce severity
func ClassifySMTPError(err error, attempt int) BounceAnalysis {
	if err == nil {
		return BounceAnalysis{Type: BounceTypeNone, ShouldRetry: false}
	}

	errStr := strings.ToLower(err.Error())

	// 1. Hard Bounce Detection (5xx, user unknown, mailbox unavailable, invalid recipient)
	is5xx := strings.Contains(errStr, "550") || strings.Contains(errStr, "553") ||
		strings.Contains(errStr, "551") || strings.Contains(errStr, "552") ||
		strings.Contains(errStr, "554") || strings.Contains(errStr, "500")

	isHardText := strings.Contains(errStr, "user unknown") ||
		strings.Contains(errStr, "mailbox unavailable") ||
		strings.Contains(errStr, "invalid recipient") ||
		strings.Contains(errStr, "does not exist") ||
		strings.Contains(errStr, "no such user") ||
		strings.Contains(errStr, "recipient address rejected") ||
		strings.Contains(errStr, "account has been disabled")

	if is5xx || isHardText {
		return BounceAnalysis{
			Type:        BounceTypeHard,
			IsPermanent: true,
			ShouldRetry: false,
			Reason:      "Permanent Hard Bounce: User unknown or mailbox unavailable",
		}
	}

	// 2. Soft Bounce Detection (4xx, greylisting, mailbox full, rate limited, connection timeout)
	if attempt >= 5 {
		// Exceeded 5 soft bounce retry attempts
		return BounceAnalysis{
			Type:        BounceTypeSoft,
			IsPermanent: false,
			ShouldRetry: false,
			Reason:      "Exceeded max soft-bounce retries (5 attempts)",
		}
	}

	// Scheduled Multi-Tier Delays: Attempt 1 -> 5m, Attempt 2 -> 30m, Attempt 3 -> 2h, Attempt 4 -> 6h, Attempt 5 -> 24h
	var retryDelay time.Duration
	switch attempt {
	case 1:
		retryDelay = 5 * time.Minute
	case 2:
		retryDelay = 30 * time.Minute
	case 3:
		retryDelay = 2 * time.Hour
	case 4:
		retryDelay = 6 * time.Hour
	default:
		retryDelay = 24 * time.Hour
	}

	return BounceAnalysis{
		Type:        BounceTypeSoft,
		IsPermanent: false,
		ShouldRetry: true,
		NextRetryIn: retryDelay,
		Reason:      "Temporary Soft Bounce (rate limit, greylist, or mailbox full)",
	}
}

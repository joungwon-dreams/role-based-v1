/**
 * Simple in-memory rate limiter for authentication endpoints
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMinutes: number = 15) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMinutes * 60 * 1000;

    // Clean up expired records every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Check if the identifier has exceeded rate limit
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.records.get(identifier);

    if (!record) {
      return false;
    }

    // Reset if window has passed
    if (now >= record.resetTime) {
      this.records.delete(identifier);
      return false;
    }

    return record.count >= this.maxAttempts;
  }

  /**
   * Record an attempt for the identifier
   */
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.records.get(identifier);

    if (!record || now >= record.resetTime) {
      // Create new record
      this.records.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    } else {
      // Increment existing record
      record.count += 1;
    }
  }

  /**
   * Get remaining time until rate limit resets (in seconds)
   */
  getResetTime(identifier: string): number {
    const record = this.records.get(identifier);
    if (!record) return 0;

    const now = Date.now();
    const remainingMs = record.resetTime - now;

    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(identifier: string): number {
    const record = this.records.get(identifier);
    if (!record) return this.maxAttempts;

    const now = Date.now();
    if (now >= record.resetTime) {
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - record.count);
  }

  /**
   * Cleanup expired records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, record] of this.records.entries()) {
      if (now >= record.resetTime) {
        this.records.delete(identifier);
      }
    }
  }

  /**
   * Clear all records (useful for testing)
   */
  clear(): void {
    this.records.clear();
  }
}

// Login rate limiter: 5 attempts per 15 minutes
export const loginRateLimiter = new RateLimiter(5, 15);

// Signup rate limiter: 3 attempts per hour
export const signupRateLimiter = new RateLimiter(3, 60);

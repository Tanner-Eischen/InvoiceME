type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function canProceed(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }
  if (b.count < limit) {
    b.count += 1
    return { allowed: true, remaining: limit - b.count, resetAt: b.resetAt }
  }
  return { allowed: false, remaining: 0, resetAt: b.resetAt }
}

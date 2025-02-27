import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Redis environment variables')
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Helper to get visitor identifier
const getVisitorId = async () => {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  return `${ip}-${userAgent}`
}

// Rate limit configuration
const RATE_LIMIT_DURATION = 60 * 60 // 1 hour in seconds
const MAX_REQUESTS = 10 // Maximum requests per hour per visitor

export const isRateLimited = async (visitorId: string) => {
  const key = `rate_limit:${visitorId}`
  const requests = await redis.incr(key)
  
  if (requests === 1) {
    await redis.expire(key, RATE_LIMIT_DURATION)
  }
  
  return requests > MAX_REQUESTS
}

export const incrementPageViews = async () => {
  try {
    const visitorId = await getVisitorId()
    
    // Check rate limit
    if (await isRateLimited(visitorId)) {
      console.warn('Rate limit exceeded for visitor:', visitorId)
      return await getPageViews()
    }

    // Track unique visitors (store for 24 hours)
    const uniqueKey = `unique_visitors:${new Date().toISOString().split('T')[0]}`
    await redis.sadd(uniqueKey, visitorId)
    await redis.expire(uniqueKey, 24 * 60 * 60) // 24 hours

    const views = await redis.incr('page_views')
    return views
  } catch (error) {
    console.error('Error incrementing page views:', error)
    return null
  }
}

export const getPageViews = async () => {
  try {
    const views = await redis.get('page_views')
    return typeof views === 'number' ? views : 0
  } catch (error) {
    console.error('Error getting page views:', error)
    return 0
  }
}

export const getUniqueVisitors = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const uniqueKey = `unique_visitors:${today}`
    const uniqueCount = await redis.scard(uniqueKey)
    return uniqueCount
  } catch (error) {
    console.error('Error getting unique visitors:', error)
    return 0
  }
} 
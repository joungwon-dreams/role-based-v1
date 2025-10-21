/**
 * Database Caching Strategy
 *
 * Redis 기반 캐싱 전략으로 데이터베이스 I/O를 최소화하고
 * 응답 시간을 크게 개선합니다.
 *
 * 성능 목표:
 * - 캐시 히트율 > 90%
 * - 평균 응답 시간 < 10ms (캐시 히트 시)
 * - DB 쿼리 수 50% 감소
 */

import { Redis } from 'ioredis';

// Redis 클라이언트 설정
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// ============================================================================
// CACHE KEY PATTERNS
// ============================================================================

export const CacheKeys = {
  // User related
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:${id}:profile`,
  userRoles: (id: string) => `user:${id}:roles`,
  userPermissions: (id: string) => `user:${id}:permissions`,

  // Team related
  team: (id: string) => `team:${id}`,
  teamMembers: (teamId: string) => `team:${teamId}:members`,
  teamMemberCount: (teamId: string) => `team:${teamId}:member_count`,
  userTeams: (userId: string) => `user:${userId}:teams`,

  // Story related
  story: (id: string) => `story:${id}`,
  storyLikeCount: (id: string) => `story:${id}:like_count`,
  storyCommentCount: (id: string) => `story:${id}:comment_count`,
  teamStories: (teamId: string, page: number) => `team:${teamId}:stories:${page}`,
  userStories: (userId: string, page: number) => `user:${userId}:stories:${page}`,

  // Comment related
  storyComments: (storyId: string, page: number) => `story:${storyId}:comments:${page}`,
  commentReplies: (commentId: string) => `comment:${commentId}:replies`,

  // Calendar related
  userCalendar: (userId: string, month: string) => `calendar:user:${userId}:${month}`,
  teamCalendar: (teamId: string, month: string) => `calendar:team:${teamId}:${month}`,

  // Notification related
  notificationCount: (userId: string) => `user:${userId}:notification_count`,

  // Session related
  session: (token: string) => `session:${token}`,
  userSessions: (userId: string) => `user:${userId}:sessions`,

  // Rate limiting
  rateLimit: (ip: string, endpoint: string) => `rate_limit:${ip}:${endpoint}`,
} as const;

// ============================================================================
// CACHE TTL (Time To Live) SETTINGS
// ============================================================================

export const CacheTTL = {
  // Short-lived (자주 변경되는 데이터)
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours

  // Specific TTLs
  user: 3600, // 1 hour
  userProfile: 1800, // 30 minutes
  team: 3600, // 1 hour
  story: 1800, // 30 minutes
  comments: 300, // 5 minutes (자주 업데이트)
  calendar: 600, // 10 minutes
  session: 86400, // 24 hours
  rateLimit: 60, // 1 minute
} as const;

// ============================================================================
// CACHE HELPER FUNCTIONS
// ============================================================================

/**
 * Cache-Aside Pattern
 * 1. 캐시 확인 → 2. 없으면 DB 조회 → 3. 캐시에 저장
 */
export async function cacheAside<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): Promise<T> {
  try {
    // 1. 캐시 확인
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. DB 조회
    const data = await fetcher();

    // 3. 캐시 저장
    if (data !== null && data !== undefined) {
      await redis.setex(key, ttl, JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // 캐시 실패 시 DB에서 직접 조회
    return fetcher();
  }
}

/**
 * Write-Through Pattern
 * 데이터 쓰기 시 즉시 캐시 업데이트
 */
export async function writeThrough<T>(
  key: string,
  data: T,
  ttl: number = CacheTTL.MEDIUM
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

/**
 * Cache Invalidation
 * 데이터 변경 시 캐시 무효화
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    if (pattern.includes('*')) {
      // 패턴 매칭으로 여러 키 삭제
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      // 단일 키 삭제
      await redis.del(pattern);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Multi-level Cache Invalidation
 * 관련된 모든 캐시 무효화
 */
export async function invalidateRelatedCache(type: string, id: string): Promise<void> {
  const patterns: Record<string, string[]> = {
    story: [
      CacheKeys.story(id),
      `story:${id}:*`, // like_count, comment_count
      'team:*:stories:*', // team stories lists
      'user:*:stories:*', // user stories lists
    ],
    comment: [
      `story:*:comments:*`, // story comments lists
      `comment:${id}:*`, // comment replies
    ],
    user: [
      CacheKeys.user(id),
      CacheKeys.userProfile(id),
      CacheKeys.userRoles(id),
      CacheKeys.userPermissions(id),
    ],
    team: [
      CacheKeys.team(id),
      CacheKeys.teamMembers(id),
      CacheKeys.teamMemberCount(id),
      `team:${id}:*`,
    ],
    notification: [
      CacheKeys.notificationCount(id), // user's notification count
    ],
  };

  const patternsToDelete = patterns[type] || [];
  for (const pattern of patternsToDelete) {
    await invalidateCache(pattern);
  }
}

// ============================================================================
// CACHE WARMING (캐시 예열)
// ============================================================================

/**
 * 애플리케이션 시작 시 자주 사용되는 데이터를 미리 캐싱
 */
export async function warmupCache(db: any) {
  console.log('Starting cache warmup...');

  try {
    // 1. 시스템 설정 캐싱
    const settings = await db.query.systemSettings.findMany();
    for (const setting of settings) {
      await writeThrough(`setting:${setting.key}`, setting.value, CacheTTL.DAY);
    }

    // 2. 활성 사용자 수 (상위 1000명)
    const activeUsers = await db.query.users.findMany({
      limit: 1000,
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    for (const user of activeUsers) {
      await writeThrough(CacheKeys.user(user.id), user, CacheTTL.LONG);
    }

    // 3. 인기 스토리 (최근 1주일, 좋아요 많은 순)
    // 이 부분은 실제 좋아요 count 쿼리로 구현

    console.log('Cache warmup completed');
  } catch (error) {
    console.error('Cache warmup error:', error);
  }
}

// ============================================================================
// REDIS PUBSUB (캐시 동기화)
// ============================================================================

/**
 * 여러 서버 인스턴스 간 캐시 동기화
 */
export const cacheEvents = {
  INVALIDATE: 'cache:invalidate',
} as const;

// Publisher
export async function publishCacheInvalidation(key: string) {
  await redis.publish(cacheEvents.INVALIDATE, key);
}

// Subscriber (다른 Redis 인스턴스 필요)
export function subscribeCacheInvalidation(subscriber: Redis) {
  subscriber.subscribe(cacheEvents.INVALIDATE);
  subscriber.on('message', async (channel, message) => {
    if (channel === cacheEvents.INVALIDATE) {
      await invalidateCache(message);
    }
  });
}

// ============================================================================
// CACHING MIDDLEWARE FOR tRPC
// ============================================================================

/**
 * tRPC 미들웨어로 자동 캐싱
 */
export function createCacheMiddleware(ttl: number = CacheTTL.MEDIUM) {
  return async ({ ctx, next, path, type }: any) => {
    // Mutation은 캐싱하지 않음
    if (type === 'mutation') {
      return next();
    }

    // Query만 캐싱
    const cacheKey = `query:${path}:${JSON.stringify(ctx.input)}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return {
          ok: true,
          data: JSON.parse(cached),
        };
      }

      const result = await next();

      if (result.ok && result.data) {
        await redis.setex(cacheKey, ttl, JSON.stringify(result.data));
      }

      return result;
    } catch (error) {
      console.error('Cache middleware error:', error);
      return next();
    }
  };
}

// ============================================================================
// CACHE STATISTICS & MONITORING
// ============================================================================

/**
 * 캐시 통계 조회
 */
export async function getCacheStats() {
  const info = await redis.info('stats');
  const keyspace = await redis.info('keyspace');

  return {
    info,
    keyspace,
    keys: await redis.dbsize(),
    memory: await redis.info('memory'),
  };
}

/**
 * 캐시 히트율 계산
 */
export async function getCacheHitRate() {
  const info = await redis.info('stats');
  const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
  const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');

  const total = hits + misses;
  const hitRate = total > 0 ? (hits / total) * 100 : 0;

  return {
    hits,
    misses,
    total,
    hitRate: hitRate.toFixed(2) + '%',
  };
}

// ============================================================================
// CACHE CLEANUP (메모리 관리)
// ============================================================================

/**
 * 오래된 캐시 정리 (크론잡으로 실행)
 */
export async function cleanupExpiredCache() {
  console.log('Starting cache cleanup...');

  try {
    // Redis는 자동으로 만료된 키를 삭제하지만,
    // 메모리 압박 시 수동으로 정리 가능
    await redis.scan(
      0,
      'MATCH',
      '*',
      'COUNT',
      100,
      (err, [cursor, keys]) => {
        if (err) throw err;

        keys.forEach(async (key) => {
          const ttl = await redis.ttl(key);
          // TTL이 없는 키(-1) 또는 매우 짧은 키 제거
          if (ttl === -1 || ttl < 10) {
            await redis.del(key);
          }
        });
      }
    );

    console.log('Cache cleanup completed');
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: User Profile Caching
 */
export async function getUserWithCache(userId: string, db: any) {
  return cacheAside(
    CacheKeys.user(userId),
    async () => {
      return db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
      });
    },
    CacheTTL.user
  );
}

/**
 * Example 2: Story with Like Count
 */
export async function getStoryWithStats(storyId: string, db: any) {
  const [story, likeCount, commentCount] = await Promise.all([
    cacheAside(
      CacheKeys.story(storyId),
      async () => db.query.stories.findFirst({ where: (s, { eq }) => eq(s.id, storyId) }),
      CacheTTL.story
    ),
    cacheAside(
      CacheKeys.storyLikeCount(storyId),
      async () => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(likes)
          .where(eq(likes.storyId, storyId));
        return count;
      },
      CacheTTL.MEDIUM
    ),
    cacheAside(
      CacheKeys.storyCommentCount(storyId),
      async () => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(comments)
          .where(eq(comments.storyId, storyId));
        return count;
      },
      CacheTTL.MEDIUM
    ),
  ]);

  return {
    ...story,
    likeCount,
    commentCount,
  };
}

/**
 * Example 3: Invalidate after Story Update
 */
export async function updateStoryAndInvalidateCache(storyId: string, data: any, db: any) {
  // 1. DB 업데이트
  const [updated] = await db.update(stories).set(data).where(eq(stories.id, storyId)).returning();

  // 2. 관련 캐시 무효화
  await invalidateRelatedCache('story', storyId);

  return updated;
}

export default {
  redis,
  CacheKeys,
  CacheTTL,
  cacheAside,
  writeThrough,
  invalidateCache,
  invalidateRelatedCache,
  warmupCache,
  getCacheStats,
  getCacheHitRate,
  cleanupExpiredCache,
};

/**
 * Admin Monitoring Router (TIER 2)
 *
 * 캐시 및 쿼리 통계 모니터링 대시보드
 * 관리자 전용 - 시스템 성능 모니터링
 */

import { z } from 'zod';
import { router, requirePermission } from '../../trpc';
import {
  getCacheStats,
  getCacheHitRate,
  redis,
  CacheKeys,
} from '../../../db/optimizations/caching-strategy';

export const monitoringRouter = router({
  /**
   * Get comprehensive cache statistics
   * 캐시 전체 통계 조회
   */
  cacheStats: requirePermission('admin:read:all').query(async () => {
    const stats = await getCacheStats();
    const hitRate = await getCacheHitRate();

    return {
      ...stats,
      hitRate,
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Get cache hit rate
   * 캐시 히트율 조회
   */
  cacheHitRate: requirePermission('admin:read:all').query(async () => {
    return getCacheHitRate();
  }),

  /**
   * Get Redis memory info
   * Redis 메모리 정보
   */
  redisMemory: requirePermission('admin:read:all').query(async () => {
    const info = await redis.info('memory');
    const lines = info.split('\r\n');
    const memory: Record<string, string> = {};

    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          memory[key] = value;
        }
      }
    }

    return memory;
  }),

  /**
   * Get all cache keys by pattern
   * 패턴별 캐시 키 조회
   */
  cacheKeys: requirePermission('admin:read:all')
    .input(
      z.object({
        pattern: z.string().default('*'),
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .query(async ({ input }) => {
      const keys = await redis.keys(input.pattern);
      const limitedKeys = keys.slice(0, input.limit);

      // Get values for each key
      const keysWithValues = await Promise.all(
        limitedKeys.map(async (key) => {
          const ttl = await redis.ttl(key);
          const value = await redis.get(key);
          let parsedValue = value;

          try {
            if (value) {
              parsedValue = JSON.parse(value);
            }
          } catch {
            // Keep as string if not JSON
          }

          return {
            key,
            ttl,
            value: parsedValue,
          };
        })
      );

      return {
        total: keys.length,
        returned: keysWithValues.length,
        keys: keysWithValues,
      };
    }),

  /**
   * Clear cache by pattern
   * 패턴으로 캐시 삭제
   */
  clearCache: requirePermission('admin:delete:all')
    .input(
      z.object({
        pattern: z.string().min(1),
        confirm: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      if (!input.confirm) {
        throw new Error('Confirmation required to clear cache');
      }

      const keys = await redis.keys(input.pattern);
      let deletedCount = 0;

      if (keys.length > 0) {
        deletedCount = await redis.del(...keys);
      }

      return {
        success: true,
        deletedCount,
        pattern: input.pattern,
      };
    }),

  /**
   * Flush all caches (⚠️ DANGEROUS)
   * 모든 캐시 삭제 (위험)
   */
  flushAll: requirePermission('admin:delete:all')
    .input(
      z.object({
        confirm: z.literal(true),
        password: z.string(), // Require admin password confirmation
      })
    )
    .mutation(async ({ input }) => {
      // Add password verification here if needed
      await redis.flushdb();

      return {
        success: true,
        message: 'All caches flushed',
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Get cache performance metrics
   * 캐시 성능 지표
   */
  performanceMetrics: requirePermission('admin:read:all').query(async () => {
    const hitRate = await getCacheHitRate();
    const dbSize = await redis.dbsize();
    const info = await redis.info('stats');

    // Parse info for additional metrics
    const totalCommandsMatch = info.match(/total_commands_processed:(\d+)/);
    const opsPerSecMatch = info.match(/instantaneous_ops_per_sec:(\d+)/);

    return {
      cacheHitRate: hitRate.hitRate,
      totalKeys: dbSize,
      totalHits: hitRate.hits,
      totalMisses: hitRate.misses,
      totalCommands: totalCommandsMatch ? parseInt(totalCommandsMatch[1]) : 0,
      opsPerSecond: opsPerSecMatch ? parseInt(opsPerSecMatch[1]) : 0,
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Get top cached items by type
   * 타입별 캐시 상위 항목
   */
  topCachedItems: requirePermission('admin:read:all')
    .input(
      z.object({
        type: z.enum(['user', 'story', 'team', 'notification', 'all']).default('all'),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      let pattern = '*';

      switch (input.type) {
        case 'user':
          pattern = 'user:*';
          break;
        case 'story':
          pattern = 'story:*';
          break;
        case 'team':
          pattern = 'team:*';
          break;
        case 'notification':
          pattern = '*notification*';
          break;
        case 'all':
        default:
          pattern = '*';
      }

      const keys = await redis.keys(pattern);
      const limitedKeys = keys.slice(0, input.limit);

      const items = await Promise.all(
        limitedKeys.map(async (key) => {
          const ttl = await redis.ttl(key);
          return { key, ttl };
        })
      );

      // Sort by TTL (items with higher TTL are more important)
      items.sort((a, b) => b.ttl - a.ttl);

      return {
        type: input.type,
        total: keys.length,
        items,
      };
    }),
});

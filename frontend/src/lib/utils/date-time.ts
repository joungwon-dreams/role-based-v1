/**
 * Unified Date & Time Utilities
 * 통일된 날짜/시간 유틸리티
 *
 * All date/time formatting should use these utilities for consistency.
 * 모든 날짜/시간 포맷팅은 일관성을 위해 이 유틸리티를 사용해야 합니다.
 */

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ko from 'javascript-time-ago/locale/ko'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { enUS, ko as koLocale } from 'date-fns/locale'

// Initialize TimeAgo
TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(ko)

export type LocaleType = 'en' | 'kr'

/**
 * Unified date/time formatting utilities
 * 통일된 날짜/시간 포맷팅 유틸리티
 */
export const dateTimeUtils = {
  /**
   * Relative time (e.g., "2 hours ago", "2시간 전")
   * 상대 시간
   */
  relative: (date: Date | string, locale: LocaleType = 'en'): string => {
    const timeAgo = new TimeAgo(locale === 'en' ? 'en-US' : 'ko-KR')
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return timeAgo.format(dateObj)
  },

  /**
   * Full date/time (e.g., "Oct 13, 2025 11:09 AM", "2025년 10월 13일 오전 11:09")
   * 전체 날짜/시간
   */
  full: (date: Date | string, locale: LocaleType = 'en'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const localeObj = locale === 'en' ? enUS : koLocale
    return format(dateObj, locale === 'en' ? 'PPpp' : 'PPPPp', { locale: localeObj })
  },

  /**
   * Date only (e.g., "Oct 13, 2025", "2025년 10월 13일")
   * 날짜만
   */
  date: (date: Date | string, locale: LocaleType = 'en'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const localeObj = locale === 'en' ? enUS : koLocale
    return format(dateObj, locale === 'en' ? 'PP' : 'PPP', { locale: localeObj })
  },

  /**
   * Time only (e.g., "11:09 AM", "오전 11:09")
   * 시간만
   */
  time: (date: Date | string, locale: LocaleType = 'en'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const localeObj = locale === 'en' ? enUS : koLocale
    return format(dateObj, 'p', { locale: localeObj })
  },

  /**
   * ISO format (for database storage)
   * ISO 형식 (데이터베이스 저장용)
   */
  toISO: (date: Date): string => {
    return date.toISOString()
  },

  /**
   * Custom format
   * 커스텀 포맷
   */
  custom: (date: Date | string, formatStr: string, locale: LocaleType = 'en'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const localeObj = locale === 'en' ? enUS : koLocale
    return format(dateObj, formatStr, { locale: localeObj })
  },

  /**
   * Check if date is valid
   * 날짜가 유효한지 확인
   */
  isValid: (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
  }
}

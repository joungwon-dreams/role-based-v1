/**
 * useDateTime Hook
 * 날짜/시간 포맷팅을 위한 React Hook
 *
 * Provides locale-aware date/time formatting.
 * 로케일을 인식하는 날짜/시간 포맷팅을 제공합니다.
 */

'use client'

import { useLocale } from '@/lib/i18n'
import { dateTimeUtils, LocaleType } from '@/lib/utils/date-time'

export function useDateTime() {
  const { locale } = useLocale()
  const localeType = locale as LocaleType

  return {
    relative: (date: Date | string) => dateTimeUtils.relative(date, localeType),
    full: (date: Date | string) => dateTimeUtils.full(date, localeType),
    date: (date: Date | string) => dateTimeUtils.date(date, localeType),
    time: (date: Date | string) => dateTimeUtils.time(date, localeType),
    toISO: dateTimeUtils.toISO,
    custom: (date: Date | string, formatStr: string) =>
      dateTimeUtils.custom(date, formatStr, localeType),
    isValid: dateTimeUtils.isValid,
  }
}

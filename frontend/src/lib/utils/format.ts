/**
 * Common Formatting Utilities
 * 공통 포맷팅 유틸리티
 *
 * Reusable formatting functions for display.
 * 표시를 위한 재사용 가능한 포맷팅 함수.
 */

/**
 * Format number as currency
 * 숫자를 통화 형식으로 포맷
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format number with thousand separators
 * 천 단위 구분자가 있는 숫자 포맷
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format file size (bytes to human readable)
 * 파일 크기 포맷 (바이트를 사람이 읽을 수 있는 형식으로)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format percentage
 * 백분율 포맷
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Truncate text with ellipsis
 * 텍스트를 말줄임표로 자르기
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalize first letter
 * 첫 글자를 대문자로
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Capitalize all words
 * 모든 단어의 첫 글자를 대문자로
 */
export function capitalizeWords(text: string): string {
  if (!text) return ''
  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ')
}

/**
 * Convert camelCase to Title Case
 * camelCase를 Title Case로 변환
 */
export function camelToTitle(text: string): string {
  const result = text.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

/**
 * Convert snake_case to Title Case
 * snake_case를 Title Case로 변환
 */
export function snakeToTitle(text: string): string {
  return text
    .split('_')
    .map((word) => capitalize(word))
    .join(' ')
}

/**
 * Convert kebab-case to Title Case
 * kebab-case를 Title Case로 변환
 */
export function kebabToTitle(text: string): string {
  return text
    .split('-')
    .map((word) => capitalize(word))
    .join(' ')
}

/**
 * Format phone number (US format)
 * 전화번호 포맷 (미국 형식)
 */
export function formatPhoneUS(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

/**
 * Format phone number (Korean format)
 * 전화번호 포맷 (한국 형식)
 */
export function formatPhoneKR(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  // Mobile: 010-1234-5678
  if (cleaned.startsWith('010')) {
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`
    }
  }

  // Seoul: 02-1234-5678
  if (cleaned.startsWith('02')) {
    const match = cleaned.match(/^(\d{2})(\d{3,4})(\d{4})$/)
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`
    }
  }

  // Other: 031-123-4567
  const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }

  return phone
}

/**
 * Format credit card number
 * 신용카드 번호 포맷
 */
export function formatCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '')
  const match = cleaned.match(/.{1,4}/g)
  return match ? match.join(' ') : cardNumber
}

/**
 * Mask sensitive data (show only last N characters)
 * 민감한 데이터 마스킹 (마지막 N자만 표시)
 */
export function maskData(data: string, visibleChars: number = 4, maskChar: string = '*'): string {
  if (data.length <= visibleChars) return data
  const maskedPart = maskChar.repeat(data.length - visibleChars)
  const visiblePart = data.slice(-visibleChars)
  return maskedPart + visiblePart
}

/**
 * Format list as comma-separated string
 * 리스트를 쉼표로 구분된 문자열로 포맷
 */
export function formatList(items: string[], locale: string = 'en-US'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]

  return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items)
}

/**
 * Format duration (seconds to human readable)
 * 기간 포맷 (초를 사람이 읽을 수 있는 형식으로)
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const hours = Math.floor(seconds / 3600)
  const remainingMinutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  let result = `${hours}h`
  if (remainingMinutes > 0) result += ` ${remainingMinutes}m`
  if (remainingSeconds > 0) result += ` ${remainingSeconds}s`

  return result
}

/**
 * Pluralize word based on count
 * 개수에 따라 단어를 복수형으로
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular
  return plural || `${singular}s`
}

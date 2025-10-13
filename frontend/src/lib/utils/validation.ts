/**
 * Common Validation Utilities
 * 공통 유효성 검사 유틸리티
 *
 * Reusable validation functions for forms and data.
 * 폼 및 데이터에 대한 재사용 가능한 유효성 검사 함수.
 */

import { z } from 'zod'

/**
 * Email validation
 * 이메일 유효성 검사
 */
export const emailSchema = z.string().email('Invalid email address')

/**
 * Password validation (min 8 characters, at least one letter and one number)
 * 비밀번호 유효성 검사 (최소 8자, 문자와 숫자 각각 1개 이상)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

/**
 * Strong password validation (min 8 characters, letter, number, special character)
 * 강력한 비밀번호 유효성 검사 (최소 8자, 문자, 숫자, 특수문자 각각 1개 이상)
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')

/**
 * Phone number validation (simple)
 * 전화번호 유효성 검사 (간단한 버전)
 */
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')

/**
 * URL validation
 * URL 유효성 검사
 */
export const urlSchema = z.string().url('Invalid URL')

/**
 * Slug validation (lowercase, hyphen-separated)
 * Slug 유효성 검사 (소문자, 하이픈으로 구분)
 */
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')

/**
 * Date range validation
 * 날짜 범위 유효성 검사
 */
export function createDateRangeSchema() {
  return z
    .object({
      startDate: z.date(),
      endDate: z.date(),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: 'End date must be after start date',
      path: ['endDate'],
    })
}

/**
 * Required string validation (non-empty, trimmed)
 * 필수 문자열 유효성 검사 (비어있지 않음, 공백 제거)
 */
export const requiredStringSchema = z.string().trim().min(1, 'This field is required')

/**
 * Optional string validation (empty string converted to undefined)
 * 선택적 문자열 유효성 검사 (빈 문자열을 undefined로 변환)
 */
export const optionalStringSchema = z.string().trim().optional().or(z.literal(''))

/**
 * Positive number validation
 * 양수 유효성 검사
 */
export const positiveNumberSchema = z.number().positive('Must be a positive number')

/**
 * Non-negative number validation
 * 음수가 아닌 숫자 유효성 검사
 */
export const nonNegativeNumberSchema = z.number().nonnegative('Must be a non-negative number')

/**
 * File size validation (in bytes)
 * 파일 크기 유효성 검사 (바이트 단위)
 */
export function createFileSizeSchema(maxSize: number, message?: string) {
  return z
    .instanceof(File)
    .refine((file) => file.size <= maxSize, message || `File size must be less than ${maxSize} bytes`)
}

/**
 * File type validation
 * 파일 타입 유효성 검사
 */
export function createFileTypeSchema(allowedTypes: string[], message?: string) {
  return z
    .instanceof(File)
    .refine(
      (file) => allowedTypes.includes(file.type),
      message || `File type must be one of: ${allowedTypes.join(', ')}`
    )
}

/**
 * Image file validation (common image types, max 5MB)
 * 이미지 파일 유효성 검사 (일반 이미지 타입, 최대 5MB)
 */
export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
  .refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
    'File must be an image (JPEG, PNG, WebP, or GIF)'
  )

/**
 * Utility: Check if string is valid email
 * 유틸리티: 문자열이 유효한 이메일인지 확인
 */
export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

/**
 * Utility: Check if string is valid URL
 * 유틸리티: 문자열이 유효한 URL인지 확인
 */
export function isValidUrl(url: string): boolean {
  try {
    urlSchema.parse(url)
    return true
  } catch {
    return false
  }
}

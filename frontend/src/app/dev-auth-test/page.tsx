'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setTestUser } from '@/lib/dev/test-auth'
import { RoleLevel } from '@/types/auth'

/**
 * Dev-Only Page: Auto-login as specified role and redirect to dashboard
 * 개발 전용 페이지: 지정된 역할로 자동 로그인 후 대시보드로 리다이렉트
 *
 * Visit: /dashboard/dev-auth-test?role=user|premium|admin|super_admin
 */
export default function DevAuthTestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [roleName, setRoleName] = useState('Super Admin')

  useEffect(() => {
    const role = searchParams.get('role') || 'super_admin'

    let roleLevel: RoleLevel
    let displayName: string

    switch (role) {
      case 'user':
        roleLevel = RoleLevel.USER
        displayName = 'User'
        break
      case 'premium':
        roleLevel = RoleLevel.PREMIUM
        displayName = 'Premium User'
        break
      case 'admin':
        roleLevel = RoleLevel.ADMIN
        displayName = 'Admin'
        break
      case 'super_admin':
      default:
        roleLevel = RoleLevel.SUPER_ADMIN
        displayName = 'Super Admin'
        break
    }

    setRoleName(displayName)
    setTestUser(roleLevel)

    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 500)

    return () => clearTimeout(timer)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#25293c]">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 animate-spin text-[#7367f0]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Setting {roleName} User
        </h1>
        <p className="text-sm text-gray-500 dark:text-[#acabc1] mt-4">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  )
}

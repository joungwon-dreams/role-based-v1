/**
 * ProfileHeader Component
 *
 * Reusable profile header with banner, avatar, and user info
 * Based on Vuexy design system
 *
 * Features:
 * - Gradient banner (h-60, 240px)
 * - Large profile avatar (h-32 w-32) with border
 * - User name and metadata (role, location, join date)
 * - Connected/Follow button
 * - Responsive layout (mobile/tablet/desktop)
 * - Dark mode support
 *
 * Usage:
 * ```tsx
 * <ProfileHeader
 *   name="John Doe"
 *   role="UX Designer"
 *   location="Vatican City"
 *   joinDate="April 2021"
 *   avatarUrl="https://..."
 *   onConnectClick={() => {}}
 * />
 * ```
 */

'use client'

import { Users } from "lucide-react"

interface ProfileHeaderProps {
  /** User's full name */
  name: string
  /** User's role/job title */
  role?: string
  /** User's location */
  location?: string
  /** Join date text (e.g., "Joined April 2021") */
  joinDate?: string
  /** Avatar image URL */
  avatarUrl?: string
  /** Whether user is connected */
  isConnected?: boolean
  /** Callback when connect button is clicked */
  onConnectClick?: () => void
}

export function ProfileHeader({
  name,
  role = "UX Designer",
  location = "Vatican City",
  joinDate = "Joined April 2021",
  avatarUrl = "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/1.png",
  isConnected = true,
  onConnectClick
}: ProfileHeaderProps) {
  return (
    <>
      {/* Banner with gradient background */}
      <div
        className="relative h-60 mb-6 rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(to right, rgb(219, 185, 244), rgb(148, 187, 233))'
        }}
      >
        {/* Optional: Add banner image */}
        {/* <img src="/images/banner.png" alt="Banner" className="h-full w-full object-cover" /> */}
      </div>

      {/* Profile Header - Overlaps banner with negative margin */}
      <div className="relative -mt-24 mb-6 px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar - Large rounded square with border */}
          <div className="relative flex-shrink-0">
            <div
              className="h-32 w-32 rounded-lg overflow-hidden border-4 border-white dark:border-[#2f3349]"
              style={{
                background: 'linear-gradient(135deg, rgb(110, 72, 170), rgb(91, 149, 210))',
                boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)'
              }}
            >
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {/* Role */}
              {role && (
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {role}
                </span>
              )}

              {/* Location */}
              {location && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {location}
                </span>
              )}

              {/* Join Date */}
              {joinDate && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {joinDate}
                </span>
              )}
            </div>
          </div>

          {/* Connected/Follow Button */}
          <button
            onClick={onConnectClick}
            className="px-6 py-2 bg-[#7367f0] hover:bg-[#6258cc] text-white rounded-md transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <Users className="w-4 h-4" />
            {isConnected ? 'Connected' : 'Connect'}
          </button>
        </div>
      </div>
    </>
  )
}

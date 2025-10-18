/**
 * User Avatar Component
 *
 * Unified reusable component to display user avatar with name and email
 * Used across the application for consistent user representation
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Online status indicator (optional)
 * - Fallback to initials if no avatar
 * - Gradient background based on userId
 * - Dark mode support
 * - Role/email display options
 */

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  userId: string
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  role?: string
  size?: 'sm' | 'md' | 'lg'
  showEmail?: boolean
  showOnlineStatus?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

const textSizeClasses = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
}

const onlineIndicatorSizes = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
}

export function UserAvatar({
  userId,
  name,
  email,
  avatarUrl,
  role,
  size = 'md',
  showEmail = true,
  showOnlineStatus = false,
  className = '',
}: UserAvatarProps) {
  // Generate initials from name or email
  const getInitials = () => {
    if (name) {
      const parts = name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return userId.substring(0, 2).toUpperCase()
  }

  // Generate consistent color from userId
  const getAvatarColor = () => {
    const colors = [
      'from-[#7367f0] to-[#9e95f5]',
      'from-red-500 to-red-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
    ]
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  const displayName = name || email || 'Unknown User'
  const secondaryText = role || (showEmail && email && name ? email : null)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative flex-shrink-0">
        <Avatar className={sizeClasses[size]}>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback className={`bg-gradient-to-r ${getAvatarColor()} text-white font-semibold text-[11px]`}>
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Online Status Indicator */}
        {showOnlineStatus && (
          <span className={cn(
            'absolute bottom-0 right-0 bg-green-500 border-2 border-white dark:border-[#2f3349] rounded-full',
            onlineIndicatorSizes[size]
          )} />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <p className={cn(
          'font-medium text-gray-900 dark:text-white leading-tight truncate',
          textSizeClasses[size]
        )}>
          {displayName}
        </p>
        {secondaryText && (
          <p className={cn(
            'text-gray-500 dark:text-[#acabc1] leading-tight truncate',
            size === 'sm' ? 'text-[11px]' : size === 'md' ? 'text-xs' : 'text-sm'
          )}>
            {secondaryText}
          </p>
        )}
      </div>
    </div>
  )
}

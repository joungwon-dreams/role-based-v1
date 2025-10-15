/**
 * User Avatar Component
 *
 * Reusable component to display user avatar with name and email
 * Used across the application for consistent user representation
 */

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
  userId: string
  name?: string | null
  email?: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  showEmail?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function UserAvatar({
  userId,
  name,
  email,
  avatarUrl,
  size = 'md',
  showEmail = true,
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

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : null}
        <AvatarFallback className={`bg-gradient-to-r ${getAvatarColor()} text-white font-semibold`}>
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <p className={`font-semibold text-gray-900 dark:text-white ${textSizeClasses[size]}`}>
          {displayName}
        </p>
        {showEmail && email && (
          <p className={`text-gray-600 dark:text-[#acabc1] ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {email}
          </p>
        )}
      </div>
    </div>
  )
}

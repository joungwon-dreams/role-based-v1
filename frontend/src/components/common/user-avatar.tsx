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
 * - Hover menu with Profile, Send Message, Add Friend actions
 */

'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { User, MessageCircle, UserPlus, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'

interface UserAvatarProps {
  userId: string
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  role?: string
  size?: 'sm' | 'md' | 'lg'
  showEmail?: boolean
  showOnlineStatus?: boolean
  showHoverMenu?: boolean
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
  showHoverMenu = true,
  className = '',
}: UserAvatarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const { user: currentUser } = useAuth()

  // Check if this is the current user's avatar
  const isCurrentUser = currentUser?.userId === userId || currentUser?.email === email

  // Check friend status
  const { data: friendStatus } = trpc.connections.checkFriendship.useQuery(
    { friendId: userId },
    { enabled: !isCurrentUser && showHoverMenu }
  )

  // Add friend mutation
  const addFriend = trpc.connections.sendRequest.useMutation({
    onSuccess: () => {
      toast.success('Friend request sent!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send friend request')
    }
  })
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

  // Derive display name from name or email prefix
  const getDisplayName = () => {
    if (name) return name
    if (email) {
      // Extract name from email (e.g., "premium@willydreams.com" -> "Premium")
      const emailPrefix = email.split('@')[0]
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    }
    return 'User'
  }

  const displayName = getDisplayName()
  // Always show email as secondary text (unless role is provided)
  const secondaryText = role || (showEmail && email ? email : null)

  const isFriend = friendStatus?.status === 'accepted'

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/profile/${userId}`)
    setShowMenu(false)
  }

  const handleSendMessage = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/messages?to=${userId}`)
    setShowMenu(false)
  }

  const handleAddFriend = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isFriend) {
      addFriend.mutate({ userId: userId })
    }
    setShowMenu(false)
  }

  return (
    <div
      className={cn('relative flex items-center gap-3', className)}
      onMouseEnter={() => showHoverMenu && !isCurrentUser && setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
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

      {/* Hover Menu */}
      {showMenu && showHoverMenu && !isCurrentUser && (
        <div className="absolute left-0 top-full mt-0 z-50 w-48 rounded-lg border border-gray-200 dark:border-[#44485e] bg-white dark:bg-[#2f3349] shadow-lg">
          <div className="p-2">
            <button
              onClick={(e) => handleViewProfile(e)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-[#acabc1] hover:bg-gray-100 dark:hover:bg-[#44485e] transition-colors"
            >
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </button>
            <button
              onClick={(e) => handleSendMessage(e)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-[#acabc1] hover:bg-gray-100 dark:hover:bg-[#44485e] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Send Message</span>
            </button>
            <button
              onClick={(e) => handleAddFriend(e)}
              disabled={isFriend}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isFriend
                  ? 'text-green-600 dark:text-green-400 cursor-default'
                  : 'text-gray-700 dark:text-[#acabc1] hover:bg-gray-100 dark:hover:bg-[#44485e]'
              )}
            >
              {isFriend ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>My Friend</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Add Friend</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

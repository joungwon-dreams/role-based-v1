/**
 * UserAvatar Component
 *
 * Reusable avatar component with online status indicator
 * Based on Vuexy design system
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Online status indicator
 * - Fallback to initials if no avatar
 * - Gradient background for avatars
 * - Dark mode support
 *
 * Usage:
 * ```tsx
 * <UserAvatar
 *   name="John Doe"
 *   email="john@example.com"
 *   avatar="https://..."
 *   size="md"
 *   showOnlineStatus={true}
 * />
 * ```
 */

import { cn } from "@/lib/utils"

interface UserAvatarProps {
  /** User's full name */
  name: string
  /** User's email (shown below name) */
  email?: string
  /** User's role (alternative to email) */
  role?: string
  /** Avatar image URL */
  avatar?: string
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Show green online status indicator */
  showOnlineStatus?: boolean
  /** Additional CSS classes */
  className?: string
}

/** Size classes for avatar container */
const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12"
}

/** Size classes for online status indicator */
const onlineIndicatorSizes = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-3 w-3"
}

export function UserAvatar({
  name,
  email,
  role,
  avatar,
  size = "md",
  showOnlineStatus = true,
  className
}: UserAvatarProps) {
  // Generate default avatar URL using dicebear avatars API
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.toLowerCase().replace(/\s+/g, '')}`
  const avatarSrc = avatar || defaultAvatar

  /**
   * Extract initials from name (fallback if no avatar)
   * Example: "John Doe" → "JD"
   */
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Avatar Container */}
      <div className="relative flex-shrink-0">
        {avatar !== undefined ? (
          // Avatar with image
          <div className={cn(
            "rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500",
            sizeClasses[size]
          )}>
            <img
              src={avatarSrc}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          // Avatar with initials (fallback)
          <div className={cn(
            "rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold",
            sizeClasses[size],
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
          )}>
            {getInitials(name)}
          </div>
        )}

        {/* Online Status Indicator (green dot) */}
        {showOnlineStatus && (
          <span className={cn(
            "absolute bottom-0 right-0 bg-green-500 border-2 border-white dark:border-[#2f3349] rounded-full",
            onlineIndicatorSizes[size]
          )}></span>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h5 className={cn(
          "font-semibold text-gray-900 dark:text-white truncate",
          size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
        )}>
          {name}
        </h5>
        {email && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
        )}
        {role && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{role}</p>
        )}
      </div>
    </div>
  )
}

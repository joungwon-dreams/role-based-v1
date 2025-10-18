/**
 * Notifications Page - /notifications
 *
 * User notifications for various activities and events
 * Based on Vuexy design system matching Friends/Messages/Calendar layout
 */

'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, Archive, Filter, Heart, MessageCircle, UserPlus, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { UserAvatar } from '@/components/common/user-avatar'

type FilterType = 'all' | 'unread' | 'read'

// Extract user info from notification message
const extractUserInfo = (message: string): { userId: string; name: string | null; email: string | null } | null => {
  // Pattern: "email wants to..." or "name (email) wants to..." or "email liked..."
  const emailMatch = message.match(/^([^\s@]+@[^\s@]+\.[^\s@]+)/);
  if (emailMatch) {
    const email = emailMatch[1];
    // Try to extract name if format is "name (email)"
    const nameMatch = message.match(/^(.+?)\s*\(([^\s@]+@[^\s@]+\.[^\s@]+)\)/);
    if (nameMatch) {
      return {
        userId: email, // Using email as fallback userId
        name: nameMatch[1].trim(),
        email: nameMatch[2]
      };
    }
    return {
      userId: email,
      name: null,
      email: email
    };
  }
  return null;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'friend_request':
    case 'friend_accept':
      return <UserPlus className="w-5 h-5" />
    case 'message':
      return <MessageCircle className="w-5 h-5" />
    case 'story_like':
      return <Heart className="w-5 h-5" />
    case 'story_comment':
    case 'comment_reply':
      return <MessageCircle className="w-5 h-5" />
    case 'calendar_event':
      return <Calendar className="w-5 h-5" />
    case 'system':
    case 'admin_alert':
      return <AlertCircle className="w-5 h-5" />
    default:
      return <Bell className="w-5 h-5" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'friend_request':
    case 'friend_accept':
      return 'text-blue-500 dark:text-blue-400'
    case 'message':
      return 'text-purple-500 dark:text-purple-400'
    case 'story_like':
      return 'text-red-500 dark:text-red-400'
    case 'story_comment':
    case 'comment_reply':
      return 'text-green-500 dark:text-green-400'
    case 'calendar_event':
      return 'text-orange-500 dark:text-orange-400'
    case 'system':
    case 'admin_alert':
      return 'text-yellow-500 dark:text-yellow-400'
    default:
      return 'text-gray-500 dark:text-gray-400'
  }
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const router = useRouter()

  // tRPC queries and mutations
  const { data: notifications = [], refetch: refetchNotifications } = trpc.notifications.list.useQuery(
    { filter: activeFilter },
    { refetchOnMount: true }
  )

  const { data: unreadCount = 0, refetch: refetchUnreadCount } = trpc.notifications.unreadCount.useQuery(
    undefined,
    { refetchOnMount: true }
  )

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications()
      refetchUnreadCount()
    },
    onError: error => {
      toast.error(error.message || 'Failed to mark as read')
    },
  })

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications()
      refetchUnreadCount()
      toast.success('All notifications marked as read')
    },
    onError: error => {
      toast.error(error.message || 'Failed to mark all as read')
    },
  })

  const deleteNotification = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetchNotifications()
      refetchUnreadCount()
      toast.success('Notification deleted')
    },
    onError: error => {
      toast.error(error.message || 'Failed to delete notification')
    },
  })

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead.mutate({ id: notification.id })
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const filterOptions: { value: FilterType; label: string; count?: number }[] = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'read', label: 'Read' },
  ]

  return (
    <main className="pt-[5rem]">
      <div className="py-6">
        <div className="flex flex-wrap -mx-3">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 xl:w-72 px-3 mb-6 lg:mb-0">
            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-colors sticky top-24"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              {/* Mark All as Read Button */}
              <Button
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending || unreadCount === 0}
                className="w-full bg-[#7367f0] hover:bg-[#6658d3] text-white mb-6"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>

              {/* Filters */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-[#acabc1]">
                  <Filter className="w-4 h-4" />
                  Filters
                </div>

                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setActiveFilter(option.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeFilter === option.value
                        ? 'bg-[#7367f0]/10 text-[#7367f0] font-medium'
                        : 'text-gray-700 dark:text-[#acabc1] hover:bg-gray-100 dark:hover:bg-[#44485e]'
                    }`}
                  >
                    <span>{option.label}</span>
                    {option.count !== undefined && option.count > 0 && (
                      <Badge
                        variant="outline"
                        className={`ml-2 px-2 py-0 text-xs ${
                          option.value === 'unread'
                            ? 'bg-[#ff4c51] text-white border-[#ff4c51]'
                            : 'bg-gray-100 dark:bg-[#44485e] text-gray-700 dark:text-[#acabc1] border-gray-200 dark:border-[#44485e]'
                        }`}
                      >
                        {option.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {/* Help Text */}
              <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-[#25293c]">
                <p className="text-xs text-gray-600 dark:text-[#acabc1] leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Pro Tip:</strong> Stay updated with friend requests, messages, story interactions, and important events. Click on notifications to take action!
                </p>
              </div>
            </div>
          </div>

          {/* Main Notifications Area */}
          <div className="flex-1 px-3">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-1">
                    {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
                  </p>
                </div>
              </div>

              {/* Notifications List */}
              {notifications.length === 0 ? (
                <div
                  className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
                  style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                >
                  <div className="max-w-sm mx-auto">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-[#44485e] flex items-center justify-center">
                      <Bell className="h-8 w-8 text-gray-400 dark:text-[#acabc1]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No notifications yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                      {activeFilter === 'unread'
                        ? "You're all caught up! No unread notifications."
                        : "When you get notifications, they'll show up here."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`rounded-lg bg-white dark:bg-[#2f3349] p-4 transition-all cursor-pointer hover:shadow-md ${
                        !notification.isRead ? 'border-l-4 border-[#7367f0]' : ''
                      }`}
                      style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                    >
                      <div className="flex items-start gap-4">
                        {(() => {
                          const userInfo = extractUserInfo(notification.message);

                          return (
                            <>
                              {userInfo ? (
                                // Show UserAvatar if we can extract user info
                                <UserAvatar
                                  userId={userInfo.userId}
                                  name={userInfo.name}
                                  email={userInfo.email}
                                  size="md"
                                  showEmail={false}
                                />
                              ) : (
                                // Show icon if no user info
                                <div className={`p-2 rounded-full bg-gray-100 dark:bg-[#44485e] ${getNotificationColor(notification.type)}`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                              )}

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-[#acabc1]'}`}>
                                      {notification.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    {!notification.isRead && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          markAsRead.mutate({ id: notification.id })
                                        }}
                                        disabled={markAsRead.isPending}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteNotification.mutate({ id: notification.id })
                                      }}
                                      disabled={deleteNotification.isPending}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

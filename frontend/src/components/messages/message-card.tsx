/**
 * Message Card Component
 *
 * Displays a single message in the messages feed
 * Similar to Facebook Messenger / Instagram DM message card
 */

'use client'

import { Mail, MailOpen, Trash2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { UserAvatar } from '@/components/common/user-avatar'

interface MessageCardProps {
  message: {
    id: string
    senderId: string
    senderName: string | null
    senderEmail: string | null
    recipientId: string
    recipientName: string | null
    recipientEmail: string | null
    subject: string | null
    content: string
    isRead: boolean
    readAt: Date | null
    createdAt: Date
  }
  currentUserId?: string
  onView: () => void
  onDelete: () => void
  onMarkAsRead: () => void
}

export function MessageCard({
  message,
  currentUserId,
  onView,
  onDelete,
  onMarkAsRead,
}: MessageCardProps) {
  const isRecipient = message.recipientId === currentUserId
  const isSender = message.senderId === currentUserId
  const otherUserId = isRecipient ? message.senderId : message.recipientId
  const otherUserName = isRecipient ? message.senderName : message.recipientName
  const otherUserEmail = isRecipient ? message.senderEmail : message.recipientEmail

  return (
    <div
      onClick={onView}
      className={`rounded-lg bg-white dark:bg-[#2f3349] transition-all cursor-pointer hover:shadow-md ${
        !message.isRead && isRecipient ? 'border-l-4 border-[#7367f0]' : ''
      }`}
      style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
    >
      <div className="p-6">
        {/* Header - Sender/Recipient Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              userId={otherUserId}
              name={otherUserName}
              email={otherUserEmail}
              size="lg"
              showEmail={false}
            />

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                  {otherUserEmail}
                </p>
                {!message.isRead && isRecipient && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#7367f0] text-white">
                    New
                  </span>
                )}
                {isSender && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-[#44485e] text-gray-700 dark:text-[#acabc1]">
                    Sent
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Read/Unread Indicator */}
            {isRecipient && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (!message.isRead) {
                    onMarkAsRead()
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#44485e] transition-colors"
                title={message.isRead ? 'Read' : 'Mark as read'}
              >
                {message.isRead ? (
                  <MailOpen className="w-5 h-5 text-gray-400 dark:text-[#acabc1]" />
                ) : (
                  <Mail className="w-5 h-5 text-[#7367f0]" />
                )}
              </button>
            )}

            {/* Delete Button (only for sender) */}
            {isSender && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                title="Delete message"
              >
                <Trash2 className="w-5 h-5 text-gray-400 dark:text-[#acabc1] group-hover:text-red-500" />
              </button>
            )}
          </div>
        </div>

        {/* Subject */}
        {message.subject && (
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {message.subject}
          </h4>
        )}

        {/* Content Preview */}
        <p className="text-gray-700 dark:text-[#acabc1] line-clamp-2 mb-4">
          {message.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-[#acabc1]">
            <Clock className="w-4 h-4" />
            <span>
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
          </div>

          {message.isRead && message.readAt && isRecipient && (
            <div className="text-xs text-gray-500 dark:text-[#acabc1]">
              Read {formatDistanceToNow(new Date(message.readAt), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Messages Page - /messages
 *
 * Direct messaging between users (Facebook Messenger/Instagram DM style)
 * Based on Vuexy design system
 *
 * Features:
 * - Message list with conversations
 * - Left sidebar with filters
 * - Compose new message modal
 * - Mark as read/unread
 * - Delete messages
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Filter, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { MessageCard } from '@/components/messages/message-card'
import { MessageModal, type MessageFormData } from '@/components/messages/message-modal'
import { Badge } from '@/components/ui/badge'
import { authStore } from '@/store/auth.store'

type FilterType = 'all' | 'unread' | 'sent'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
  const [initialRecipientId, setInitialRecipientId] = useState<string | undefined>(undefined)

  // Subscribe to auth store changes
  useEffect(() => {
    const currentUser = authStore.getState().user
    setCurrentUserId(currentUser?.userId)

    const unsubscribe = authStore.subscribe(() => {
      const user = authStore.getState().user
      setCurrentUserId(user?.userId)
    })

    return unsubscribe
  }, [])

  // Handle query parameter for pre-filled recipient
  useEffect(() => {
    const toUserId = searchParams.get('to')
    if (toUserId) {
      setInitialRecipientId(toUserId)
      setSelectedMessage(null)
      setIsModalOpen(true)
    }
  }, [searchParams])

  // tRPC queries and mutations
  const { data: messages = [], refetch } = trpc.messages.list.useQuery(
    { filter: activeFilter },
    {
      refetchOnMount: true,
    }
  )

  const { data: unreadCount } = trpc.messages.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const createMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Message sent successfully')
      setIsModalOpen(false)
      setSelectedMessage(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message')
    },
  })

  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Message marked as read')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark message as read')
    },
  })

  const deleteMutation = trpc.messages.delete.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Message deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete message')
    },
  })

  // Handle compose new message
  const handleComposeNew = useCallback(() => {
    setSelectedMessage(null)
    setInitialRecipientId(undefined)
    setIsModalOpen(true)
  }, [])

  // Handle view message
  const handleViewMessage = useCallback((message: any) => {
    setSelectedMessage(message)
    setIsModalOpen(true)

    // Mark as read if current user is recipient and message is unread
    if (message.recipientId === currentUserId && !message.isRead) {
      markAsReadMutation.mutate({ id: message.id })
    }
  }, [currentUserId, markAsReadMutation])

  // Handle send message
  const handleSendMessage = useCallback(
    (data: MessageFormData) => {
      createMutation.mutate(data)
    },
    [createMutation]
  )

  // Handle delete message
  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      if (window.confirm('Are you sure you want to delete this message?')) {
        deleteMutation.mutate({ id: messageId })
      }
    },
    [deleteMutation]
  )

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    (messageId: string) => {
      markAsReadMutation.mutate({ id: messageId })
    },
    [markAsReadMutation]
  )

  const filterOptions: { value: FilterType; label: string; count?: number }[] = [
    { value: 'all', label: 'All Messages' },
    { value: 'unread', label: 'Unread', count: unreadCount?.count },
    { value: 'sent', label: 'Sent' },
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
              {/* Compose Message Button */}
              <Button
                onClick={handleComposeNew}
                className="w-full bg-[#7367f0] hover:bg-[#6658d3] text-white mb-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Compose Message
              </Button>

              {/* Filters */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-[#acabc1]">
                  <Filter className="w-4 h-4" />
                  Filters
                </div>

                {filterOptions.map((option) => (
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
                        className="ml-2 px-2 py-0 text-xs bg-[#7367f0] text-white border-[#7367f0]"
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
                  <strong className="text-gray-900 dark:text-white">Pro Tip:</strong> Click on a message to
                  view and reply. Messages are automatically marked as read when viewed.
                </p>
              </div>
            </div>
          </div>

          {/* Main Messages Area */}
          <div className="flex-1 px-3">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {filterOptions.find((f) => f.value === activeFilter)?.label}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-1">
                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                  </p>
                </div>
              </div>

              {/* Messages List */}
              {messages.length === 0 ? (
                <div
                  className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
                  style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                >
                  <div className="max-w-sm mx-auto">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-[#44485e] flex items-center justify-center">
                      <Mail className="h-8 w-8 text-gray-400 dark:text-[#acabc1]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No messages yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#acabc1] mb-4">
                      {activeFilter === 'unread'
                        ? "You don't have any unread messages."
                        : activeFilter === 'sent'
                        ? "You haven't sent any messages yet."
                        : 'No messages found. Start a conversation!'}
                    </p>
                    <Button
                      onClick={handleComposeNew}
                      variant="outline"
                      className="border-[#7367f0] text-[#7367f0] hover:bg-[#7367f0]/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Compose New Message
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      currentUserId={currentUserId}
                      onView={() => handleViewMessage(message)}
                      onDelete={() => handleDeleteMessage(message.id)}
                      onMarkAsRead={() => handleMarkAsRead(message.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Modal */}
        <MessageModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          message={selectedMessage}
          initialRecipientId={initialRecipientId}
          onSend={handleSendMessage}
          onDelete={selectedMessage && selectedMessage.senderId === currentUserId ? () => handleDeleteMessage(selectedMessage.id) : undefined}
          isLoading={createMutation.isPending || deleteMutation.isPending}
          currentUserId={currentUserId}
        />
      </div>
    </main>
  )
}

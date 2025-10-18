/**
 * Message Modal Component
 *
 * Modal for composing new messages or viewing existing messages
 * Similar to Facebook Messenger / Instagram DM compose modal
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Trash2, Send } from 'lucide-react'
import { trpc } from '@/lib/trpc/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const messageFormSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  subject: z.string().max(255).optional(),
  content: z.string().min(1, 'Message content is required'),
})

export type MessageFormData = z.infer<typeof messageFormSchema>

interface MessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message?: {
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
  } | null
  onSend: (data: MessageFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  currentUserId?: string
}

export function MessageModal({
  open,
  onOpenChange,
  message,
  onSend,
  onDelete,
  isLoading = false,
  currentUserId,
}: MessageModalProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<string>('')

  // Get list of users for recipient selection
  const { data: userListData } = trpc.user.list.useQuery(
    { limit: 100, offset: 0 },
    {
      enabled: open && !message, // Only fetch when composing new message
    }
  )
  const users = userListData?.users || []

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      recipientId: '',
      subject: '',
      content: '',
    },
  })

  // Reset form when modal opens/closes or message changes
  useEffect(() => {
    if (open) {
      if (message) {
        // View mode - show message details
        setValue('recipientId', message.recipientId)
        setValue('subject', message.subject || '')
        setValue('content', message.content)
        setSelectedRecipient(message.recipientId)
      } else {
        // Compose mode - clear form
        reset()
        setSelectedRecipient('')
      }
    }
  }, [open, message, reset, setValue])

  const onSubmit = (data: MessageFormData) => {
    onSend(data)
  }

  const handleRecipientChange = (value: string) => {
    setSelectedRecipient(value)
    setValue('recipientId', value)
  }

  const isViewMode = !!message
  const isSender = message?.senderId === currentUserId
  const isRecipient = message?.recipientId === currentUserId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#2f3349]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {isViewMode ? 'View Message' : 'Compose Message'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-[#acabc1]">
            {isViewMode
              ? `${isSender ? 'Sent to' : 'From'} ${isSender ? message.recipientName : message.senderName || 'Unknown User'}`
              : 'Send a direct message to another user'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Recipient Selection */}
          <div className="space-y-2">
            <Label htmlFor="recipientId" className="text-gray-900 dark:text-white">
              To
            </Label>
            {isViewMode ? (
              <Input
                value={isSender ? message.recipientName || message.recipientEmail || 'Unknown' : message.senderName || message.senderEmail || 'Unknown'}
                disabled
                className="bg-gray-50 dark:bg-[#25293c] border-gray-200 dark:border-[#44485e]"
              />
            ) : (
              <>
                <Select value={selectedRecipient} onValueChange={handleRecipientChange}>
                  <SelectTrigger className="border-gray-200 dark:border-[#44485e]">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => user.id !== currentUserId) // Don't show current user
                      .map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.recipientId && (
                  <p className="text-sm text-red-500">{errors.recipientId.message}</p>
                )}
              </>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-900 dark:text-white">
              Subject (Optional)
            </Label>
            <Input
              id="subject"
              placeholder="Enter subject..."
              {...register('subject')}
              disabled={isViewMode}
              className="border-gray-200 dark:border-[#44485e]"
            />
            {errors.subject && (
              <p className="text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-900 dark:text-white">
              Message
            </Label>
            <Textarea
              id="content"
              placeholder="Write your message..."
              rows={8}
              {...register('content')}
              disabled={isViewMode}
              className="border-gray-200 dark:border-[#44485e] resize-none"
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Read Status */}
          {isViewMode && isRecipient && (
            <div className="text-sm text-gray-600 dark:text-[#acabc1]">
              {message.isRead
                ? `Read on ${new Date(message.readAt!).toLocaleString()}`
                : 'Unread'}
            </div>
          )}

          <DialogFooter className="gap-2">
            {isViewMode ? (
              <>
                {onDelete && isSender && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDelete}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#7367f0] hover:bg-[#6658d3]"
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

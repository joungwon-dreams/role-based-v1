/**
 * Story Comments Component
 *
 * Displays comments for a story with ability to add new comments
 */

'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Send, Image, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/common/user-avatar'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'

interface StoryCommentsProps {
  storyId: string
  currentUserId?: string
  currentUserName?: string
  currentUserEmail?: string
}

export function StoryComments({ storyId, currentUserId, currentUserName, currentUserEmail }: StoryCommentsProps) {
  const [newComment, setNewComment] = useState('')

  // Fetch comments
  const { data: comments = [], isLoading } = trpc.comments.list.useQuery(
    { storyId },
    { enabled: !!storyId }
  )

  const utils = trpc.useContext()

  // Create comment mutation
  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setNewComment('')
      utils.comments.list.invalidate({ storyId })
      utils.comments.getCount.invalidate({ storyId })
      toast.success('Comment added!')
    },
    onError: (error) => {
      toast.error('Failed to add comment: ' + error.message)
    },
  })

  // Delete comment mutation
  const deleteMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ storyId })
      utils.comments.getCount.invalidate({ storyId })
      toast.success('Comment deleted!')
    },
    onError: (error) => {
      toast.error('Failed to delete comment: ' + error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    createMutation.mutate({ storyId, content: newComment })
  }

  const handleDelete = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate({ id: commentId })
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading comments...</div>
  }

  return (
    <div className="border-t border-gray-200 dark:border-[#44485e] bg-gray-100 dark:bg-[#25293c]">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-[#2f3349]">
        <div className="relative">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[80px] resize-none pr-4 pb-12 bg-white dark:bg-[#2f3349]"
            rows={2}
            disabled={createMutation.isLoading}
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-[#acabc1] dark:hover:text-white"
              title="Upload image"
            >
              <Image className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-[#acabc1] dark:hover:text-white"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-[#acabc1] dark:hover:text-white"
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <div className="absolute bottom-3 right-3">
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || createMutation.isLoading}
              className="bg-[#7367f0] hover:bg-[#6658d3]"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="p-4 space-y-4">
          {comments.map((comment) => {
            const createdAt = typeof comment.createdAt === 'string'
              ? new Date(comment.createdAt)
              : comment.createdAt
            const isOwner = currentUserId === comment.authorId

            return (
              <div key={comment.id} className="pb-4 border-b-2 border-gray-200 dark:border-[#44485e] last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <UserAvatar
                    userId={comment.authorId}
                    name={comment.authorName || undefined}
                    email={comment.authorEmail || undefined}
                    size="sm"
                    showEmail={true}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-[#acabc1]">
                      {formatDistanceToNow(createdAt, { addSuffix: true })}
                    </span>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-[#acabc1] whitespace-pre-wrap pl-0">
                  {comment.content}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Story Comments Component
 *
 * Displays comments for a story with ability to add new comments
 */

'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/common/user-avatar'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'

interface StoryCommentsProps {
  storyId: string
  currentUserId?: string
}

export function StoryComments({ storyId, currentUserId }: StoryCommentsProps) {
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
    <div className="border-t border-gray-200 dark:border-[#44485e]">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="p-4 space-y-4">
          {comments.map((comment) => {
            const createdAt = typeof comment.createdAt === 'string' 
              ? new Date(comment.createdAt) 
              : comment.createdAt
            const isOwner = currentUserId === comment.authorId

            return (
              <div key={comment.id} className="flex gap-3">
                <UserAvatar
                  userId={comment.authorId}
                  name={comment.authorName || undefined}
                  email={comment.authorEmail || undefined}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-[#3e4256] rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {comment.authorName || comment.authorEmail || 'Unknown User'}
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
                    <p className="text-sm text-gray-700 dark:text-[#acabc1] whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[#acabc1] mt-1 ml-3">
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-[#44485e]">
        <div className="flex gap-3">
          <UserAvatar
            userId={currentUserId || ''}
            size="sm"
          />
          <div className="flex-1 flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[40px] resize-none"
              rows={1}
              disabled={createMutation.isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || createMutation.isLoading}
              className="bg-[#7367f0] hover:bg-[#6658d3]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

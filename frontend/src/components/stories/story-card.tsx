/**
 * Story Card Component
 *
 * Facebook/Instagram inspired story card with author info, content, and actions
 */

'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Edit, Trash2, Globe, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/common/user-avatar'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { StoryComments } from './story-comments'

interface StoryCardProps {
  story: {
    id: string
    authorId: string
    authorName?: string
    authorEmail?: string
    title: string
    content: string
    isPublished: boolean
    publishedAt: Date | string | null
    createdAt: Date | string
    updatedAt: Date | string
  }
  currentUserId?: string
  onEdit?: () => void
  onDelete?: () => void
  onTogglePublish?: () => void
}

export function StoryCard({
  story,
  currentUserId,
  onEdit,
  onDelete,
  onTogglePublish,
}: StoryCardProps) {
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const isOwner = currentUserId === story.authorId
  const createdAt = typeof story.createdAt === 'string' ? new Date(story.createdAt) : story.createdAt

  // Fetch like status
  const { data: isLiked = false } = trpc.likes.isLiked.useQuery(
    { storyId: story.id },
    { enabled: !!story.id }
  )

  // Fetch like count
  const { data: likesCount = 0 } = trpc.likes.getCount.useQuery(
    { storyId: story.id },
    { enabled: !!story.id }
  )

  // Fetch comment count
  const { data: commentsCount = 0 } = trpc.comments.getCount.useQuery(
    { storyId: story.id },
    { enabled: !!story.id }
  )

  // Like toggle mutation
  const utils = trpc.useContext()
  const likeMutation = trpc.likes.toggle.useMutation({
    onSuccess: () => {
      // Invalidate queries to refetch data
      utils.likes.isLiked.invalidate({ storyId: story.id })
      utils.likes.getCount.invalidate({ storyId: story.id })
    },
    onError: (error) => {
      toast.error('Failed to update like: ' + error.message)
    },
  })

  const handleLike = () => {
    likeMutation.mutate({ storyId: story.id })
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  return (
    <div
      className="rounded-lg bg-white dark:bg-[#2f3349] transition-colors overflow-hidden"
      style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
    >
      {/* Header - Author Info */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#44485e]">
        <div className="flex items-center gap-3">
          <UserAvatar
            userId={story.authorId}
            name={story.authorName}
            email={story.authorEmail}
            size="md"
            showEmail={true}
          />

          {/* Metadata */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isOwner && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0 border-[#7367f0] text-[#7367f0]"
                >
                  You
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#acabc1]">
              <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
              <span>•</span>
              {story.isPublished ? (
                <Globe className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Story
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTogglePublish}>
                {story.isPublished ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Story
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{story.title}</h2>
        <div className="text-gray-700 dark:text-[#acabc1] whitespace-pre-wrap">{story.content}</div>
      </div>

      {/* Actions Bar */}
      <div className="px-4 pb-2">
        {likesCount > 0 || commentsCount > 0 ? (
          <div className="flex items-center justify-between py-2 text-sm text-gray-600 dark:text-[#acabc1]">
            {likesCount > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex items-center -space-x-1">
                  <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                    <Heart className="h-3 w-3 text-white fill-white" />
                  </div>
                </div>
                <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
              </div>
            )}
            {commentsCount > 0 && (
              <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
            )}
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-[#44485e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={isLiked ? 'text-red-500' : 'text-gray-600 dark:text-[#acabc1]'}
              onClick={handleLike}
              disabled={likeMutation.isLoading}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              Like
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={showComments ? 'text-[#7367f0]' : 'text-gray-600 dark:text-[#acabc1]'}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Comment
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-[#acabc1]">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <div className="flex items-center gap-1">
            {isOwner && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#7367f0] hover:text-[#6658d3]"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 ${saved ? 'text-[#7367f0]' : 'text-gray-600 dark:text-[#acabc1]'}`}
              onClick={handleSave}
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badge for Drafts */}
      {!story.isPublished && isOwner && (
        <div className="px-4 pb-3">
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400">
            Draft - Not visible to others
          </Badge>
        </div>
      )}

      {/* Comments Section */}
      {showComments && <StoryComments storyId={story.id} currentUserId={currentUserId} />}
    </div>
  )
}

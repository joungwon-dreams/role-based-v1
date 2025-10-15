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

interface StoryCardProps {
  story: {
    id: string
    authorId: string
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
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)

  const isOwner = currentUserId === story.authorId
  const createdAt = typeof story.createdAt === 'string' ? new Date(story.createdAt) : story.createdAt

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
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
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#7367f0] to-[#9e95f5] flex items-center justify-center text-white font-semibold">
            {story.authorId.charAt(0).toUpperCase()}
          </div>

          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Author Name</p>
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
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-[#44485e]">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 ${liked ? 'text-red-500' : 'text-gray-600 dark:text-[#acabc1]'}`}
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
          Like
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-gray-600 dark:text-[#acabc1]">
          <MessageCircle className="h-4 w-4 mr-2" />
          Comment
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-gray-600 dark:text-[#acabc1]">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`px-2 ${saved ? 'text-[#7367f0]' : 'text-gray-600 dark:text-[#acabc1]'}`}
          onClick={handleSave}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Status Badge for Drafts */}
      {!story.isPublished && isOwner && (
        <div className="px-4 pb-3">
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400">
            Draft - Not visible to others
          </Badge>
        </div>
      )}
    </div>
  )
}

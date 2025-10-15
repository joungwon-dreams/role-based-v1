/**
 * Story Card Component
 *
 * Facebook/Instagram inspired story card with author info, content, and actions
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Edit, Trash2, Globe, Lock, Smile } from 'lucide-react'
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
  currentUserName?: string
  currentUserEmail?: string
  onEdit?: () => void
  onDelete?: () => void
  onTogglePublish?: () => void
}

export function StoryCard({
  story,
  currentUserId,
  currentUserName,
  currentUserEmail,
  onEdit,
  onDelete,
  onTogglePublish,
}: StoryCardProps) {
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showEmotionPicker, setShowEmotionPicker] = useState(false)
  const emotionPickerRef = useRef<HTMLDivElement>(null)

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

  // Fetch reactions
  const { data: reactions = [] } = trpc.reactions.list.useQuery(
    { storyId: story.id },
    { enabled: !!story.id }
  )

  // Auto-expand comments if there are any
  useEffect(() => {
    if (commentsCount > 0) {
      setShowComments(true)
    }
  }, [commentsCount])

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

  // Reaction toggle mutation
  const reactionMutation = trpc.reactions.toggle.useMutation({
    onSuccess: () => {
      // Invalidate reactions query to refetch data
      utils.reactions.list.invalidate({ storyId: story.id })
    },
    onError: (error) => {
      toast.error('Failed to update reaction: ' + error.message)
    },
  })

  const handleLike = () => {
    likeMutation.mutate({ storyId: story.id })
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  const handleEmotionSelect = (emoji: string) => {
    reactionMutation.mutate({ storyId: story.id, emoji })
    setShowEmotionPicker(false)
  }

  // Click outside to close emotion picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emotionPickerRef.current && !emotionPickerRef.current.contains(event.target as Node)) {
        setShowEmotionPicker(false)
      }
    }

    if (showEmotionPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmotionPicker])

  const availableEmotions = ['❤️', '👍', '😂', '😮', '😢', '😡', '🎉', '🔥']

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
        {(likesCount > 0 || commentsCount > 0 || reactions.length > 0) ? (
          <div className="flex items-center justify-between py-2 text-sm text-gray-600 dark:text-[#acabc1]">
            <div className="flex items-center gap-2">
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
              {reactions.map(({ emoji, users }) => (
                <div key={emoji} className="relative group">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span className="text-sm">{emoji}</span>
                  </div>
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 min-w-[200px]">
                    <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg p-2 max-h-[200px] overflow-y-auto">
                      {users.map((user, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1 text-xs">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-[#7367f0] to-[#9e95f5] text-white font-semibold text-[9px] flex items-center justify-center">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-gray-300 text-[10px]">{user.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {commentsCount > 0 && (
              <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
            )}
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-[#44485e]">
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
          <div className="relative" ref={emotionPickerRef}>
            <Button
              variant="ghost"
              size="sm"
              className={showEmotionPicker ? 'text-[#7367f0]' : 'text-gray-600 dark:text-[#acabc1]'}
              onClick={() => setShowEmotionPicker(!showEmotionPicker)}
            >
              <Smile className="h-4 w-4 mr-2" />
              Emotion
            </Button>
            {showEmotionPicker && (
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-[#2f3349] rounded-lg shadow-lg border border-gray-200 dark:border-[#44485e] p-2 z-10">
                <div className="grid grid-cols-4 gap-2">
                  {availableEmotions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleEmotionSelect(emoji)}
                      className="text-lg hover:bg-gray-100 dark:hover:bg-[#44485e] rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
      {showComments && (
        <StoryComments
          storyId={story.id}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserEmail={currentUserEmail}
        />
      )}
    </div>
  )
}

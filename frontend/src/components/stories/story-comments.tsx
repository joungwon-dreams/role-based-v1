/**
 * Story Comments Component
 *
 * Displays comments for a story with ability to add new comments
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Send, Image, Paperclip, Smile, Edit, X, Check, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setSelectedImages([])
      setSelectedFiles([])
      utils.comments.list.invalidate({ storyId })
      utils.comments.getCount.invalidate({ storyId })
      toast.success('Comment added!')
    },
    onError: (error) => {
      toast.error('Failed to add comment: ' + error.message)
    },
  })

  // Update comment mutation
  const updateMutation = trpc.comments.update.useMutation({
    onSuccess: () => {
      setEditingId(null)
      setEditContent('')
      utils.comments.list.invalidate({ storyId })
      toast.success('Comment updated!')
    },
    onError: (error) => {
      toast.error('Failed to update comment: ' + error.message)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    // Convert files to base64
    const attachments: Array<{
      type: 'image' | 'file'
      url: string
      name: string
      size: number
    }> = []

    // Convert images to base64
    for (const img of selectedImages) {
      const base64 = await fileToBase64(img)
      attachments.push({
        type: 'image',
        url: base64,
        name: img.name,
        size: img.size,
      })
    }

    // Convert files to base64
    for (const file of selectedFiles) {
      const base64 = await fileToBase64(file)
      attachments.push({
        type: 'file',
        url: base64,
        name: file.name,
        size: file.size,
      })
    }

    createMutation.mutate({
      storyId,
      content: newComment,
      attachments: attachments.length > 0 ? attachments : undefined,
    })
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleEdit = (commentId: string, currentContent: string) => {
    setEditingId(commentId)
    setEditContent(currentContent)
  }

  const calculateRows = (text: string) => {
    const lines = text.split('\n').length
    const minRows = 2
    const maxRows = 10
    return Math.min(Math.max(lines, minRows), maxRows)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleUpdate = (commentId: string) => {
    if (!editContent.trim()) return
    updateMutation.mutate({
      id: commentId,
      content: editContent,
    })
  }

  const handleDelete = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate({ id: commentId })
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = newComment
      const before = text.substring(0, start)
      const after = text.substring(end)
      setNewComment(before + emoji + after)

      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length
        textarea.focus()
      }, 0)
    } else {
      setNewComment(newComment + emoji)
    }
    setShowEmojiPicker(false)
  }

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setSelectedImages(prev => [...prev, ...imageFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const availableEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
    '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
    '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
    '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️',
    '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆',
    '🙏', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
    '⭐', '🌟', '✨', '💫', '🔥', '💯', '✅', '❌',
  ]

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading comments...</div>
  }

  return (
    <div className="border-t border-gray-200 dark:border-[#44485e] bg-gray-100 dark:bg-[#25293c]">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="p-4">
        <Textarea
          ref={textareaRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[60px] max-h-[60px] resize-none bg-white dark:bg-[#2f3349] overflow-y-auto"
          rows={2}
          disabled={createMutation.isLoading}
        />

        {/* Image/File Previews */}
        {(selectedImages.length > 0 || selectedFiles.length > 0) && (
          <div className="mt-2 space-y-2">
            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={img.name}
                      className="h-16 w-16 object-cover rounded border border-gray-300 dark:border-[#44485e]"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedFiles.length > 0 && (
              <div className="space-y-1">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-[#44485e] rounded text-sm">
                    <span className="truncate flex-1 text-gray-700 dark:text-[#acabc1]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="ml-2 text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-[#acabc1] dark:hover:text-white"
              title="Upload image"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-[#acabc1] dark:hover:text-white"
              title="Attach file"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="relative" ref={emojiPickerRef}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${showEmojiPicker ? 'text-[#7367f0]' : 'text-gray-500 hover:text-gray-700 dark:text-[#acabc1] dark:hover:text-white'}`}
                title="Add emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-5 w-5" />
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#2f3349] rounded-lg shadow-xl border border-gray-200 dark:border-[#44485e] p-3 z-50 w-[320px] max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-8 gap-1">
                    {availableEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-2xl hover:bg-gray-100 dark:hover:bg-[#44485e] rounded p-1 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-[#acabc1] dark:hover:text-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(comment.id, comment.content)}
                            disabled={updateMutation.isLoading || editingId === comment.id}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(comment.id)}
                            disabled={deleteMutation.isLoading}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Edit Mode */}
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="bg-white dark:bg-[#2f3349] resize-none"
                      rows={calculateRows(editContent)}
                      disabled={updateMutation.isLoading}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(comment.id)}
                        disabled={!editContent.trim() || updateMutation.isLoading}
                        className="bg-[#7367f0] hover:bg-[#6658d3]"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updateMutation.isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-[#acabc1] whitespace-pre-wrap pl-0">
                    {comment.content}
                  </p>
                )}

                {/* Attachments */}
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {/* Images */}
                    {comment.attachments.filter((a: any) => a.type === 'image').length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {comment.attachments
                          .filter((a: any) => a.type === 'image')
                          .map((attachment: any, idx: number) => (
                            <img
                              key={idx}
                              src={attachment.url}
                              alt={attachment.name}
                              className="max-w-xs rounded border border-gray-300 dark:border-[#44485e] cursor-pointer hover:opacity-90"
                              onClick={() => window.open(attachment.url, '_blank')}
                            />
                          ))}
                      </div>
                    )}

                    {/* Files */}
                    {comment.attachments.filter((a: any) => a.type === 'file').length > 0 && (
                      <div className="space-y-1">
                        {comment.attachments
                          .filter((a: any) => a.type === 'file')
                          .map((attachment: any, idx: number) => (
                            <a
                              key={idx}
                              href={attachment.url}
                              download={attachment.name}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#44485e] rounded text-sm text-gray-700 dark:text-[#acabc1] hover:bg-gray-200 dark:hover:bg-[#4f5370] transition-colors"
                            >
                              <Paperclip className="h-4 w-4" />
                              <span className="truncate flex-1">{attachment.name}</span>
                              <span className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </span>
                            </a>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Story Modal Component
 *
 * Create and edit stories with Vuexy design
 */

'use client'

import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface StoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  story?: {
    id: string
    title: string
    content: string
    slug: string
    isPublished: boolean
  } | null
  onSave: (data: StoryFormData) => void
  onDelete?: () => void
  isLoading?: boolean
}

export interface StoryFormData {
  title: string
  content: string
  slug: string
  isPublished: boolean
}

export function StoryModal({
  open,
  onOpenChange,
  story,
  onSave,
  onDelete,
  isLoading,
}: StoryModalProps) {
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    content: '',
    slug: '',
    isPublished: false,
  })

  const [errors, setErrors] = useState<Partial<StoryFormData>>({})

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        content: story.content,
        slug: story.slug,
        isPublished: story.isPublished,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        slug: '',
        isPublished: false,
      })
    }
    setErrors({})
  }, [story, open])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }))
    }
  }

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }))
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<StoryFormData> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSave(formData)
  }

  const handleClose = () => {
    onOpenChange(false)
    setFormData({
      title: '',
      content: '',
      slug: '',
      isPublished: false,
    })
    setErrors({})
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        showClose={false}
        className="w-full sm:max-w-[540px] p-0 bg-white dark:bg-[#2f3349] border-gray-200 dark:border-[#44485e]"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-gray-200 dark:border-[#44485e]">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  {story ? 'Edit Story' : 'Create New Story'}
                </SheetTitle>
                <SheetDescription className="text-sm text-gray-600 dark:text-[#acabc1] mt-1">
                  {story ? 'Update your story details' : 'Share your thoughts with the community'}
                </SheetDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-900 dark:text-white">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter story title..."
                className={`bg-white dark:bg-[#2f3349] ${
                  errors.title ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium text-gray-900 dark:text-white">
                URL Slug
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="url-friendly-slug"
                className={`bg-white dark:bg-[#2f3349] font-mono text-sm ${
                  errors.slug ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-[#acabc1]">
                Auto-generated from title. You can customize it.
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium text-gray-900 dark:text-white">
                Content *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Share your story..."
                rows={10}
                className={`bg-white dark:bg-[#2f3349] resize-none ${
                  errors.content ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-[#acabc1]">
                {formData.content.length} characters
              </p>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-[#44485e] bg-gray-50 dark:bg-[#25293c]">
              <div className="flex-1">
                <Label htmlFor="publish" className="text-sm font-medium text-gray-900 dark:text-white">
                  Publish Story
                </Label>
                <p className="text-xs text-gray-500 dark:text-[#acabc1] mt-1">
                  Make this story visible to everyone
                </p>
              </div>
              <Switch
                id="publish"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPublished: checked }))
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-[#44485e] bg-gray-50 dark:bg-[#25293c]">
            <div className="flex items-center justify-between gap-3">
              <div>
                {story && onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onDelete}
                    disabled={isLoading}
                    className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#7367f0] hover:bg-[#6658d3] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{story ? 'Update Story' : 'Create Story'}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Create Team Page - /teams/create
 *
 * Team creation form
 * Based on Vuexy design system
 *
 * Features:
 * - Team name, description, and visibility
 * - Form validation
 * - Success/error handling
 * - Redirect to team page after creation
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'

export default function CreateTeamPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'private' | 'public',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = trpc.team.teams.create.useMutation({
    onSuccess: (data) => {
      toast.success('Team created successfully!')
      router.push(`/teams/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create team')
    },
  })

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Team name must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      createMutation.mutate({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        visibility: formData.visibility,
      })
    },
    [formData, validateForm, createMutation]
  )

  const handleCancel = useCallback(() => {
    router.push('/teams')
  }, [router])

  return (
    <main className="pt-[5rem]">
      <div className="py-6 max-w-3xl mx-auto px-3">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4 text-gray-600 dark:text-[#acabc1] hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-[#7367f0]/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#7367f0]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Create New Team
              </h1>
              <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                Set up a team to collaborate with your colleagues
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div
          className="rounded-lg bg-white dark:bg-[#2f3349] p-6 transition-colors"
          style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 dark:text-white">
                Team Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Marketing Team, Engineering Department"
                className={`${
                  errors.name
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : 'border-gray-300 dark:border-[#44485e]'
                } bg-white dark:bg-[#25293c] text-gray-900 dark:text-white`}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
              <p className="text-xs text-gray-600 dark:text-[#acabc1]">
                {formData.name.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900 dark:text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your team's purpose and goals"
                className={`${
                  errors.description
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : 'border-gray-300 dark:border-[#44485e]'
                } bg-white dark:bg-[#25293c] text-gray-900 dark:text-white min-h-[100px]`}
                maxLength={500}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
              <p className="text-xs text-gray-600 dark:text-[#acabc1]">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-gray-900 dark:text-white">
                Visibility <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: 'private' | 'public') =>
                  handleInputChange('visibility', value)
                }
              >
                <SelectTrigger
                  id="visibility"
                  className="border-gray-300 dark:border-[#44485e] bg-white dark:bg-[#25293c] text-gray-900 dark:text-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Private</span>
                      <span className="text-xs text-gray-600 dark:text-[#acabc1]">
                        Only invited members can see and join
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Public</span>
                      <span className="text-xs text-gray-600 dark:text-[#acabc1]">
                        Anyone can see and request to join
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600 dark:text-[#acabc1]">
                {formData.visibility === 'private'
                  ? 'Team will be visible only to invited members'
                  : 'Team will be discoverable by all users'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-[#44485e]">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#7367f0] hover:bg-[#6658d3] text-white"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending}
                className="border-gray-300 dark:border-[#44485e] text-gray-700 dark:text-[#acabc1] hover:bg-gray-100 dark:hover:bg-[#44485e]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Help Info */}
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            What happens after creating a team?
          </h3>
          <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
            <li>• You'll become the team owner with full permissions</li>
            <li>• You can invite members via email</li>
            <li>• Create shared calendars, stories, and communication channels</li>
            <li>• Manage team settings and member roles anytime</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

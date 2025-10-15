/**
 * Stories Page - /stories
 *
 * Social feed with Facebook/Instagram inspired design
 * Based on Vuexy design system with calendar-style CRUD
 *
 * Features:
 * - Story feed with cards
 * - Left sidebar with filters
 * - Create/Edit story modal
 * - Draft and published status
 * - Delete confirmation
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { StoryCard } from '@/components/stories/story-card'
import { StoryModal, type StoryFormData } from '@/components/stories/story-modal'
import { Badge } from '@/components/ui/badge'
import { authStore } from '@/store/auth.store'

type FilterType = 'all' | 'own' | 'published' | 'drafts'

export default function StoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
  const [currentUserName, setCurrentUserName] = useState<string | undefined>(undefined)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(undefined)

  // Subscribe to auth store changes
  useEffect(() => {
    // Initialize with current user
    const currentUser = authStore.getState().user
    setCurrentUserId(currentUser?.userId)
    setCurrentUserName(currentUser?.name)
    setCurrentUserEmail(currentUser?.email)

    // Subscribe to changes
    const unsubscribe = authStore.subscribe(() => {
      const user = authStore.getState().user
      setCurrentUserId(user?.userId)
      setCurrentUserName(user?.name)
      setCurrentUserEmail(user?.email)
    })

    return unsubscribe
  }, [])

  // tRPC queries and mutations
  const { data: stories = [], refetch } = trpc.stories.list.useQuery(
    { filter: activeFilter },
    {
      refetchOnMount: true,
    }
  )

  const createMutation = trpc.stories.create.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Story created successfully')
      setIsModalOpen(false)
      setSelectedStory(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create story')
    },
  })

  const updateMutation = trpc.stories.update.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Story updated successfully')
      setIsModalOpen(false)
      setSelectedStory(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update story')
    },
  })

  const deleteMutation = trpc.stories.delete.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Story deleted successfully')
      setIsModalOpen(false)
      setSelectedStory(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete story')
    },
  })

  const togglePublishMutation = trpc.stories.togglePublish.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Story status updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update story status')
    },
  })

  // Handle create new story
  const handleCreateNew = useCallback(() => {
    setSelectedStory(null)
    setIsModalOpen(true)
  }, [])

  // Handle edit story
  const handleEditStory = useCallback((story: any) => {
    setSelectedStory(story)
    setIsModalOpen(true)
  }, [])

  // Handle save story
  const handleSaveStory = useCallback(
    (data: StoryFormData) => {
      if (selectedStory?.id) {
        // Update existing story
        updateMutation.mutate({
          id: selectedStory.id,
          data,
        })
      } else {
        // Create new story
        createMutation.mutate(data)
      }
    },
    [selectedStory, createMutation, updateMutation]
  )

  // Handle delete story
  const handleDeleteStory = useCallback(() => {
    if (selectedStory?.id && window.confirm('Are you sure you want to delete this story?')) {
      deleteMutation.mutate({ id: selectedStory.id })
    }
  }, [selectedStory, deleteMutation])

  // Handle toggle publish
  const handleTogglePublish = useCallback(
    (storyId: string) => {
      togglePublishMutation.mutate({ id: storyId })
    },
    [togglePublishMutation]
  )

  const filterOptions: { value: FilterType; label: string; count?: number }[] = [
    { value: 'all', label: 'All Stories' },
    { value: 'published', label: 'Published' },
    { value: 'own', label: 'My Stories' },
    { value: 'drafts', label: 'Drafts' },
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
              {/* Create Story Button */}
              <Button
                onClick={handleCreateNew}
                className="w-full bg-[#7367f0] hover:bg-[#6658d3] text-white mb-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Story
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
                    {option.count !== undefined && (
                      <Badge
                        variant="outline"
                        className="ml-2 px-2 py-0 text-xs"
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
                  <strong className="text-gray-900 dark:text-white">Pro Tip:</strong> Use drafts to
                  save work in progress. Publish when you're ready to share with everyone!
                </p>
              </div>
            </div>
          </div>

          {/* Main Feed Area */}
          <div className="flex-1 px-3">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {filterOptions.find((f) => f.value === activeFilter)?.label}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-1">
                    {stories.length} {stories.length === 1 ? 'story' : 'stories'}
                  </p>
                </div>
              </div>

              {/* Stories Feed */}
              {stories.length === 0 ? (
                <div
                  className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
                  style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                >
                  <div className="max-w-sm mx-auto">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-[#44485e] flex items-center justify-center">
                      <Plus className="h-8 w-8 text-gray-400 dark:text-[#acabc1]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No stories yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#acabc1] mb-4">
                      {activeFilter === 'own'
                        ? "You haven't created any stories yet. Click the button above to get started!"
                        : activeFilter === 'drafts'
                        ? "You don't have any drafts. Create a story and save it as draft to see it here."
                        : 'No stories available. Be the first to share!'}
                    </p>
                    {activeFilter === 'own' || activeFilter === 'drafts' ? (
                      <Button
                        onClick={handleCreateNew}
                        variant="outline"
                        className="border-[#7367f0] text-[#7367f0] hover:bg-[#7367f0]/10"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Story
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      currentUserId={currentUserId}
                      currentUserName={currentUserName}
                      currentUserEmail={currentUserEmail}
                      onEdit={() => handleEditStory(story)}
                      onDelete={() => {
                        setSelectedStory(story)
                        handleDeleteStory()
                      }}
                      onTogglePublish={() => handleTogglePublish(story.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Story Modal */}
        <StoryModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          story={selectedStory}
          onSave={handleSaveStory}
          onDelete={selectedStory ? handleDeleteStory : undefined}
          isLoading={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
        />
      </div>
    </main>
  )
}

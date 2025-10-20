/**
 * Teams Page - /teams
 *
 * Team management and collaboration hub
 * Based on Vuexy design system
 *
 * Features:
 * - Team list with cards
 * - Left sidebar with filters and create button
 * - Team member count and role display
 * - Navigation to team details
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Users, Filter, ChevronRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { authStore } from '@/store/auth.store'

type FilterType = 'all' | 'my-teams' | 'public'

export default function TeamsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [canCreateTeam, setCanCreateTeam] = useState(false)

  // Check if user has permission to create teams
  useEffect(() => {
    const checkPermission = () => {
      const user = authStore.getState().user
      const hasPermission = user?.permissions?.includes('team:create:own') || false
      setCanCreateTeam(hasPermission)
    }

    checkPermission()
    const unsubscribe = authStore.subscribe(checkPermission)
    return unsubscribe
  }, [])

  // tRPC queries
  const { data: teams = [], refetch, isLoading } = trpc.team.teams.list.useQuery(undefined, {
    refetchOnMount: true,
  })

  // Filter teams based on active filter
  const filteredTeams = teams.filter((team) => {
    if (activeFilter === 'my-teams') {
      return team.isMember
    }
    if (activeFilter === 'public') {
      return team.visibility === 'public'
    }
    return true // 'all'
  })

  const handleCreateTeam = useCallback(() => {
    router.push('/teams/create')
  }, [router])

  const handleTeamClick = useCallback(
    (teamId: string) => {
      router.push(`/teams/${teamId}`)
    },
    [router]
  )

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Teams' },
    { value: 'my-teams', label: 'My Teams' },
    { value: 'public', label: 'Public Teams' },
  ]

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'admin':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'member':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'viewer':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

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
              {/* Create Team Button */}
              {canCreateTeam ? (
                <Button
                  onClick={handleCreateTeam}
                  className="w-full bg-[#7367f0] hover:bg-[#6658d3] text-white mb-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              ) : (
                <div className="mb-6">
                  <Button
                    disabled
                    className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed mb-2"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Premium Feature
                  </Button>
                  <p className="text-xs text-center text-gray-600 dark:text-[#acabc1]">
                    Upgrade to Premium to create teams
                  </p>
                </div>
              )}

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
                  </button>
                ))}
              </div>

              {/* Help Text */}
              <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-[#25293c]">
                <p className="text-xs text-gray-600 dark:text-[#acabc1] leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Teams:</strong> Collaborate with
                  your colleagues on shared calendars, stories, and channels.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-3">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {filterOptions.find((f) => f.value === activeFilter)?.label}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-1">
                    {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'}
                  </p>
                </div>
              </div>

              {/* Teams Grid */}
              {isLoading ? (
                <div
                  className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
                  style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                >
                  <p className="text-gray-600 dark:text-[#acabc1]">Loading teams...</p>
                </div>
              ) : filteredTeams.length === 0 ? (
                <div
                  className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
                  style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                >
                  <div className="max-w-sm mx-auto">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-[#44485e] flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-400 dark:text-[#acabc1]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No teams yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#acabc1] mb-4">
                      {activeFilter === 'my-teams'
                        ? "You're not a member of any teams yet. Create one or ask to join!"
                        : 'No teams available. Be the first to create a team!'}
                    </p>
                    {activeFilter === 'my-teams' || activeFilter === 'all' ? (
                      canCreateTeam ? (
                        <Button
                          onClick={handleCreateTeam}
                          variant="outline"
                          className="border-[#7367f0] text-[#7367f0] hover:bg-[#7367f0]/10"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Team
                        </Button>
                      ) : (
                        <div className="text-center">
                          <Button
                            disabled
                            variant="outline"
                            className="border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Premium Feature
                          </Button>
                          <p className="text-xs text-gray-600 dark:text-[#acabc1] mt-2">
                            Upgrade to Premium to create teams
                          </p>
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTeams.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => handleTeamClick(team.id)}
                      className="rounded-lg bg-white dark:bg-[#2f3349] p-6 transition-all cursor-pointer hover:shadow-lg group"
                      style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                    >
                      {/* Team Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#7367f0] transition-colors">
                            {team.name}
                          </h3>
                          {team.description && (
                            <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-1 line-clamp-2">
                              {team.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-[#acabc1] flex-shrink-0 ml-2 group-hover:text-[#7367f0] transition-colors" />
                      </div>

                      {/* Team Info */}
                      <div className="flex items-center gap-3 text-sm">
                        {/* Member Count */}
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-[#acabc1]">
                          <Users className="w-4 h-4" />
                          <span>{team.memberCount || 0} members</span>
                        </div>

                        {/* User Role Badge */}
                        {team.isMember && team.memberRole && (
                          <Badge className={`px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor(team.memberRole)}`}>
                            {team.memberRole}
                          </Badge>
                        )}

                        {/* Visibility Badge */}
                        {team.visibility === 'public' && (
                          <Badge variant="outline" className="px-2 py-0.5 text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

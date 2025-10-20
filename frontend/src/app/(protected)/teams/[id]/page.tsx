/**
 * Team Detail Page - /teams/[id]
 *
 * Team overview with member management
 * Based on Vuexy design system
 *
 * Features:
 * - Team information display
 * - Member list with roles
 * - Owner/admin controls
 * - Team settings access
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  ArrowLeft, Users, Settings, UserPlus, Crown, Shield, Eye,
  Calendar, FileText, MessageSquare, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { authStore } from '@/store/auth.store'

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)

  // Subscribe to auth store
  useEffect(() => {
    const user = authStore.getState().user
    setCurrentUserId(user?.userId)

    const unsubscribe = authStore.subscribe(() => {
      const user = authStore.getState().user
      setCurrentUserId(user?.userId)
    })

    return unsubscribe
  }, [])

  // Fetch team details
  const { data: team, isLoading, error } = trpc.team.teams.getById.useQuery(
    { id: teamId },
    {
      refetchOnMount: true,
      retry: false,
    }
  )

  const handleBack = () => {
    router.push('/teams')
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            <Crown className="w-3 h-3 mr-1" />
            Owner
          </Badge>
        )
      case 'admin':
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )
      case 'member':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Users className="w-3 h-3 mr-1" />
            Member
          </Badge>
        )
      case 'viewer':
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
            <Eye className="w-3 h-3 mr-1" />
            Viewer
          </Badge>
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <main className="pt-[5rem]">
        <div className="py-6 max-w-6xl mx-auto px-3">
          <div
            className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
            style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Team Not Found
            </h3>
            <p className="text-sm text-gray-600 dark:text-[#acabc1] mb-4">
              {error.message || 'You do not have access to this team or it does not exist.'}
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="pt-[5rem]">
        <div className="py-6 max-w-6xl mx-auto px-3">
          <div className="text-center">
            <p className="text-gray-600 dark:text-[#acabc1]">Loading team...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!team) {
    return null
  }

  const isOwner = team.ownerId === currentUserId
  const isAdmin = team.myRole === 'admin'
  const canManage = isOwner || isAdmin

  return (
    <main className="pt-[5rem]">
      <div className="py-6 max-w-6xl mx-auto px-3">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-gray-600 dark:text-[#acabc1] hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-lg bg-[#7367f0]/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#7367f0]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {team.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                  {team.description || 'No description'}
                </p>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-gray-300 dark:border-[#44485e]"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Members
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 dark:border-[#44485e]"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Team Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-colors"
            style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#acabc1]">Total Members</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  {team.members?.length || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-[#7367f0]" />
            </div>
          </div>

          <div
            className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-colors"
            style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#acabc1]">Your Role</p>
                <div className="mt-2">{getRoleBadge(team.myRole)}</div>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div
            className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-colors"
            style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#acabc1]">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Team Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Calendar */}
          <button
            onClick={() => router.push(`/calendar?team=${teamId}`)}
            className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-all hover:shadow-lg group text-left"
            style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#7367f0] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Team Calendar
            </h3>
            <p className="text-xs text-gray-600 dark:text-[#acabc1]">
              View and manage team events
            </p>
          </button>

          {/* Stories */}
          <button
            onClick={() => router.push(`/stories?team=${teamId}`)}
            className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-all hover:shadow-lg group text-left"
            style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#7367f0] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Team Stories
            </h3>
            <p className="text-xs text-gray-600 dark:text-[#acabc1]">
              Share updates and news
            </p>
          </button>

          {/* Members */}
          <button
            onClick={() => {
              // Scroll to members section
              document.getElementById('members-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-all hover:shadow-lg group text-left"
            style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#7367f0] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Team Members
            </h3>
            <p className="text-xs text-gray-600 dark:text-[#acabc1]">
              Manage team members
            </p>
          </button>

          {/* Messages */}
          <button
            onClick={() => router.push(`/messages?team=${teamId}`)}
            className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-all hover:shadow-lg group text-left"
            style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#7367f0] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Team Messages
            </h3>
            <p className="text-xs text-gray-600 dark:text-[#acabc1]">
              Team communication
            </p>
          </button>
        </div>

        {/* Members List */}
        <div
          id="members-section"
          className="rounded-lg bg-white dark:bg-[#2f3349] p-6 transition-colors"
          style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team Members
          </h2>

          <div className="space-y-3">
            {team.members && team.members.length > 0 ? (
              team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[#25293c] hover:bg-gray-100 dark:hover:bg-[#2a2e42] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#7367f0]/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-[#7367f0]">
                        {member.userName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.userName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-[#acabc1]">
                        {member.userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getRoleBadge(member.role)}
                    <p className="text-xs text-gray-600 dark:text-[#acabc1]">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 dark:text-[#acabc1] mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                  No members yet. Invite people to join your team!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

/**
 * Team Page - /teams/[id]
 *
 * Team workspace with fixed navigation (Band.us style)
 * Default view: Team Stories
 *
 * Features:
 * - Fixed team header with navigation tabs
 * - Stories feed as default view
 * - Quick access to Calendar, Members, Settings
 * - Team context throughout
 */

'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  ArrowLeft, Users, Settings, UserPlus, Crown, Shield, Eye,
  Calendar, FileText, MessageSquare, Image, MoreVertical, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { authStore } from '@/store/auth.store'
import { useLocale } from '@/lib/i18n'

type TabType = 'stories' | 'calendar' | 'members' | 'photos' | 'settings'

export default function TeamPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLocale()
  const teamId = params.id as string
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'stories')

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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    router.push(`/teams/${teamId}?tab=${tab}`, { scroll: false })
  }

  const tabs = [
    { id: 'stories' as TabType, label: t('team.stories'), icon: FileText },
    { id: 'calendar' as TabType, label: t('team.calendar'), icon: Calendar },
    { id: 'members' as TabType, label: t('team.members'), icon: Users },
    { id: 'photos' as TabType, label: t('team.photos'), icon: Image },
  ]

  return (
    <main className="pt-[5rem]">
      {/* Team Cover & Header - Band.us style */}
      <div className="relative">
        {/* Cover Image */}
        <div
          className="h-48 bg-gradient-to-r from-[#7367f0] to-[#9e95f5]"
          style={{
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />

        {/* Team Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <div className="max-w-6xl mx-auto flex items-end justify-between">
            <div className="flex items-end gap-4">
              {/* Team Avatar */}
              <div className="h-20 w-20 rounded-xl bg-white dark:bg-[#2f3349] shadow-lg flex items-center justify-center border-4 border-white dark:border-[#2f3349]">
                <Users className="h-10 w-10 text-[#7367f0]" />
              </div>

              {/* Team Name & Info */}
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                  {team.name}
                </h1>
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {t('team.memberCount', { count: String(team.members?.length || 0) })}
                  </span>
                  <span>•</span>
                  <span>{getRoleBadge(team.myRole)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => router.push('/teams')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('team.backToList')}
              </Button>
              {canManage && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('team.invite')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleTabChange('settings')}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Tab Navigation - Band.us style */}
      <div className="sticky top-[5rem] z-10 bg-white dark:bg-[#2f3349] border-b border-gray-200 dark:border-[#44485e] shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                    isActive
                      ? 'text-[#7367f0] border-b-2 border-[#7367f0]'
                      : 'text-gray-600 dark:text-[#acabc1] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto py-6 px-3">
        {/* Stories Tab - Default */}
        {activeTab === 'stories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('team.teamStories')}
              </h2>
              <Button className="bg-[#7367f0] hover:bg-[#6658d3] text-white">
                <FileText className="w-4 h-4 mr-2" />
                {t('team.write')}
              </Button>
            </div>

            {/* Empty State */}
            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              <FileText className="w-16 h-16 text-gray-400 dark:text-[#acabc1] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('team.noStories')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#acabc1] mb-4">
                {t('team.firstPostPrompt')}
              </p>
              <Button className="bg-[#7367f0] hover:bg-[#6658d3] text-white">
                {t('team.writeFirstPost')}
              </Button>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('team.teamCalendar')}
              </h2>
              <Button className="bg-[#7367f0] hover:bg-[#6658d3] text-white">
                <Calendar className="w-4 h-4 mr-2" />
                {t('team.addEvent')}
              </Button>
            </div>

            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              <Calendar className="w-16 h-16 text-gray-400 dark:text-[#acabc1] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('team.teamCalendar')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                {t('team.calendarShare')}
              </p>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('team.teamMembers')} ({team.members?.length || 0})
              </h2>
              {canManage && (
                <Button className="bg-[#7367f0] hover:bg-[#6658d3] text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('team.inviteMembers')}
                </Button>
              )}
            </div>

            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] p-6 transition-colors"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              <div className="space-y-3">
                {team.members && team.members.length > 0 ? (
                  team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[#25293c] hover:bg-gray-100 dark:hover:bg-[#2a2e42] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-[#7367f0]/10 flex items-center justify-center">
                          <span className="text-lg font-medium text-[#7367f0]">
                            {member.userName?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {member.userName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                            {member.userEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getRoleBadge(member.role)}
                        <p className="text-xs text-gray-600 dark:text-[#acabc1]">
                          {new Date(member.joinedAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 dark:text-[#acabc1] mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                      {t('team.noMembers')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('team.teamPhotos')}
              </h2>
              <Button className="bg-[#7367f0] hover:bg-[#6658d3] text-white">
                <Image className="w-4 h-4 mr-2" />
                {t('team.uploadPhoto')}
              </Button>
            </div>

            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              <Image className="w-16 h-16 text-gray-400 dark:text-[#acabc1] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('team.photoAlbum')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                {t('team.sharePhotos')}
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('team.teamSettings')}
            </h2>

            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] p-6 transition-colors"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('team.teamName')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{team.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('team.teamDescription')}
                  </label>
                  <p className="text-gray-600 dark:text-[#acabc1]">
                    {team.description || t('team.noDescription')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('team.createdAt')}
                  </label>
                  <p className="text-gray-600 dark:text-[#acabc1]">
                    {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {canManage && (
                  <div className="pt-4 border-t border-gray-200 dark:border-[#44485e]">
                    <Button variant="outline" className="border-gray-300 dark:border-[#44485e]">
                      {t('team.editTeamInfo')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}


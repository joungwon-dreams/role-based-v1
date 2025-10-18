/**
 * User Profile Page - /profile/[userId]
 *
 * Dynamic profile page to view other users' profiles
 * Shows user information, activity, and connection status
 */

'use client'

import { useParams } from 'next/navigation'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/react'
import { useAuth } from '@/hooks/useAuth'
import {
  User,
  MessageCircle,
  UserPlus,
  Check,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Building
} from 'lucide-react'
import { toast } from 'sonner'

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const { user: currentUser } = useAuth()

  // Fetch user data
  const { data: user, isLoading } = trpc.user.getPublicProfile.useQuery(
    { userId: userId },
    { enabled: !!userId }
  )

  // Check friend status
  const { data: friendStatus } = trpc.connections.checkFriendship.useQuery(
    { friendId: userId },
    { enabled: !!userId && currentUser?.userId !== userId }
  )

  // Add friend mutation
  const addFriend = trpc.connections.sendRequest.useMutation({
    onSuccess: () => {
      toast.success('Friend request sent!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send friend request')
    }
  })

  if (isLoading) {
    return (
      <main className="pt-[5rem]">
        <div className="py-6 flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500 dark:text-[#acabc1]">Loading...</div>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="pt-[5rem]">
        <div className="py-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              User not found
            </h2>
            <p className="text-gray-600 dark:text-[#acabc1]">
              The user you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const isCurrentUser = currentUser?.userId === userId
  const isFriend = friendStatus?.status === 'accepted'
  const isPending = friendStatus?.status === 'pending'

  return (
    <main className="pt-[5rem]">
      <div className="py-6">
        {/* Profile Header */}
        <div
          className="rounded-lg bg-white dark:bg-[#2f3349] mb-6 overflow-hidden"
          style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
        >
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-[#7367f0] to-[#9e95f5]" />

          {/* User Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-32 w-32 rounded-full border-4 border-white dark:border-[#2f3349] bg-gradient-to-r from-[#7367f0] to-[#9e95f5] flex items-center justify-center text-white text-4xl font-bold">
                    {user.name
                      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : user.email?.substring(0, 2).toUpperCase()}
                  </div>
                </div>

                {/* Name and Info */}
                <div className="mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {user.name || user.email?.split('@')[0]}
                  </h1>
                  {user.jobTitle && (
                    <p className="text-gray-600 dark:text-[#acabc1] mt-1">
                      {user.jobTitle}
                      {user.company && ` at ${user.company}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isCurrentUser && (
                <div className="flex gap-3 mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `/messages?to=${userId}`}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>

                  {isFriend ? (
                    <Button
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                      disabled
                    >
                      <Check className="h-4 w-4" />
                      Friends
                    </Button>
                  ) : isPending ? (
                    <Button
                      className="flex items-center gap-2"
                      disabled
                    >
                      <UserPlus className="h-4 w-4" />
                      Request Pending
                    </Button>
                  ) : (
                    <Button
                      className="flex items-center gap-2 bg-[#7367f0] hover:bg-[#6658d3]"
                      onClick={() => addFriend.mutate({ userId })}
                      disabled={addFriend.isPending}
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Friend
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About Section */}
          <div
            className="rounded-lg bg-white dark:bg-[#2f3349] p-6"
            style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h2>

            <div className="space-y-4">
              {user.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-[#acabc1]">{user.email}</span>
                </div>
              )}

              {user.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-[#acabc1]">{user.location}</span>
                </div>
              )}

              {user.jobTitle && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-[#acabc1]">{user.jobTitle}</span>
                </div>
              )}

              {user.company && (
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-[#acabc1]">{user.company}</span>
                </div>
              )}

              {user.createdAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-[#acabc1]">
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {user.bio && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#44485e]">
                  <p className="text-sm text-gray-700 dark:text-[#acabc1]">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activity / Posts Section */}
          <div className="lg:col-span-2">
            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] p-6"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activity
              </h2>

              <div className="text-center py-12">
                <User className="h-16 w-16 mx-auto text-gray-300 dark:text-[#44485e] mb-4" />
                <p className="text-gray-500 dark:text-[#acabc1]">
                  No activity to show yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

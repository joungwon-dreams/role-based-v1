/**
 * Friends Page - /friends
 *
 * Facebook/Instagram inspired friend management
 * Based on Vuexy design system matching Messages/Stories/Calendar layout
 *
 * Features:
 * - Friend list with connections
 * - Left sidebar with filters
 * - Friend requests (pending)
 * - Friend suggestions
 * - Add/Remove friends
 */

'use client'

import { useState, useCallback } from 'react'
import { Plus, Filter, Users, UserPlus, UserMinus, UserCheck, UserX, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/common/user-avatar'
import { Badge } from '@/components/ui/badge'

type FilterType = 'all' | 'requests' | 'suggestions'

export default function FriendsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // tRPC queries and mutations
  const { data: friends = [], refetch: refetchFriends } = trpc.connections.list.useQuery(undefined, {
    refetchOnMount: true,
  })

  const { data: pendingRequests = [], refetch: refetchRequests } =
    trpc.connections.getPendingRequests.useQuery(undefined, {
      refetchOnMount: true,
    })

  const { data: suggested = [], refetch: refetchSuggested } = trpc.connections.getSuggested.useQuery(
    { limit: 12 },
    {
      refetchOnMount: true,
    }
  )

  const sendRequest = trpc.connections.sendRequest.useMutation({
    onSuccess: () => {
      refetchSuggested()
      refetchRequests()
      toast.success('Friend request sent')
    },
    onError: error => {
      toast.error(error.message || 'Failed to send friend request')
    },
  })

  const acceptRequest = trpc.connections.acceptRequest.useMutation({
    onSuccess: () => {
      refetchRequests()
      refetchFriends()
      toast.success('Friend request accepted')
    },
    onError: error => {
      toast.error(error.message || 'Failed to accept friend request')
    },
  })

  const rejectRequest = trpc.connections.rejectRequest.useMutation({
    onSuccess: () => {
      refetchRequests()
      toast.success('Friend request declined')
    },
    onError: error => {
      toast.error(error.message || 'Failed to decline friend request')
    },
  })

  const unfriend = trpc.connections.unfriend.useMutation({
    onSuccess: () => {
      refetchFriends()
      toast.success('Friend removed')
    },
    onError: error => {
      toast.error(error.message || 'Failed to remove friend')
    },
  })

  // Handle unfriend with confirmation
  const handleUnfriend = useCallback(
    (friendId: string, friendName: string) => {
      if (window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
        unfriend.mutate({ userId: friendId })
      }
    },
    [unfriend]
  )

  // Determine what to show based on active filter
  const getDisplayData = () => {
    switch (activeFilter) {
      case 'requests':
        return {
          title: 'Friend Requests',
          count: pendingRequests.length,
          items: pendingRequests,
          type: 'requests' as const,
        }
      case 'suggestions':
        return {
          title: 'Suggested Friends',
          count: suggested.length,
          items: suggested,
          type: 'suggestions' as const,
        }
      default:
        return {
          title: 'My Friends',
          count: friends.length,
          items: friends,
          type: 'friends' as const,
        }
    }
  }

  const displayData = getDisplayData()

  const filterOptions: { value: FilterType; label: string; count?: number }[] = [
    { value: 'all', label: 'My Friends', count: friends.length },
    { value: 'requests', label: 'Requests', count: pendingRequests.length },
    { value: 'suggestions', label: 'Suggestions', count: suggested.length },
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
              {/* Add Friend Button */}
              <Button
                onClick={() => setActiveFilter('suggestions')}
                className="w-full bg-[#7367f0] hover:bg-[#6658d3] text-white mb-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Friends
              </Button>

              {/* Filters */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-[#acabc1]">
                  <Filter className="w-4 h-4" />
                  Filters
                </div>

                {filterOptions.map(option => (
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
                    {option.count !== undefined && option.count > 0 && (
                      <Badge
                        variant="outline"
                        className={`ml-2 px-2 py-0 text-xs ${
                          option.value === 'requests'
                            ? 'bg-[#ff4c51] text-white border-[#ff4c51]'
                            : 'bg-gray-100 dark:bg-[#44485e] text-gray-700 dark:text-[#acabc1] border-gray-200 dark:border-[#44485e]'
                        }`}
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
                  <strong className="text-gray-900 dark:text-white">Pro Tip:</strong> Connect
                  with people you know and expand your network. Manage friend requests and
                  discover new connections!
                </p>
              </div>
            </div>
          </div>

          {/* Main Friends Area */}
          <div className="flex-1 px-3">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {displayData.title}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-1">
                    {displayData.count} {displayData.count === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>

              {/* Friends List */}
              {displayData.items.length === 0 ? (
                <div
                  className="rounded-lg bg-white dark:bg-[#2f3349] p-12 text-center transition-colors"
                  style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                >
                  <div className="max-w-sm mx-auto">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-[#44485e] flex items-center justify-center">
                      {displayData.type === 'requests' ? (
                        <UserPlus className="h-8 w-8 text-gray-400 dark:text-[#acabc1]" />
                      ) : displayData.type === 'suggestions' ? (
                        <Users className="h-8 w-8 text-gray-400 dark:text-[#acabc1]" />
                      ) : (
                        <Users className="h-8 w-8 text-gray-400 dark:text-[#acabc1]" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {displayData.type === 'requests'
                        ? 'No pending requests'
                        : displayData.type === 'suggestions'
                        ? 'No suggestions available'
                        : 'No friends yet'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#acabc1] mb-4">
                      {displayData.type === 'requests'
                        ? "You don't have any friend requests at the moment"
                        : displayData.type === 'suggestions'
                        ? 'Check back later for friend suggestions'
                        : 'Start connecting with people you know!'}
                    </p>
                    {displayData.type !== 'requests' && (
                      <Button
                        onClick={() => setActiveFilter('suggestions')}
                        variant="outline"
                        className="border-[#7367f0] text-[#7367f0] hover:bg-[#7367f0]/10"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Find Friends
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayData.type === 'friends' &&
                    (displayData.items as typeof friends).map(friend => (
                      <div
                        key={friend.id}
                        className="rounded-lg bg-white dark:bg-[#2f3349] p-6 transition-colors"
                        style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <UserAvatar
                              userId={friend.id}
                              name={friend.name}
                              email={friend.email}
                              image={friend.image}
                              size="lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {friend.name || friend.email}
                              </h3>
                              {friend.jobTitle && (
                                <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                                  {friend.jobTitle}
                                  {friend.company && ` at ${friend.company}`}
                                </p>
                              )}
                              {friend.location && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {friend.location}
                                </p>
                              )}
                              {friend.bio && (
                                <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-2">
                                  {friend.bio}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnfriend(friend.id, friend.name || friend.email || 'this friend')}
                              disabled={unfriend.isPending}
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Unfriend
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-[#7367f0] hover:bg-[#6658d3]"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {displayData.type === 'requests' &&
                    (displayData.items as typeof pendingRequests).map(request => (
                      <div
                        key={request.id}
                        className="rounded-lg bg-white dark:bg-[#2f3349] p-6 transition-colors"
                        style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <UserAvatar
                              userId={request.requesterId}
                              name={request.requesterName}
                              email={request.requesterEmail}
                              image={request.requesterImage}
                              size="lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {request.requesterName || request.requesterEmail}
                              </h3>
                              {request.requesterJobTitle && (
                                <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                                  {request.requesterJobTitle}
                                  {request.requesterCompany && ` at ${request.requesterCompany}`}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                              {request.requesterBio && (
                                <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-2">
                                  {request.requesterBio}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectRequest.mutate({ connectionId: request.id })}
                              disabled={rejectRequest.isPending}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-[#7367f0] hover:bg-[#6658d3]"
                              onClick={() => acceptRequest.mutate({ connectionId: request.id })}
                              disabled={acceptRequest.isPending}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {displayData.type === 'suggestions' &&
                    (displayData.items as typeof suggested).map(person => (
                      <div
                        key={person.id}
                        className="rounded-lg bg-white dark:bg-[#2f3349] p-6 transition-colors"
                        style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <UserAvatar
                              userId={person.id}
                              name={person.name}
                              email={person.email}
                              image={person.image}
                              size="lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {person.name || person.email}
                              </h3>
                              {person.jobTitle && (
                                <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                                  {person.jobTitle}
                                  {person.company && ` at ${person.company}`}
                                </p>
                              )}
                              {person.location && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {person.location}
                                </p>
                              )}
                              {person.bio && (
                                <p className="text-sm text-gray-600 dark:text-[#acabc1] mt-2">
                                  {person.bio}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="ml-4">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-[#7367f0] hover:bg-[#6658d3]"
                              onClick={() => sendRequest.mutate({ userId: person.id })}
                              disabled={sendRequest.isPending}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Friend
                            </Button>
                          </div>
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

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Edit2, Mail, Phone, Globe, MessageSquare } from 'lucide-react'
import { trpcClient } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CrudSheet } from '@/components/common/crud-sheet'
import { useLocale } from '@/lib/i18n'
import { toast } from '@/lib/utils/toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type Profile = {
  id: string
  email: string
  name: string
  image: string | null
  bio: string | null
  phone: string | null
  country: string | null
  language: string | null
  jobTitle: string | null
  company: string | null
  location: string | null
  website: string | null
  skype: string | null
  bannerImage: string | null
  createdAt: Date
  updatedAt: Date
}

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'teams', label: 'Teams' },
  { id: 'projects', label: 'Projects' },
  { id: 'connections', label: 'Connections' },
]

export default function ProfilePage() {
  const { t } = useLocale()
  const searchParams = useSearchParams()
  const currentTab = searchParams?.get('tab') || 'profile'

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('')
  const [language, setLanguage] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [skype, setSkype] = useState('')
  const [website, setWebsite] = useState('')

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const data = await trpcClient.user.getProfile.query()
      setProfile(data as any)
    } catch (error: any) {
      toast.error('Failed to load profile', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setJobTitle(profile.jobTitle || '')
      setCompany(profile.company || '')
      setCountry(profile.country || '')
      setLanguage(profile.language || '')
      setBio(profile.bio || '')
      setPhone(profile.phone || '')
      setSkype(profile.skype || '')
      setWebsite(profile.website || '')
    }
  }, [profile])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await trpcClient.user.updateProfile.mutate({
        name,
        jobTitle,
        company,
        country,
        language,
        bio,
        phone,
        skype,
        website,
      })
      toast.success(t('common.toast.updated', { entity: 'Profile' }))
      await fetchProfile()
      setIsEditingProfile(false)
    } catch (error: any) {
      toast.error(t('common.toast.updateError', { entity: 'Profile' }), error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-6">{t('common.loading')}</div>
  }

  return (
    <div className="p-6">
      {/* Profile Header Card */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <img
              src={profile?.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.name || 'User')}
              alt={profile?.name}
              className="w-32 h-32 rounded-lg object-cover"
            />

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {profile?.name}
              </h2>
              <p className="text-gray-600 dark:text-[#acabc1] mb-4">
                {profile?.jobTitle || 'Job Title'}
              </p>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-gray-200 dark:border-[#44485e]">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    href={`/profile?tab=${tab.id}`}
                    className={cn(
                      'pb-3 px-1 border-b-2 transition-colors text-sm font-medium',
                      currentTab === tab.id
                        ? 'border-[#7367f0] text-[#7367f0]'
                        : 'border-transparent text-gray-600 dark:text-[#acabc1] hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Content based on tab */}
      {currentTab === 'profile' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - About & Contact */}
          <div className="col-span-12 lg:col-span-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    About
                  </h3>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-gray-400 hover:text-[#7367f0] transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#acabc1] uppercase mb-1">
                      Full Name
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.name}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#acabc1] uppercase mb-1">
                      Status
                    </p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </div>

                  {/* Role */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#acabc1] uppercase mb-1">
                      Role
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.jobTitle || 'Developer'}
                    </p>
                  </div>

                  {/* Company */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#acabc1] uppercase mb-1">
                      Company
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.company || 'Company'}
                    </p>
                  </div>

                  {/* Country */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#acabc1] uppercase mb-1">
                      Country
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.country || 'USA'}
                    </p>
                  </div>

                  {/* Language */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#acabc1] uppercase mb-1">
                      Languages
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.language || 'English'}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 dark:border-[#44485e] my-6"></div>

                  {/* Contacts */}
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-[#acabc1] uppercase mb-4">
                    Contacts
                  </h4>

                  {/* Contact */}
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#acabc1]">Contact</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {profile?.phone || '(123) 456-7890'}
                      </p>
                    </div>
                  </div>

                  {/* Skype */}
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#acabc1]">Skype</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {profile?.skype || 'username'}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#acabc1]">Email</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {profile?.email}
                      </p>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#acabc1]">Website</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {profile?.website || 'website.com'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Activity & Overview */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Activity Timeline */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Activity Timeline
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Timeline Item 1 */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-[#7367f0]"></div>
                      <div className="w-px flex-1 bg-gray-200 dark:bg-[#44485e]"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          12 Invoices have been paid
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-[#acabc1]">
                          12 min ago
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                        Invoices have been paid to the company
                      </p>
                    </div>
                  </div>

                  {/* Timeline Item 2 */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="w-px flex-1 bg-gray-200 dark:bg-[#44485e]"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Client Meeting
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-[#acabc1]">
                          45 min ago
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                        Project meeting with john @10:15am
                      </p>
                    </div>
                  </div>

                  {/* Timeline Item 3 */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Create a new project for client
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-[#acabc1]">
                          2 Day Ago
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-[#acabc1]">
                        6 team members in a project
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Connections */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Connections
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[#25293c]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=User ${i}`}
                          alt={`User ${i}`}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            User {i}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-[#acabc1]">
                            {i * 100} Connections
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Connected
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Link
                    href="/profile?tab=connections"
                    className="text-sm text-[#7367f0] hover:underline"
                  >
                    View all connections
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {currentTab === 'teams' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Teams</h3>
            <p className="text-gray-600 dark:text-[#acabc1]">Teams content coming soon...</p>
          </div>
        </Card>
      )}

      {currentTab === 'projects' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Projects</h3>
            <p className="text-gray-600 dark:text-[#acabc1]">Projects content coming soon...</p>
          </div>
        </Card>
      )}

      {currentTab === 'connections' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Connections</h3>
            <p className="text-gray-600 dark:text-[#acabc1]">Connections content coming soon...</p>
          </div>
        </Card>
      )}

      {/* Edit Profile Sheet */}
      <CrudSheet
        open={isEditingProfile}
        onOpenChange={setIsEditingProfile}
        title="Edit Profile"
        onSave={handleSave}
        isLoading={isSaving}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Developer"
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter your company"
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., USA"
            />
          </div>
          <div>
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g., English"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(123) 456-7890"
            />
          </div>
          <div>
            <Label htmlFor="skype">Skype</Label>
            <Input
              id="skype"
              value={skype}
              onChange={(e) => setSkype(e.target.value)}
              placeholder="your.skype.username"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={5}
            />
          </div>
        </div>
      </CrudSheet>
    </div>
  )
}

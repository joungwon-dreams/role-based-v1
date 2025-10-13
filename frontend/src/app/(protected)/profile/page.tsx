'use client'

import { useState, useEffect } from 'react'
import { Camera, Edit2, MapPin, Calendar } from 'lucide-react'
import { trpcClient } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { CrudSheet } from '@/components/common/crud-sheet'
import { useLocale } from '@/lib/i18n'
import { toast } from '@/lib/utils/toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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

export default function ProfilePage() {
  const { t } = useLocale()
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [isEditingContacts, setIsEditingContacts] = useState(false)
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

  const handleSaveAbout = async () => {
    setIsSaving(true)
    try {
      await trpcClient.user.updateProfile.mutate({
        name,
        jobTitle,
        company,
        country,
        language,
        bio,
      })
      toast.success(t('common.toast.updated', { entity: 'Profile' }))
      await fetchProfile()
      setIsEditingAbout(false)
    } catch (error: any) {
      toast.error(t('common.toast.updateError', { entity: 'Profile' }), error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveContacts = async () => {
    setIsSaving(true)
    try {
      await trpcClient.user.updateProfile.mutate({
        phone,
        skype,
        website,
      })
      toast.success(t('common.toast.updated', { entity: 'Profile' }))
      await fetchProfile()
      setIsEditingContacts(false)
    } catch (error: any) {
      toast.error(t('common.toast.updateError', { entity: 'Profile' }), error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-4">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#25293c]">
      {/* Header with Banner */}
      <div className="relative">
        {/* Banner Image */}
        <div className="h-64 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 relative">
          {profile?.bannerImage && (
            <img
              src={profile.bannerImage}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
          <button className="absolute top-4 right-4 bg-white dark:bg-[#2f3349] p-2 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-[#44485e]">
            <Camera className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="max-w-7xl mx-auto px-4 -mt-20 relative">
          <div className="bg-white dark:bg-[#2f3349] rounded-lg shadow p-6">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profile?.image || '/default-avatar.png'}
                  alt={profile?.name}
                  className="w-32 h-32 rounded-lg object-cover ring-4 ring-white dark:ring-[#2f3349]"
                />
                <button className="absolute bottom-2 right-2 bg-white dark:bg-[#2f3349] p-1.5 rounded-full shadow">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 pb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.name}
                </h1>
                <p className="text-gray-600 dark:text-[#acabc1]">
                  {profile?.jobTitle || 'Job Title'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-[#acabc1]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile?.country || 'Country'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile?.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <Button className="mb-2">Connected</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* About Card */}
            <div className="bg-white dark:bg-[#2f3349] rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-[#acabc1] uppercase tracking-wider">
                  About
                </h3>
                <button
                  onClick={() => setIsEditingAbout(true)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-[#acabc1]">Full Name:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-[#acabc1]">Role:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.jobTitle || 'Developer'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-[#acabc1]">Company:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.company || 'Company'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-[#acabc1]">Country:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.country || 'USA'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-[#acabc1]">Language:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.language || 'English'}</p>
                </div>
              </div>
            </div>

            {/* Contacts Card */}
            <div className="bg-white dark:bg-[#2f3349] rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-[#acabc1] uppercase tracking-wider">
                  Contacts
                </h3>
                <button
                  onClick={() => setIsEditingContacts(true)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-[#acabc1]">Contact:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.phone || '(123) 456-7890'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-[#acabc1]">Skype:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.skype || 'username'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-[#acabc1]">Email:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.email}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-[#acabc1]">Website:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.website || 'website.com'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white dark:bg-[#2f3349] rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Bio</h3>
              <p className="text-gray-600 dark:text-[#acabc1]">
                {profile?.bio || 'No bio yet. Click Edit to add your bio.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit About Sheet */}
      <CrudSheet
        open={isEditingAbout}
        onOpenChange={setIsEditingAbout}
        title="Edit About"
        onSave={handleSaveAbout}
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

      {/* Edit Contacts Sheet */}
      <CrudSheet
        open={isEditingContacts}
        onOpenChange={setIsEditingContacts}
        title="Edit Contacts"
        onSave={handleSaveContacts}
        isLoading={isSaving}
      >
        <div className="space-y-4">
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
        </div>
      </CrudSheet>
    </div>
  )
}

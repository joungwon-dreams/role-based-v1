/**
 * Profile Page - /profile
 *
 * Main profile page with user information, activity timeline, connections, and teams
 * Based on Vuexy design system
 *
 * Features:
 * - Profile header with banner and avatar
 * - Tab navigation
 * - Two-column layout (About/Overview + Activity/Connections/Teams)
 * - Responsive design
 * - Dark mode support
 */

'use client'

import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Check,
  Crown,
  Flag,
  Languages,
  Phone,
  MessageSquare,
  Mail,
  Users,
  ChartBar,
  FileText,
  MoreVertical,
  UserCheck,
} from "lucide-react"

export default function ProfilePage() {
  return (
    <main className="pt-[5rem]">
      <div className="pt-6">
        {/* Profile Header (Banner + Avatar + Info) */}
        <ProfileHeader
          name="John Doe"
          role="UX Designer"
          location="Vatican City"
          joinDate="Joined April 2021"
        />

        {/* Tab Navigation */}
        <ProfileTabs activeTab="profile" />

        {/* Profile Content */}
        <div className="px-6">
          <div className="flex flex-wrap -mx-3">
            {/* Left Column - About & Overview (33%) */}
            <div className="w-full xl:w-1/3 px-3">
              {/* About Card */}
              <div
                className="rounded-lg bg-white dark:bg-[#2f3349] p-6 mb-6 transition-colors"
                style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
              >
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-4">
                  About
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Full Name:</span>
                    <span className="text-gray-600 dark:text-gray-400">John Doe</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className="text-gray-600 dark:text-gray-400">Active</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Crown className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Role:</span>
                    <span className="text-gray-600 dark:text-gray-400">Developer</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Flag className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Country:</span>
                    <span className="text-gray-600 dark:text-gray-400">USA</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Languages className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Languages:</span>
                    <span className="text-gray-600 dark:text-gray-400">English</span>
                  </li>
                </ul>

                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mt-6 mb-4">
                  Contacts
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span>
                    <span className="text-gray-600 dark:text-gray-400">(123) 456-7890</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Skype:</span>
                    <span className="text-gray-600 dark:text-gray-400">john.doe</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span className="text-gray-600 dark:text-gray-400">john.doe@example.com</span>
                  </li>
                </ul>

                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mt-6 mb-4">
                  Teams
                </p>
                <ul className="space-y-3">
                  <li className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Backend Developer</span>
                    <span className="text-gray-500 dark:text-gray-400"> (126 Members)</span>
                  </li>
                  <li className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">React Developer</span>
                    <span className="text-gray-500 dark:text-gray-400"> (98 Members)</span>
                  </li>
                </ul>
              </div>

              {/* Overview Card */}
              <div
                className="rounded-lg bg-white dark:bg-[#2f3349] p-6 mb-6 transition-colors"
                style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
              >
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-4">
                  Overview
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Task Compiled:</span>
                    <span className="text-gray-600 dark:text-gray-400">13.5k</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Projects Compiled:</span>
                    <span className="text-gray-600 dark:text-gray-400">146</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Connections:</span>
                    <span className="text-gray-600 dark:text-gray-400">897</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Activity Timeline & Connections & Teams (67%) */}
            <div className="w-full xl:w-2/3 px-3">
              {/* Activity Timeline Card */}
              <div
                className="rounded-lg bg-white dark:bg-[#2f3349] overflow-hidden mb-6 transition-colors"
                style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
              >
                <div className="border-b border-gray-200 dark:border-[#44485e] px-6 py-4 flex items-center justify-between">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <ChartBar className="w-5 h-5" />
                    Activity Timeline
                  </h5>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Timeline Item 1 */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[#7367f0]"></div>
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-[#44485e] mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-gray-900 dark:text-white">
                            12 Invoices have been paid
                          </h6>
                          <span className="text-xs text-gray-500 dark:text-gray-400">12 min ago</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Invoices have been paid to the company
                        </p>
                        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-[#44485e] rounded px-3 py-2">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">invoices.pdf</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Item 2 */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-[#44485e] mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-gray-900 dark:text-white">
                            Client Meeting
                          </h6>
                          <span className="text-xs text-gray-500 dark:text-gray-400">45 min ago</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Project meeting with john @10:15am
                        </p>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#3a3e5a] rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Lester McCarthy (Client)</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">CEO of Pixinvent</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Item 3 */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-gray-900 dark:text-white">
                            Create a new project for client
                          </h6>
                          <span className="text-xs text-gray-500 dark:text-gray-400">2 Day Ago</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          6 team members in a project
                        </p>
                        <div className="flex -space-x-2">
                          {[
                            "from-blue-400 to-blue-600",
                            "from-purple-400 to-purple-600",
                            "from-pink-400 to-pink-600"
                          ].map((color, i) => (
                            <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center border-2 border-white dark:border-[#2f3349]`}>
                              <User className="w-4 h-4 text-white" />
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#44485e] flex items-center justify-center border-2 border-white dark:border-[#2f3349]">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">+3</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connections Card */}
              <div
                className="rounded-lg bg-white dark:bg-[#2f3349] overflow-hidden mb-6 transition-colors"
                style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
              >
                <div className="border-b border-gray-200 dark:border-[#44485e] px-6 py-4 flex items-center justify-between">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Connections
                  </h5>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {[
                      { name: "Cecilia Payne", connections: "45 Connections", color: "from-blue-400 to-blue-600" },
                      { name: "Curtis Fletcher", connections: "1.32k Connections", color: "from-purple-400 to-purple-600" },
                      { name: "Alice Stone", connections: "125 Connections", color: "from-pink-400 to-pink-600" },
                      { name: "Darrell Barnes", connections: "456 Connections", color: "from-green-400 to-green-600" },
                      { name: "Eugenia Moore", connections: "1.2k Connections", color: "from-orange-400 to-red-600" },
                    ].map((connection, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#44485e] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${connection.color} flex items-center justify-center flex-shrink-0`}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {connection.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {connection.connections}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <Button variant="link" className="text-[#7367f0] hover:text-[#6658d3]">
                      View all connections
                    </Button>
                  </div>
                </div>
              </div>

              {/* Teams Card */}
              <div
                className="rounded-lg bg-white dark:bg-[#2f3349] overflow-hidden mb-6 transition-colors"
                style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
              >
                <div className="border-b border-gray-200 dark:border-[#44485e] px-6 py-4 flex items-center justify-between">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Teams
                  </h5>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4 mb-4">
                    {[
                      { name: "React Developers", members: "72 Members", badge: "Developer", color: "from-blue-400 to-blue-600", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
                      { name: "Support Team", members: "122 Members", badge: "Support", color: "from-green-400 to-green-600", badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
                      { name: "UI Designers", members: "7 Members", badge: "Designer", color: "from-pink-400 to-pink-600", badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
                      { name: "Vue.js Developers", members: "289 Members", badge: "Developer", color: "from-teal-400 to-teal-600", badgeColor: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
                      { name: "Digital Marketing", members: "24 Members", badge: "Marketing", color: "from-purple-400 to-purple-600", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
                    ].map((team, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#44485e] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${team.color} flex items-center justify-center flex-shrink-0`}>
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {team.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {team.members}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${team.badgeColor} border-0`}>
                          {team.badge}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <Button variant="link" className="text-[#7367f0] hover:text-[#6658d3]">
                      View all teams
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

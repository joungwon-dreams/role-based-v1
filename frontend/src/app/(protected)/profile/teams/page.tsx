/**
 * Teams Page - /profile/teams
 *
 * Display all teams with grid layout
 * Based on Vuexy design system
 */

'use client'

import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Users } from "lucide-react"

const teams = [
  {
    name: "React Developers",
    icon: "⚛️",
    description: "We don't make assumptions about the rest of your technology stack, so you can develop new features...",
    members: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" },
    ],
    extraMembers: 9,
    tags: ["React", "MUI"],
    tagColors: ["bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"]
  },
  {
    name: "Vue.js Dev Team",
    icon: "V",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    description: "The development of Vue and its ecosystem is guided by an international team, some of whom have chosen.",
    members: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6" },
    ],
    extraMembers: 4,
    tags: ["Vuejs", "Developer"],
    tagColors: ["bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"]
  },
  {
    name: "Creative Designers",
    icon: "🎨",
    description: "A design or product team is more than just the people on it. A team includes the people, the roles they play.",
    members: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=7" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=8" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=9" },
    ],
    extraMembers: 2,
    tags: ["Sketch", "XD"],
    tagColors: ["bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"]
  },
  {
    name: "Support Team",
    icon: "💬",
    description: "Support your team. Your customer support team is fielding the good, the bad, and the ugly day in out.",
    members: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=10" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=11" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=12" },
    ],
    extraMembers: 7,
    tags: ["Zendesk"],
    tagColors: ["bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"]
  },
  {
    name: "Digital Marketing",
    icon: "📱",
    description: "Digital marketing refers to advertising delivered through digital channels such as search engines, websites…",
    members: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=13" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=14" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=15" },
    ],
    extraMembers: 0,
    tags: ["Twitter", "Email"],
    tagColors: ["bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400", "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"]
  },
  {
    name: "Event",
    icon: "📅",
    description: "Event is defined as a particular contest which is part of a program of contests. An example of an event is...",
    members: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=16" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=17" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=18" },
    ],
    extraMembers: 2,
    tags: ["Hubilo"],
    tagColors: ["bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"]
  },
]

export default function TeamsPage() {
  return (
    <main className="pt-[5rem]">
      <div className="pt-6">
        <ProfileHeader
          name="John Doe"
          role="UX Designer"
          location="Vatican City"
          joinDate="Joined April 2021"
        />

        <ProfileTabs activeTab="teams" />

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team, index) => (
              <div
                key={index}
                className="rounded-lg bg-white dark:bg-[#2f3349] transition-colors p-6"
                style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl ${team.iconBg || 'bg-blue-100 dark:bg-blue-900/30'} ${team.iconColor || 'text-blue-600 dark:text-blue-400'}`}>
                      {team.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {team.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center -space-x-2">
                    {team.members.map((member, idx) => (
                      <div
                        key={idx}
                        className="h-8 w-8 rounded-full border-2 border-white dark:border-[#2f3349] overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgb(110, 72, 170), rgb(91, 149, 210))'
                        }}
                      >
                        <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {team.extraMembers > 0 && (
                      <div className="h-8 w-8 rounded-full border-2 border-white dark:border-[#2f3349] bg-gray-100 dark:bg-[#44485e] flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                        +{team.extraMembers}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {team.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${team.tagColors[idx]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

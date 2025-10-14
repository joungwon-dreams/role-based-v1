/**
 * Projects Page - /profile/projects
 *
 * Display all projects with grid layout
 * Based on Vuexy design system
 */

'use client'

import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Heart } from "lucide-react"

const projects = [
  {
    title: "Website Design",
    description: "Designed a modern, responsive website for a tech startup using Figma and Webflow.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
    team: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" },
    ],
    badge: "React",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    likes: 125
  },
  {
    title: "Social Media App",
    description: "Built a fully functional social media application with real-time chat and notifications.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=200&fit=crop",
    team: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5" },
    ],
    badge: "Next.js",
    badgeColor: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    likes: 234
  },
  {
    title: "E-commerce Platform",
    description: "Developed a complete e-commerce solution with payment integration and admin dashboard.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=200&fit=crop",
    team: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=7" },
    ],
    badge: "Vue",
    badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    likes: 312
  },
  {
    title: "Mobile Banking App",
    description: "Created a secure mobile banking application with biometric authentication.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=200&fit=crop",
    team: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=8" },
    ],
    badge: "React Native",
    badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    likes: 178
  },
  {
    title: "Task Management Tool",
    description: "Built a collaborative task management tool with drag-and-drop functionality.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop",
    team: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=9" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=10" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=11" },
    ],
    badge: "Angular",
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    likes: 89
  },
  {
    title: "AI Chatbot",
    description: "Developed an AI-powered chatbot using natural language processing and machine learning.",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=200&fit=crop",
    team: [
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=12" },
      { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=13" },
    ],
    badge: "Python",
    badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    likes: 267
  },
]

export default function ProjectsPage() {
  return (
    <main className="pt-[5rem]">
      <div className="pt-6">
        <ProfileHeader
          name="John Doe"
          role="UX Designer"
          location="Vatican City"
          joinDate="Joined April 2021"
        />

        <ProfileTabs activeTab="projects" />

        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={index}
                className="rounded-lg bg-white dark:bg-[#2f3349] transition-colors overflow-hidden"
                style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <button className="p-2 bg-white/90 dark:bg-[#2f3349]/90 rounded-lg hover:bg-white dark:hover:bg-[#2f3349] transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <Badge className={`${project.badgeColor} border-0 ml-2`}>
                      {project.badge}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                      {project.team.map((member, idx) => (
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
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">{project.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

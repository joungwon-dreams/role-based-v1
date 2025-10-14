/**
 * ProfileTabs Component
 *
 * Tab navigation for profile pages
 * Based on Vuexy design system
 *
 * Features:
 * - Active tab highlighting with border-bottom
 * - Hover effects
 * - Responsive text sizes
 * - Dark mode support
 * - Next.js Link for client-side navigation
 *
 * Usage:
 * ```tsx
 * <ProfileTabs activeTab="profile" />
 * <ProfileTabs activeTab="teams" />
 * ```
 */

'use client'

import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProfileTabsProps {
  /** Currently active tab */
  activeTab: "profile" | "teams" | "projects" | "connections" | "message"
}

/** Tab configuration */
const tabs = [
  { id: "profile" as const, label: "Profile", href: "/profile" },
  { id: "teams" as const, label: "Teams", href: "/profile/teams" },
  { id: "projects" as const, label: "Projects", href: "/profile/projects" },
  { id: "connections" as const, label: "Connections", href: "/profile/connections" },
  { id: "message" as const, label: "Message", href: "/profile/message" },
]

export function ProfileTabs({ activeTab }: ProfileTabsProps) {
  return (
    <div className="px-6 mb-6">
      <div className="border-b border-gray-200 dark:border-[#44485e]">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "pb-4 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "text-[#7367f0] border-[#7367f0]"
                    : "text-gray-600 dark:text-gray-400 hover:text-[#7367f0] border-transparent"
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

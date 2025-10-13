"use client"

import * as React from "react"
import Link from "next/link"
import {
  Home,
  Users,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Circle,
  Menu as MenuIcon,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SidebarContextType {
  isCollapsed: boolean
  isHovered: boolean
  isMobileOpen: boolean
  toggleSidebar: () => void
  setIsHovered: (value: boolean) => void
  toggleMobileMenu: () => void
}

export const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface MenuItem {
  title: string
  icon?: React.ReactNode
  href?: string
  badge?: { text: string; variant: string }
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    href: "/dashboard",
  },
  {
    title: "Users",
    icon: <Users className="w-5 h-5" />,
    href: "/dashboard/users",
  },
]

function MenuItemComponent({ item, level = 0 }: { item: MenuItem; level?: number }) {
  const { isCollapsed, isHovered } = useSidebar()
  const isExpanded = isCollapsed ? isHovered : true

  return (
    <li>
      <Link
        href={item.href || "#"}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          "hover:bg-gray-100 dark:hover:bg-[#44485e] text-gray-700 dark:text-[#acabc1]",
          !isExpanded && "justify-center px-0"
        )}
      >
        {item.icon}
        <span className={cn(
          "flex-1 transition-opacity duration-300",
          !isExpanded ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}>{item.title}</span>
      </Link>
    </li>
  )
}

export function Sidebar() {
  const { isCollapsed, isHovered, isMobileOpen, toggleSidebar, setIsHovered, toggleMobileMenu } = useSidebar()
  const [isMobile, setIsMobile] = React.useState(false)
  const isExpanded = isCollapsed ? isHovered : true

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1200)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMouseEnter = () => {
    if (isCollapsed && !isMobile) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (isCollapsed && !isMobile) {
      setIsHovered(false)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-[#2f3349] transition-all duration-300",
          isMobile && !isMobileOpen && "-translate-x-full lg:translate-x-0"
        )}
        style={{
          boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)',
          width: (isCollapsed && isHovered) || !isCollapsed ? '260px' : '70px'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center gap-3 border-b border-gray-200 dark:border-[#44485e] transition-all duration-300",
          isCollapsed && !isHovered ? "px-3 justify-center" : "px-6"
        )}>
          <div className="flex h-8 w-8 items-center justify-center flex-shrink-0">
          <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z"
              fill="currentColor"
              className="text-[#7367f0]"
            />
            <path
              opacity="0.06"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z"
              fill="#161616"
            />
            <path
              opacity="0.06"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z"
              fill="#161616"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z"
              fill="currentColor"
              className="text-[#7367f0]"
            />
          </svg>
        </div>
        <span className={cn(
          "text-xl font-bold text-gray-900 dark:text-white transition-all duration-300",
          isCollapsed && !isHovered ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}>Academy</span>
        {/* Circle/CircleDot button - shown on xl+ screens when expanded or collapsed+hovered */}
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="hidden xl:flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#44485e] transition-all duration-300 ml-auto"
          >
            <CircleDot className="h-5 w-5 text-gray-400 dark:text-[#acabc1]" />
          </button>
        )}
        {isCollapsed && isHovered && (
          <button
            onClick={toggleSidebar}
            className="hidden xl:flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#44485e] transition-all duration-300 ml-auto"
          >
            <Circle className="h-5 w-5 text-gray-400 dark:text-[#acabc1]" />
          </button>
        )}
        {/* X button - shown on screens < xl (below 1200px) when sidebar is open */}
        {!isCollapsed && (
          <button
            onClick={toggleMobileMenu}
            className="flex xl:hidden h-6 w-6 items-center justify-center ml-auto"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-[#acabc1]" />
          </button>
        )}
      </div>

      {/* Menu */}
      <div className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-4">
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <MenuItemComponent key={index} item={item} />
          ))}
        </nav>
      </div>
    </aside>
    </>
  )
}

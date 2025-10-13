"use client"

import * as React from "react"
import { Sidebar, SidebarContext } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { Toaster } from "@/components/ui/sonner"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("DashboardContent must be within SidebarContext")
  const { isCollapsed, isHovered } = context
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1200)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const sidebarWidth = isMobile ? 0 : (isCollapsed ? 70 : 260)
  const horizontalMargin = 70

  return (
    <div className="flex-1 transition-all duration-300" style={{
      paddingLeft: `${sidebarWidth + horizontalMargin}px`,
      paddingRight: `${horizontalMargin}px`
    }}>
      <Navbar />
      {children}
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      setIsCollapsed(saved === "true")
    }
  }, [])

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const newState = !prev
      localStorage.setItem("sidebar-collapsed", String(newState))
      // Reset hover state when collapsing to prevent staying expanded
      if (newState) {
        setIsHovered(false)
      }
      return newState
    })
  }, [])

  const toggleMobileMenu = React.useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isHovered,
      isMobileOpen,
      toggleSidebar,
      setIsHovered,
      toggleMobileMenu
    }}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#25293c] transition-colors" suppressHydrationWarning>
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
      {mounted && <Toaster />}
    </SidebarContext.Provider>
  )
}

"use client"

import * as React from "react"
import { Search, Bell, User, Settings, DollarSign, HelpCircle, LogOut, Moon, Sun, Menu as MenuIcon, Languages } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useSidebar } from "@/components/dashboard/sidebar"
import { useLocale } from "@/lib/i18n"

export function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isLangOpen, setIsLangOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const { isCollapsed, isHovered, toggleMobileMenu } = useSidebar()
  const { locale, setLocale } = useLocale()

  React.useEffect(() => {
    setMounted(true)
  }, [])

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
    <nav className="fixed top-0 z-30 mt-4 flex h-14 items-center rounded-md bg-white dark:bg-[#2f3349] px-6 transition-all duration-300" style={{
      left: `${sidebarWidth + horizontalMargin}px`,
      right: `${horizontalMargin}px`,
      boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)'
    }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-[#44485e] mr-auto lg:hidden"
        >
          <MenuIcon className="h-5 w-5 text-gray-600 dark:text-[#acabc1]" />
        </button>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-[#44485e] transition-colors"
          >
            <span className="text-sm font-medium text-gray-600 dark:text-[#acabc1]">
              {locale === 'en' ? 'EN' : 'KR'}
            </span>
          </button>

          {/* Language Dropdown */}
          {isLangOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsLangOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-32 rounded-lg border border-gray-200 dark:border-[#44485e] bg-white dark:bg-[#2f3349] shadow-lg">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setLocale('en')
                      setIsLangOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#44485e] transition-colors ${
                      locale === 'en' ? 'bg-gray-100 dark:bg-[#44485e] text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-[#acabc1]'
                    }`}
                  >
                    <span>English</span>
                  </button>
                  <button
                    onClick={() => {
                      setLocale('kr')
                      setIsLangOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#44485e] transition-colors ${
                      locale === 'kr' ? 'bg-gray-100 dark:bg-[#44485e] text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-[#acabc1]'
                    }`}
                  >
                    <span>한국어</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-[#44485e] transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-[#acabc1]" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        )}

        {/* Shortcuts */}
        <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4c51] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4c51]"></span>
          </span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7367f0] text-white hover:opacity-90 transition-opacity"
          >
            <User className="h-5 w-5" />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7367f0] text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">John Doe</div>
                      <div className="text-xs text-gray-500">Admin</div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <DollarSign className="h-4 w-4" />
                    <span>Billing</span>
                    <Badge variant="danger" className="ml-auto rounded-full">
                      4
                    </Badge>
                  </button>
                  <div className="my-2 border-t border-gray-200" />
                  <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <DollarSign className="h-4 w-4" />
                    <span>Pricing</span>
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <HelpCircle className="h-4 w-4" />
                    <span>FAQ</span>
                  </button>
                  <div className="my-2 border-t border-gray-200" />
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full justify-between"
                  >
                    <span className="text-xs">Logout</span>
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

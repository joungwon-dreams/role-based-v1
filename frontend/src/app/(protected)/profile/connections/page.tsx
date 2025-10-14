/**
 * Connections Page - /profile/connections
 *
 * Display all connections with grid layout
 * Based on Vuexy design system
 */

'use client'

import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { Button } from "@/components/ui/button"
import { User, UserCheck, UserPlus } from "lucide-react"

const connections = [
  { name: "Cecilia Payne", connections: "45 Connections", color: "from-blue-400 to-blue-600", isConnected: true },
  { name: "Curtis Fletcher", connections: "1.32k Connections", color: "from-purple-400 to-purple-600", isConnected: true },
  { name: "Alice Stone", connections: "125 Connections", color: "from-pink-400 to-pink-600", isConnected: false },
  { name: "Darrell Barnes", connections: "456 Connections", color: "from-green-400 to-green-600", isConnected: true },
  { name: "Eugenia Moore", connections: "1.2k Connections", color: "from-orange-400 to-red-600", isConnected: false },
  { name: "Bernard Langley", connections: "890 Connections", color: "from-indigo-400 to-indigo-600", isConnected: true },
  { name: "Sue Panther", connections: "2.1k Connections", color: "from-yellow-400 to-orange-600", isConnected: true },
  { name: "Trevor Belmont", connections: "367 Connections", color: "from-teal-400 to-teal-600", isConnected: false },
  { name: "Natalie Stroud", connections: "1.8k Connections", color: "from-rose-400 to-rose-600", isConnected: true },
  { name: "Tom Cook", connections: "523 Connections", color: "from-cyan-400 to-cyan-600", isConnected: false },
  { name: "Katie Lane", connections: "712 Connections", color: "from-violet-400 to-violet-600", isConnected: true },
  { name: "Mark Fox", connections: "945 Connections", color: "from-lime-400 to-lime-600", isConnected: true },
]

export default function ConnectionsPage() {
  return (
    <main className="pt-[5rem]">
      <div className="pt-6">
        <ProfileHeader
          name="John Doe"
          role="UX Designer"
          location="Vatican City"
          joinDate="Joined April 2021"
        />

        <ProfileTabs activeTab="connections" />

        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {connections.map((connection, index) => (
              <div
                key={index}
                className="rounded-lg bg-white dark:bg-[#2f3349] transition-colors p-6"
                style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${connection.color} flex items-center justify-center mb-4`}
                  >
                    <User className="w-10 h-10 text-white" />
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {connection.name}
                  </h3>

                  {/* Connections count */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {connection.connections}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2 w-full">
                    {connection.isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Connected
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="flex-1 bg-[#7367f0] hover:bg-[#6258cc]"
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    )}
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

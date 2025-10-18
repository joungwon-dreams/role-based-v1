/**
 * Message Page - /profile/message
 *
 * Chat interface with message history
 * Based on Vuexy design system
 */

'use client'

import { UserAvatar } from "@/components/common/user-avatar"
import { Search, Send, Paperclip, Mic, Phone, Video, MoreVertical } from "lucide-react"

const chats = [
  { name: "Waldemar Mannering", email: "waldemar.mannering@example.com", time: "5 Minutes", message: "Refer friends. Get rewards.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=waldemar", online: true },
  { name: "Felecia Rower", email: "felecia.rower@example.com", time: "30 Minutes", message: "I will purchase it for sure. 👍", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=felecia", online: true, active: true },
  { name: "Calvin Moore", email: "calvin.moore@example.com", time: "1 Day", message: "If it takes long you can mail inbox user", avatar: undefined, online: false },
]

const messages = [
  { id: 1, sender: "Felecia Rower", text: "Hi there! I've been looking at your portfolio and I'm really impressed with your work.", time: "10:00 AM", isOwn: false },
  { id: 2, sender: "John Doe", text: "Thank you so much! I really appreciate that. 😊", time: "10:02 AM", isOwn: true },
  { id: 3, sender: "Felecia Rower", text: "I'm working on a new project and I think you'd be a perfect fit. Are you available for a quick call to discuss?", time: "10:03 AM", isOwn: false },
  { id: 4, sender: "John Doe", text: "Absolutely! I'd love to hear more about it. When would be a good time for you?", time: "10:05 AM", isOwn: true },
  { id: 5, sender: "Felecia Rower", text: "How about tomorrow at 2 PM? I'll send you a calendar invite.", time: "10:07 AM", isOwn: false },
  { id: 6, sender: "John Doe", text: "Perfect! That works great for me. Looking forward to it! 👍", time: "10:08 AM", isOwn: true },
]

const contacts = [
  { name: "Natalie Maxwell", role: "UI/UX Designer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=natalie", online: true },
  { name: "Jess Cook", role: "Business Analyst", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jess", online: false },
  { name: "Louie Mason", role: "Resource Manager", avatar: undefined, online: false },
  { name: "Krystal Norton", role: "Business Executive", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=krystal", online: true },
  { name: "Stacy Garrison", role: "Marketing Ninja", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=stacy", online: false },
  { name: "Calvin Moore", role: "UX Engineer", avatar: undefined, online: false },
  { name: "Mary Giles", role: "Account Department", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mary", online: true },
  { name: "Waldemar Mannering", role: "AWS Support", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=waldemar2", online: false },
]

export default function MessagePage() {
  return (
    <main className="pt-[5rem]">
      <div className="pt-6">
        <div className="flex h-[calc(100vh-8rem)] gap-6">
          {/* Left Sidebar - Chat List */}
          <div className="w-[260px] flex-shrink-0">
            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] h-full flex flex-col overflow-hidden"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              {/* User Profile Section */}
              <div className="p-6 border-b border-gray-200 dark:border-[#44485e]">
                <div className="mb-4">
                  <UserAvatar
                    userId="john-doe-id"
                    name="John Doe"
                    email="john.doe@example.com"
                    size="lg"
                    showOnlineStatus={true}
                  />
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-[#44485e] rounded-lg bg-white dark:bg-[#2f3349] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7367f0]"
                  />
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <h6 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3">Messages</h6>
                  <div className="space-y-2">
                    {chats.map((chat, index) => (
                      <div
                        key={index}
                        className={`rounded-lg hover:bg-gray-50 dark:hover:bg-[#44485e] cursor-pointer transition-colors p-3 ${
                          chat.active ? 'bg-[#7367f0]/8' : ''
                        }`}
                      >
                        <UserAvatar
                          userId={chat.email}
                          name={chat.name}
                          email={chat.email}
                          avatarUrl={chat.avatar}
                          size="md"
                          showOnlineStatus={chat.online}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacts List */}
                <div className="p-4 border-t border-gray-200 dark:border-[#44485e]">
                  <h6 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3">Contacts</h6>
                  <div className="space-y-2">
                    {contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#44485e] cursor-pointer transition-colors"
                      >
                        <UserAvatar
                          userId={contact.name}
                          name={contact.name}
                          role={contact.role}
                          avatarUrl={contact.avatar}
                          size="md"
                          showOnlineStatus={contact.online}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1">
            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] h-full flex flex-col overflow-hidden"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#44485e]">
                <UserAvatar
                  userId="felecia.rower@example.com"
                  name="Felecia Rower"
                  role="NextJS developer"
                  avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=felecia"
                  size="md"
                  showOnlineStatus={true}
                />
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#44485e] rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#44485e] rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#44485e] rounded-lg transition-colors">
                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#44485e] rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[70%] ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!message.isOwn && (
                          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=felecia" alt="Felecia Rower" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-4 py-3 rounded-lg ${
                              message.isOwn
                                ? 'bg-[#7367f0] text-white'
                                : 'bg-gray-100 dark:bg-[#44485e] text-gray-900 dark:text-white'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {message.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-[#44485e]">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-[#44485e] rounded-lg">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Mic className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-[#7367f0] hover:bg-[#6258cc] text-white rounded-lg transition-colors flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span className="text-sm font-medium">Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/lib/i18n';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();

  return (
    <main className="pt-[5rem]">
      <div className="pt-6">
        <div className="flex flex-wrap -mx-3">

          {/* Full width card */}
          <div className="w-full px-3 mb-6">
            <div className="rounded-lg bg-white dark:bg-[#2f3349] transition-colors p-6" style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('dashboard.welcome', { name: user?.name || user?.email?.split('@')[0] || 'User' })}
              </h2>
              <p className="text-gray-600 dark:text-[#acabc1]">
                {t('dashboard.progress')}
              </p>
            </div>
          </div>

          {/* Row 1: 3 cards */}
          <div className="w-full xl:w-1/3 px-3 mb-6">
            <div className="h-[200px] rounded-lg bg-white dark:bg-[#2f3349] transition-colors p-6" style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}>
              <p className="text-sm text-gray-600 dark:text-[#acabc1] mb-2">{t('dashboard.revenueGrowth')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$32.5k</p>
              <p className="text-sm text-green-600">+72.80%</p>
            </div>
          </div>

          <div className="w-full xl:w-1/3 px-3 mb-6">
            <div className="h-[200px] rounded-lg bg-white dark:bg-[#2f3349] transition-colors p-6" style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}>
              <p className="text-sm text-gray-600 dark:text-[#acabc1] mb-2">{t('dashboard.totalStudents')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">2.4k</p>
              <p className="text-sm text-green-600">+18.5%</p>
            </div>
          </div>

          <div className="w-full xl:w-1/3 px-3 mb-6">
            <div className="h-[200px] rounded-lg bg-white dark:bg-[#2f3349] transition-colors p-6" style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}>
              <p className="text-sm text-gray-600 dark:text-[#acabc1] mb-2">{t('dashboard.activeCourses')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">48</p>
              <p className="text-sm text-green-600">+12.3%</p>
            </div>
          </div>

          {/* Row 2: 2 cards */}
          <div className="w-full md:w-1/2 px-3 mb-6">
            <div className="h-[300px] rounded-lg bg-white dark:bg-[#2f3349] transition-colors" style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}>
              <div className="border-b border-gray-200 dark:border-[#44485e] px-6 py-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.popularTopics')}</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'uiDesign', label: t('dashboard.topics.uiDesign') },
                    { key: 'uxDesign', label: t('dashboard.topics.uxDesign') },
                    { key: 'music', label: t('dashboard.topics.music') },
                    { key: 'photography', label: t('dashboard.topics.photography') }
                  ].map((topic) => (
                    <div key={topic.key} className="p-3 border border-gray-200 dark:border-[#44485e] rounded-lg hover:bg-gray-50 dark:hover:bg-[#44485e] cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{topic.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 px-3 mb-6">
            <div className="h-[300px] rounded-lg bg-white dark:bg-[#2f3349] transition-colors" style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}>
              <div className="border-b border-gray-200 dark:border-[#44485e] px-6 py-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.topInstructors')}</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { name: 'Jordan Stevenson', students: '1.2k' },
                  { name: 'Jennifer Walsh', students: '1.1k' },
                  { name: 'Allie Grater', students: '980' },
                ].map((instructor) => (
                  <div key={instructor.name} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-[#44485e]"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{instructor.name}</p>
                      <p className="text-xs text-gray-600 dark:text-[#acabc1]">{instructor.students} {t('dashboard.students')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

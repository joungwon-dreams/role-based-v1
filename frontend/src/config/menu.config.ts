import {
  LayoutDashboard,
  User,
  UserCircle,
  UserCog,
  Settings,
  Calendar,
  CalendarDays,
  CalendarRange,
  FileText,
  Edit,
  PenSquare,
  FileClock,
  FileCheck,
  Mail,
  Inbox,
  Send,
  MailPlus,
  Users,
  UsersRound,
  UserSearch,
  UserCheck,
  Bell,
  Users2,
  Briefcase,
  UserPlus2,
  FolderKanban,
  FolderOpen,
  FolderPlus,
  ListTodo,
  BarChart,
  TrendingUp,
  FileBarChart,
  Headphones,
  FolderCog,
  Globe,
  FilePlus,
  Layout,
  FileStack,
  AlertTriangle,
  Images,
  UserX,
  ShieldCheck,
  Activity,
  Clock,
  LogIn,
  FileSearch,
  AlertOctagon,
  Download,
  Sliders,
  Code,
  Flag,
  HardDrive,
  Database,
  Shield,
  Zap,
  List,
  GitBranch,
  Archive,
  Lock,
  ShieldAlert,
  Key,
  Timer,
  CheckCircle,
  XCircle,
  ScrollText,
  Terminal,
  AlertCircle,
  Webhook,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  key: string;
  titleKey: string;
  icon: LucideIcon;
  path?: string;
  minRoleLevel: number; // 0=guest, 1=user, 2=premium, 3=admin, 4=superadmin
  requiredPermissions?: string[];
  children?: MenuItem[];
  badge?: {
    text: string;
    variant: 'default' | 'danger' | 'warning' | 'success';
  };
  separator?: boolean;
  sectionHeader?: boolean; // Section header for role-based grouping
}

export const menuItems: MenuItem[] = [
  // ========== USER LEVEL (1) ==========
  {
    key: 'user-section',
    titleKey: 'menu.section.user',
    icon: User,
    minRoleLevel: 1,
    sectionHeader: true,
  },
  {
    key: 'dashboard',
    titleKey: 'menu.dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    minRoleLevel: 1,
    requiredPermissions: ['dashboard:view:own'],
  },
  {
    key: 'calendar',
    titleKey: 'menu.calendar',
    icon: Calendar,
    path: '/calendar',
    minRoleLevel: 1,
    requiredPermissions: ['calendar:view:own'],
  },
  {
    key: 'stories',
    titleKey: 'menu.stories',
    icon: FileText,
    path: '/stories',
    minRoleLevel: 1,
    requiredPermissions: ['story:view:own'],
  },
  {
    key: 'messages',
    titleKey: 'menu.messages.title',
    icon: Mail,
    path: '/messages',
    minRoleLevel: 1,
    requiredPermissions: ['message:view:own'],
  },
  {
    key: 'connections',
    titleKey: 'menu.connections.title',
    icon: Users,
    minRoleLevel: 1,
    requiredPermissions: ['connection:view:own'],
    children: [
      {
        key: 'connections_network',
        titleKey: 'menu.connections.myNetwork',
        icon: UsersRound,
        path: '/connections',
        minRoleLevel: 1,
        requiredPermissions: ['connection:view:own'],
      },
      {
        key: 'connections_search',
        titleKey: 'menu.connections.findPeople',
        icon: UserSearch,
        path: '/connections/search',
        minRoleLevel: 1,
        requiredPermissions: ['connection:view:own'],
      },
      {
        key: 'connections_requests',
        titleKey: 'menu.connections.requests',
        icon: UserCheck,
        path: '/connections/requests',
        minRoleLevel: 1,
        requiredPermissions: ['connection:manage:own'],
      },
    ],
  },
  {
    key: 'notifications',
    titleKey: 'menu.notifications',
    icon: Bell,
    path: '/notifications',
    minRoleLevel: 1,
    requiredPermissions: ['notification:view:own'],
  },

  // ========== PREMIUM LEVEL (2) ==========
  {
    key: 'premium-section',
    titleKey: 'menu.section.premium',
    icon: Users2,
    minRoleLevel: 2,
    sectionHeader: true,
  },
  {
    key: 'teams',
    titleKey: 'menu.teams.title',
    icon: Users2,
    minRoleLevel: 2,
    requiredPermissions: ['team:view:team'],
    children: [
      {
        key: 'teams_my',
        titleKey: 'menu.teams.myTeams',
        icon: Briefcase,
        path: '/teams',
        minRoleLevel: 2,
        requiredPermissions: ['team:view:team'],
      },
      {
        key: 'teams_create',
        titleKey: 'menu.teams.create',
        icon: UserPlus2,
        path: '/teams/create',
        minRoleLevel: 2,
        requiredPermissions: ['team:create:own'],
      },
      {
        key: 'teams_settings',
        titleKey: 'menu.teams.settings',
        icon: Settings,
        path: '/teams/settings',
        minRoleLevel: 2,
        requiredPermissions: ['team:manage:team'],
      },
    ],
  },
  {
    key: 'team_members',
    titleKey: 'menu.teamMembers.title',
    icon: UserCog,
    minRoleLevel: 2,
    requiredPermissions: ['team_member:view:team'],
    children: [
      {
        key: 'team_members_manage',
        titleKey: 'menu.teamMembers.manage',
        icon: Users,
        path: '/teams/members',
        minRoleLevel: 2,
        requiredPermissions: ['team_member:manage:team'],
      },
      {
        key: 'team_members_invite',
        titleKey: 'menu.teamMembers.invite',
        icon: UserPlus2,
        path: '/teams/invite',
        minRoleLevel: 2,
        requiredPermissions: ['team_member:invite:team'],
      },
      {
        key: 'team_members_permissions',
        titleKey: 'menu.teamMembers.permissions',
        icon: ShieldCheck,
        path: '/teams/permissions',
        minRoleLevel: 2,
        requiredPermissions: ['team_member:manage:team'],
      },
    ],
  },
  {
    key: 'projects',
    titleKey: 'menu.projects.title',
    icon: FolderKanban,
    minRoleLevel: 2,
    requiredPermissions: ['project:view:team'],
    children: [
      {
        key: 'projects_active',
        titleKey: 'menu.projects.active',
        icon: FolderOpen,
        path: '/projects',
        minRoleLevel: 2,
        requiredPermissions: ['project:view:team'],
      },
      {
        key: 'projects_create',
        titleKey: 'menu.projects.create',
        icon: FolderPlus,
        path: '/projects/create',
        minRoleLevel: 2,
        requiredPermissions: ['project:create:team'],
      },
      {
        key: 'projects_tasks',
        titleKey: 'menu.projects.myTasks',
        icon: ListTodo,
        path: '/projects/tasks',
        minRoleLevel: 2,
        requiredPermissions: ['project:view:team'],
      },
      {
        key: 'projects_calendar',
        titleKey: 'menu.projects.calendar',
        icon: CalendarDays,
        path: '/projects/calendar',
        minRoleLevel: 2,
        requiredPermissions: ['project:view:team'],
      },
    ],
  },
  {
    key: 'analytics',
    titleKey: 'menu.analytics.title',
    icon: BarChart,
    minRoleLevel: 2,
    requiredPermissions: ['analytics:view:team'],
    children: [
      {
        key: 'analytics_team',
        titleKey: 'menu.analytics.team',
        icon: TrendingUp,
        path: '/analytics/team',
        minRoleLevel: 2,
        requiredPermissions: ['analytics:view:team'],
      },
      {
        key: 'analytics_projects',
        titleKey: 'menu.analytics.projects',
        icon: FileBarChart,
        path: '/analytics/projects',
        minRoleLevel: 2,
        requiredPermissions: ['analytics:view:team'],
      },
    ],
  },
  {
    key: 'support',
    titleKey: 'menu.support',
    icon: Headphones,
    path: '/support',
    minRoleLevel: 2,
    requiredPermissions: ['support:create:own'],
  },

  // ========== ADMIN LEVEL (3) ==========
  {
    key: 'admin-section',
    titleKey: 'menu.section.admin',
    icon: ShieldCheck,
    minRoleLevel: 3,
    sectionHeader: true,
  },
  {
    key: 'content',
    titleKey: 'menu.content.title',
    icon: FolderCog,
    minRoleLevel: 3,
    requiredPermissions: ['landing_page:view:all'],
    children: [
      {
        key: 'content_landing',
        titleKey: 'menu.content.landingPages',
        icon: Globe,
        minRoleLevel: 3,
        requiredPermissions: ['landing_page:view:all'],
        children: [
          {
            key: 'content_landing_all',
            titleKey: 'menu.content.allPages',
            icon: Globe,
            path: '/admin/landing-pages',
            minRoleLevel: 3,
            requiredPermissions: ['landing_page:view:all'],
          },
          {
            key: 'content_landing_create',
            titleKey: 'menu.content.createPage',
            icon: FilePlus,
            path: '/admin/landing-pages/create',
            minRoleLevel: 3,
            requiredPermissions: ['landing_page:create:all'],
          },
          {
            key: 'content_landing_builder',
            titleKey: 'menu.content.pageBuilder',
            icon: Layout,
            path: '/admin/landing-pages/builder',
            minRoleLevel: 3,
            requiredPermissions: ['landing_page:edit:all'],
          },
        ],
      },
      {
        key: 'content_stories',
        titleKey: 'menu.content.storiesManagement',
        icon: FileText,
        minRoleLevel: 3,
        requiredPermissions: ['story:manage:all'],
        children: [
          {
            key: 'content_stories_all',
            titleKey: 'menu.content.allStories',
            icon: FileStack,
            path: '/admin/stories',
            minRoleLevel: 3,
            requiredPermissions: ['story:manage:all'],
          },
          {
            key: 'content_stories_pending',
            titleKey: 'menu.content.pendingReview',
            icon: FileClock,
            path: '/admin/stories/pending',
            minRoleLevel: 3,
            requiredPermissions: ['story:moderate:all'],
          },
          {
            key: 'content_stories_reported',
            titleKey: 'menu.content.reportedStories',
            icon: AlertTriangle,
            path: '/admin/stories/reported',
            minRoleLevel: 3,
            requiredPermissions: ['story:moderate:all'],
          },
        ],
      },
      {
        key: 'content_media',
        titleKey: 'menu.content.mediaLibrary',
        icon: Images,
        path: '/admin/media',
        minRoleLevel: 3,
        requiredPermissions: ['media:manage:all'],
      },
    ],
  },
  {
    key: 'users',
    titleKey: 'menu.users.title',
    icon: Users,
    minRoleLevel: 3,
    requiredPermissions: ['user:view:all'],
    children: [
      {
        key: 'users_all',
        titleKey: 'menu.users.allUsers',
        icon: UsersRound,
        path: '/admin/users',
        minRoleLevel: 3,
        requiredPermissions: ['user:view:all'],
      },
      {
        key: 'users_active',
        titleKey: 'menu.users.activeUsers',
        icon: UserCheck,
        path: '/admin/users/active',
        minRoleLevel: 3,
        requiredPermissions: ['user:view:all'],
      },
      {
        key: 'users_suspended',
        titleKey: 'menu.users.suspendedUsers',
        icon: UserX,
        path: '/admin/users/suspended',
        minRoleLevel: 3,
        requiredPermissions: ['user:suspend:all'],
      },
      {
        key: 'users_roles',
        titleKey: 'menu.users.userRoles',
        icon: ShieldCheck,
        path: '/admin/users/roles',
        minRoleLevel: 3,
        requiredPermissions: ['user:manage:all'],
      },
    ],
  },
  {
    key: 'activities',
    titleKey: 'menu.activities.title',
    icon: Activity,
    minRoleLevel: 3,
    requiredPermissions: ['activity:view:all'],
    children: [
      {
        key: 'activities_recent',
        titleKey: 'menu.activities.recent',
        icon: Clock,
        path: '/admin/activities/recent',
        minRoleLevel: 3,
        requiredPermissions: ['activity:view:all'],
      },
      {
        key: 'activities_logins',
        titleKey: 'menu.activities.loginHistory',
        icon: LogIn,
        path: '/admin/activities/logins',
        minRoleLevel: 3,
        requiredPermissions: ['activity:view:all'],
      },
      {
        key: 'activities_actions',
        titleKey: 'menu.activities.actionLogs',
        icon: FileSearch,
        path: '/admin/activities/actions',
        minRoleLevel: 3,
        requiredPermissions: ['activity:view:all'],
      },
      {
        key: 'activities_suspicious',
        titleKey: 'menu.activities.suspicious',
        icon: AlertOctagon,
        path: '/admin/activities/suspicious',
        minRoleLevel: 3,
        requiredPermissions: ['activity:monitor:all'],
      },
    ],
  },
  {
    key: 'reports',
    titleKey: 'menu.reports.title',
    icon: FileText,
    minRoleLevel: 3,
    requiredPermissions: ['report:view:all'],
    children: [
      {
        key: 'reports_users',
        titleKey: 'menu.reports.userStats',
        icon: Users,
        path: '/admin/reports/users',
        minRoleLevel: 3,
        requiredPermissions: ['report:view:all'],
      },
      {
        key: 'reports_content',
        titleKey: 'menu.reports.contentStats',
        icon: FileBarChart,
        path: '/admin/reports/content',
        minRoleLevel: 3,
        requiredPermissions: ['report:view:all'],
      },
      {
        key: 'reports_engagement',
        titleKey: 'menu.reports.engagement',
        icon: TrendingUp,
        path: '/admin/reports/engagement',
        minRoleLevel: 3,
        requiredPermissions: ['report:view:all'],
      },
      {
        key: 'reports_export',
        titleKey: 'menu.reports.export',
        icon: Download,
        path: '/admin/reports/export',
        minRoleLevel: 3,
        requiredPermissions: ['report:export:all'],
      },
    ],
  },

  // ========== SUPER ADMIN LEVEL (4) ==========
  {
    key: 'superadmin-section',
    titleKey: 'menu.section.superadmin',
    icon: Shield,
    minRoleLevel: 4,
    sectionHeader: true,
  },
  {
    key: 'system',
    titleKey: 'menu.system.title',
    icon: Settings,
    minRoleLevel: 4,
    requiredPermissions: ['system:manage:all'],
    children: [
      {
        key: 'system_general',
        titleKey: 'menu.system.general',
        icon: Sliders,
        path: '/system/settings/general',
        minRoleLevel: 4,
        requiredPermissions: ['system:manage:all'],
      },
      {
        key: 'system_environment',
        titleKey: 'menu.system.environment',
        icon: Code,
        path: '/system/settings/environment',
        minRoleLevel: 4,
        requiredPermissions: ['system:manage:all'],
      },
      {
        key: 'system_features',
        titleKey: 'menu.system.features',
        icon: Flag,
        path: '/system/settings/features',
        minRoleLevel: 4,
        requiredPermissions: ['system:manage:all'],
      },
      {
        key: 'system_email',
        titleKey: 'menu.system.email',
        icon: Mail,
        path: '/system/settings/email',
        minRoleLevel: 4,
        requiredPermissions: ['system:manage:all'],
      },
      {
        key: 'system_storage',
        titleKey: 'menu.system.storage',
        icon: HardDrive,
        path: '/system/settings/storage',
        minRoleLevel: 4,
        requiredPermissions: ['system:manage:all'],
      },
    ],
  },
  {
    key: 'database',
    titleKey: 'menu.database.title',
    icon: Database,
    minRoleLevel: 4,
    requiredPermissions: ['database:manage:all'],
    children: [
      {
        key: 'database_policies',
        titleKey: 'menu.database.policies',
        icon: Shield,
        path: '/system/database/policies',
        minRoleLevel: 4,
        requiredPermissions: ['database:manage:all'],
      },
      {
        key: 'database_performance',
        titleKey: 'menu.database.performance',
        icon: Zap,
        path: '/system/database/performance',
        minRoleLevel: 4,
        requiredPermissions: ['database:monitor:all'],
      },
      {
        key: 'database_indexes',
        titleKey: 'menu.database.indexes',
        icon: List,
        path: '/system/database/indexes',
        minRoleLevel: 4,
        requiredPermissions: ['database:manage:all'],
      },
      {
        key: 'database_migrations',
        titleKey: 'menu.database.migrations',
        icon: GitBranch,
        path: '/system/database/migrations',
        minRoleLevel: 4,
        requiredPermissions: ['database:manage:all'],
      },
      {
        key: 'database_backups',
        titleKey: 'menu.database.backups',
        icon: Archive,
        path: '/system/database/backups',
        minRoleLevel: 4,
        requiredPermissions: ['database:backup:all'],
      },
    ],
  },
  {
    key: 'security',
    titleKey: 'menu.security.title',
    icon: Lock,
    minRoleLevel: 4,
    requiredPermissions: ['security:manage:all'],
    children: [
      {
        key: 'security_policies',
        titleKey: 'menu.security.policies',
        icon: ShieldAlert,
        path: '/system/security/policies',
        minRoleLevel: 4,
        requiredPermissions: ['security:manage:all'],
      },
      {
        key: 'security_ssl',
        titleKey: 'menu.security.ssl',
        icon: Key,
        path: '/system/security/ssl',
        minRoleLevel: 4,
        requiredPermissions: ['security:manage:all'],
      },
      {
        key: 'security_ratelimit',
        titleKey: 'menu.security.rateLimit',
        icon: Timer,
        path: '/system/security/rate-limiting',
        minRoleLevel: 4,
        requiredPermissions: ['security:manage:all'],
      },
      {
        key: 'security_whitelist',
        titleKey: 'menu.security.whitelist',
        icon: CheckCircle,
        path: '/system/security/whitelist',
        minRoleLevel: 4,
        requiredPermissions: ['security:manage:all'],
      },
      {
        key: 'security_blacklist',
        titleKey: 'menu.security.blacklist',
        icon: XCircle,
        path: '/system/security/blacklist',
        minRoleLevel: 4,
        requiredPermissions: ['security:manage:all'],
      },
      {
        key: 'security_firewall',
        titleKey: 'menu.security.firewall',
        icon: Shield,
        path: '/system/security/firewall',
        minRoleLevel: 4,
        requiredPermissions: ['security:manage:all'],
      },
    ],
  },
  {
    key: 'logs',
    titleKey: 'menu.logs.title',
    icon: ScrollText,
    minRoleLevel: 4,
    requiredPermissions: ['log:view:all'],
    children: [
      {
        key: 'logs_audit',
        titleKey: 'menu.logs.audit',
        icon: FileSearch,
        path: '/system/logs/audit',
        minRoleLevel: 4,
        requiredPermissions: ['log:view:all'],
      },
      {
        key: 'logs_system',
        titleKey: 'menu.logs.system',
        icon: Terminal,
        path: '/system/logs/system',
        minRoleLevel: 4,
        requiredPermissions: ['log:view:all'],
      },
      {
        key: 'logs_errors',
        titleKey: 'menu.logs.errors',
        icon: AlertCircle,
        path: '/system/logs/errors',
        minRoleLevel: 4,
        requiredPermissions: ['log:view:all'],
      },
      {
        key: 'logs_access',
        titleKey: 'menu.logs.access',
        icon: LogIn,
        path: '/system/logs/access',
        minRoleLevel: 4,
        requiredPermissions: ['log:view:all'],
      },
      {
        key: 'logs_queries',
        titleKey: 'menu.logs.queries',
        icon: Database,
        path: '/system/logs/queries',
        minRoleLevel: 4,
        requiredPermissions: ['log:view:all'],
      },
    ],
  },
  {
    key: 'automation',
    titleKey: 'menu.automation.title',
    icon: Zap,
    minRoleLevel: 4,
    requiredPermissions: ['automation:manage:all'],
    children: [
      {
        key: 'automation_triggers',
        titleKey: 'menu.automation.triggers',
        icon: GitBranch,
        path: '/system/automation/triggers',
        minRoleLevel: 4,
        requiredPermissions: ['automation:manage:all'],
      },
      {
        key: 'automation_jobs',
        titleKey: 'menu.automation.jobs',
        icon: Clock,
        path: '/system/automation/jobs',
        minRoleLevel: 4,
        requiredPermissions: ['automation:manage:all'],
      },
      {
        key: 'automation_webhooks',
        titleKey: 'menu.automation.webhooks',
        icon: Webhook,
        path: '/system/automation/webhooks',
        minRoleLevel: 4,
        requiredPermissions: ['automation:manage:all'],
      },
      {
        key: 'automation_email',
        titleKey: 'menu.automation.emailTriggers',
        icon: Mail,
        path: '/system/automation/email-triggers',
        minRoleLevel: 4,
        requiredPermissions: ['automation:manage:all'],
      },
    ],
  },
  {
    key: 'roles_permissions',
    titleKey: 'menu.rolesPermissions.title',
    icon: ShieldCheck,
    minRoleLevel: 4,
    requiredPermissions: ['role:manage:all'],
    children: [
      {
        key: 'roles_manage',
        titleKey: 'menu.rolesPermissions.roles',
        icon: UserCog,
        path: '/system/roles',
        minRoleLevel: 4,
        requiredPermissions: ['role:manage:all'],
      },
      {
        key: 'permissions_manage',
        titleKey: 'menu.rolesPermissions.permissions',
        icon: Key,
        path: '/system/permissions',
        minRoleLevel: 4,
        requiredPermissions: ['permission:manage:all'],
      },
      {
        key: 'access_control',
        titleKey: 'menu.rolesPermissions.accessControl',
        icon: Lock,
        path: '/system/access-control',
        minRoleLevel: 4,
        requiredPermissions: ['permission:manage:all'],
      },
    ],
  },
];

/**
 * Filter menu items based on user's role level and permissions
 *
 * Role hierarchy: Superadmin (5) > Admin (4) > Premium (3) > User (2) > Guest (1)
 * Higher roles inherit all permissions from lower roles automatically
 */
export function filterMenuByRole(
  items: MenuItem[],
  userRoleLevel: number,
  userPermissions: string[]
): MenuItem[] {
  return items
    .filter((item) => {
      // Check role level - this is the primary filter
      if (item.minRoleLevel > userRoleLevel) return false;

      // Check permissions if required
      // IMPORTANT: Superadmin (level 5) and Admin (level 4) bypass permission checks
      // because they inherit all lower-level permissions
      if (item.requiredPermissions && item.requiredPermissions.length > 0) {
        // Superadmin and Admin roles have all permissions by design
        if (userRoleLevel >= 4) {
          return true; // Skip permission check for Admin and Superadmin
        }

        const hasPermission = item.requiredPermissions.some((perm) =>
          userPermissions.includes(perm)
        );
        if (!hasPermission) return false;
      }

      return true;
    })
    .map((item) => {
      // Recursively filter children
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterMenuByRole(item.children, userRoleLevel, userPermissions),
        };
      }
      return item;
    })
    .filter((item) => {
      // Remove items with no children if they had children before
      if (item.children !== undefined && item.children.length === 0) {
        return false;
      }
      return true;
    });
}

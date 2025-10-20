import { router } from '../trpc';
import { authRouter } from './auth.router';
import { userRouter } from './user.router';
import { roleRouter } from './role.router';
import { permissionRouter } from './permission.router';
import { calendarRouter } from './calendar.router';
import { storiesRouter } from './stories.router';
import { likesRouter } from './likes.router';
import { reactionsRouter } from './reactions.router';
import { commentsRouter } from './comments.router';
import { commentReactionsRouter } from './comment-reactions.router';
import { messagesRouter } from './messages.router';
import { connectionsRouter } from './connections.router';
import { notificationsRouter } from './notifications.router';
import { teamsRouter } from './team/teams.router';
import { teamCalendarRouter } from './team/calendar.router';
import { teamStoriesRouter } from './team/stories.router';
import { teamChannelsRouter } from './team/channels.router';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  role: roleRouter,
  permission: permissionRouter,
  calendar: calendarRouter,
  stories: storiesRouter,
  likes: likesRouter,
  reactions: reactionsRouter,
  comments: commentsRouter,
  commentReactions: commentReactionsRouter,
  messages: messagesRouter,
  connections: connectionsRouter,
  notifications: notificationsRouter,
  // Team namespace - all team-related routers
  team: router({
    teams: teamsRouter,
    calendar: teamCalendarRouter,
    stories: teamStoriesRouter,
    channels: teamChannelsRouter,
  }),
});

export type AppRouter = typeof appRouter;

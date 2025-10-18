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
});

export type AppRouter = typeof appRouter;

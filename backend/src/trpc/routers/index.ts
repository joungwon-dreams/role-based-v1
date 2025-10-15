import { router } from '../trpc';
import { authRouter } from './auth.router';
import { userRouter } from './user.router';
import { roleRouter } from './role.router';
import { permissionRouter } from './permission.router';
import { calendarRouter } from './calendar.router';
import { storiesRouter } from './stories.router';
import { likesRouter } from './likes.router';
import { commentsRouter } from './comments.router';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  role: roleRouter,
  permission: permissionRouter,
  calendar: calendarRouter,
  stories: storiesRouter,
  likes: likesRouter,
  comments: commentsRouter,
});

export type AppRouter = typeof appRouter;

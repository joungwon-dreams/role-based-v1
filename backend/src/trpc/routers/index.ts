import { router } from '../trpc';
import { authRouter } from './auth.router';
import { userRouter } from './user.router';
import { roleRouter } from './role.router';
import { permissionRouter } from './permission.router';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  role: roleRouter,
  permission: permissionRouter,
});

export type AppRouter = typeof appRouter;

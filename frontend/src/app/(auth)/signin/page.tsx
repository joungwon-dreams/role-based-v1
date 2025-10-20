'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { trpcClient } from '@/lib/trpc/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SigninForm = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninForm) => {
    setIsLoading(true);
    try {
      const result = await trpcClient.auth.signin.mutate(data);

      // Store tokens in localStorage for development (cookies might not work cross-origin)
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
      }
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      if (result.csrfToken) {
        localStorage.setItem('csrfToken', result.csrfToken);
      }

      // Update auth store with user info (triggers isAuthenticated = true)
      login(result.user);

      toast.success('Successfully signed in!');
      router.push('/dashboard');
    } catch (error: any) {
      // Extract error message from different error formats
      let errorMessage = 'Failed to sign in';
      let errorDescription = '';

      if (error?.message) {
        errorMessage = error.message;

        // Provide Korean description based on common error messages
        if (error.message.includes('Invalid credentials') || error.message.includes('Invalid email or password')) {
          errorDescription = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.message.includes('User not found')) {
          errorDescription = '사용자를 찾을 수 없습니다.';
        } else if (error.message.includes('Account is disabled') || error.message.includes('Account locked')) {
          errorDescription = '계정이 비활성화되었습니다. 관리자에게 문의하세요.';
        } else if (error.message.includes('Too many attempts')) {
          errorDescription = '로그인 시도 횟수가 초과되었습니다. 잠시 후 다시 시도하세요.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorDescription = '네트워크 오류가 발생했습니다. 연결을 확인하세요.';
        } else {
          errorDescription = '로그인에 실패했습니다. 다시 시도해주세요.';
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 10000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  {...register('password')}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

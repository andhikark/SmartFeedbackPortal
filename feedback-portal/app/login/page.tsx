'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MessageSquare } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const cleanEmail = email.trim().toLowerCase().replace(/\u200B/g, ''); 
  const cleanPassword = password; 

  console.log('EMAIL RAW:', JSON.stringify(email));
  console.log('EMAIL CLEAN:', JSON.stringify(cleanEmail));
  console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  try {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
      });
      if (error) throw error;

      toast({ title: 'Account created!', description: 'You can now log in with your credentials.' });
      setIsSignUp(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });
      if (error) throw error;

      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      router.push('/dashboard');
      router.refresh();
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    toast({
      title: isSignUp ? 'Sign up failed' : 'Login failed',
      description: error.message || 'Please check your credentials and try again.',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <MessageSquare className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Smart Feedback Portal</CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? 'Create an account to start submitting feedback'
              : 'Sign in to your account to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>{isSignUp ? 'Sign Up' : 'Sign In'}</>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
              disabled={isLoading}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>✨ Automated feedback classification</p>
              <p>📊 Real-time priority detection</p>
              <p>🔄 Instant updates via Supabase Realtime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FeedbackForm } from '@/components/feedback-form';
import { FeedbackList } from '@/components/feedback-list';
import { AuthButton } from '@/components/auth-button';
import { MessageSquare } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (feedbackError) {
    console.error('Error fetching feedback:', feedbackError);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Smart Feedback Portal</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered feedback classification
                </p>
              </div>
            </div>
            <AuthButton userEmail={user.email || ''} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <FeedbackForm userId={user.id} />
          </div>

          <div>
            <FeedbackList userId={user.id} initialFeedback={feedback || []} />
          </div>
        </div>

        <div className="mt-12 bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium mb-1">Submit Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Describe your issue, suggestion, or bug report in detail
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium mb-1">Automatic Classification</h3>
                <p className="text-sm text-muted-foreground">
                  n8n workflow analyzes and categorizes your feedback
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium mb-1">Real-time Update</h3>
                <p className="text-sm text-muted-foreground">
                  See classification results instantly without refreshing
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 mt-12 text-center text-sm text-muted-foreground">
        <p>
          Built with Next.js 14, Supabase, and n8n • Powered by{' '}
          <span className="font-semibold">Realtime</span> technology
        </p>
      </footer>
    </div>
  );
}

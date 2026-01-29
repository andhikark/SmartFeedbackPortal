'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { Clock, Loader2, AlertCircle } from 'lucide-react';
import type { Feedback } from '@/lib/types';

interface FeedbackListProps {
  userId: string;
  initialFeedback: Feedback[];
}

export function FeedbackList({ userId, initialFeedback }: FeedbackListProps) {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFeedback((current) => [payload.new as Feedback, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setFeedback((current) =>
              current.map((item) =>
                item.id === payload.new.id ? (payload.new as Feedback) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setFeedback((current) =>
              current.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const getPriorityVariant = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCategoryVariant = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'bug':
        return 'destructive';
      case 'feature':
        return 'default';
      case 'urgent':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processed':
        return 'success';
      case 'reviewed':
        return 'default';
      case 'resolved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No feedback yet</p>
            <p className="text-sm mt-2">Submit your first feedback using the form above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Feedback</h2>
        <Badge variant="outline">{feedback.length} Total</Badge>
      </div>

      <div className="space-y-4">
        {feedback.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(item.created_at)}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                  {item.priority && (
                    <Badge variant={getPriorityVariant(item.priority)}>
                      {item.priority} Priority
                    </Badge>
                  )}
                  {item.category && (
                    <Badge variant={getCategoryVariant(item.category)}>
                      {item.category}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {item.description}
              </p>
              
              {item.status === 'Pending' && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-600 dark:text-yellow-400" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      Being processed... Classification and prioritization in progress
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

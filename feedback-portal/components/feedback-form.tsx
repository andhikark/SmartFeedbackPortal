'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import type { FeedbackFormData } from '@/lib/types';

interface FeedbackFormProps {
  userId: string;
}

export function FeedbackForm({ userId }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    title: '',
    description: '',
  });
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.title.length < 3 || formData.title.length > 200) {
      toast({
        title: 'Invalid title',
        description: 'Title must be between 3 and 200 characters',
        variant: 'destructive',
      });
      return;
    }

    if (formData.description.length < 10 || formData.description.length > 5000) {
      toast({
        title: 'Invalid description',
        description: 'Description must be between 10 and 5000 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          user_id: userId,
          title: formData.title,
          description: formData.description,
          status: 'Pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Feedback submitted!',
        description: 'Your feedback is being processed. It will be classified shortly.',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
        <CardDescription>
          Share your thoughts, report bugs, or suggest improvements. Your feedback will be automatically classified and prioritized.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief summary of your feedback"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={3}
              maxLength={200}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your feedback in detail. Include keywords like 'urgent', 'broken', or 'error' for high-priority issues."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/5000 characters
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

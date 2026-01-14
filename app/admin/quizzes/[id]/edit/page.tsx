"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizApi } from '@/lib/api';
import type { Quiz, QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.id as string);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit_minutes: '',
    start_time: '',
    end_time: '',
    show_correct_answer: false,
    total_points: '',
    status: 'draft' as 'draft' | 'published' | 'closed',
  });

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await quizApi.admin.getQuiz(quizId);
      setQuiz(quizData);
      setFormData({
        title: quizData.title,
        description: quizData.description || '',
        time_limit_minutes: quizData.time_limit_minutes?.toString() || '',
        start_time: quizData.start_time ? new Date(quizData.start_time).toISOString().slice(0, 16) : '',
        end_time: quizData.end_time ? new Date(quizData.end_time).toISOString().slice(0, 16) : '',
        show_correct_answer: quizData.show_correct_answer,
        total_points: quizData.total_points.toString(),
        status: quizData.status,
      });
    } catch (error: any) {
      console.error('Failed to load quiz:', error);
      alert(error.message || 'Failed to load quiz');
      router.push('/admin/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        time_limit_minutes: formData.time_limit_minutes ? parseInt(formData.time_limit_minutes) : null,
        total_points: parseInt(formData.total_points),
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };

      await quizApi.admin.updateQuiz(quizId, updateData);
      router.push('/admin/quizzes');
    } catch (error: any) {
      alert(error.message || 'Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Quiz</CardTitle>
          <CardDescription>Update quiz details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_limit_minutes">Time Limit (minutes)</Label>
                <Input
                  id="time_limit_minutes"
                  type="number"
                  value={formData.time_limit_minutes}
                  onChange={(e) => setFormData({ ...formData, time_limit_minutes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_points">Total Points *</Label>
                <Input
                  id="total_points"
                  type="number"
                  value={formData.total_points}
                  onChange={(e) => setFormData({ ...formData, total_points: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show_correct_answer"
                checked={formData.show_correct_answer}
                onChange={(e) => setFormData({ ...formData, show_correct_answer: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="show_correct_answer">Show correct answers after submission</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'closed' })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProtectedEditQuizPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'super_admin']}>
      <EditQuizPage />
    </ProtectedRoute>
  );
}

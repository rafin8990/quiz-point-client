"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { quizApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { QuizQuestion } from '@/types';

function CreateQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit_minutes: '',
    start_time: '',
    end_time: '',
    show_correct_answer: false,
    total_points: '',
    status: 'draft' as 'draft' | 'published',
  });
  const [questions, setQuestions] = useState<Array<Partial<QuizQuestion> & { options?: Array<{ option_text: string; is_correct: boolean }> }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quizData = {
        ...formData,
        time_limit_minutes: formData.time_limit_minutes ? parseInt(formData.time_limit_minutes) : undefined,
        total_points: parseInt(formData.total_points),
        questions: questions.map((q, idx) => ({
          question_text: q.question_text || '',
          question_type: q.question_type || 'mcq',
          points: q.points || 1,
          order_index: idx,
          is_required: q.is_required ?? true,
          options: q.question_type === 'mcq' ? (q.options || []) : undefined,
        })),
      };

      await quizApi.admin.createQuiz(quizData);
      router.push('/admin/quizzes');
    } catch (error: any) {
      alert(error.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question_type: 'mcq', points: 1, options: [] }]);
  };

  const updateQuestion = (index: number, data: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...data };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = [];
    }
    updated[questionIndex].options!.push({ option_text: '', is_correct: false });
    setQuestions(updated);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Quiz</CardTitle>
          <CardDescription>Fill in the details to create a new quiz</CardDescription>
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <Label>Questions</Label>
                <Button type="button" onClick={addQuestion} variant="outline">
                  Add Question
                </Button>
              </div>

              {questions.map((question, qIdx) => (
                <Card key={qIdx} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">Question {qIdx + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text *</Label>
                      <Input
                        value={question.question_text || ''}
                        onChange={(e) => updateQuestion(qIdx, { question_text: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Question Type *</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={question.question_type || 'mcq'}
                          onChange={(e) => {
                            updateQuestion(qIdx, {
                              question_type: e.target.value as 'mcq' | 'descriptive',
                              options: e.target.value === 'mcq' ? (question.options || []) : undefined,
                            });
                          }}
                        >
                          <option value="mcq">MCQ</option>
                          <option value="descriptive">Descriptive</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Points *</Label>
                        <Input
                          type="number"
                          value={question.points || 1}
                          onChange={(e) => updateQuestion(qIdx, { points: parseInt(e.target.value) || 1 })}
                          required
                        />
                      </div>
                    </div>

                    {question.question_type === 'mcq' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Options</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(qIdx)}
                          >
                            Add Option
                          </Button>
                        </div>
                        {question.options?.map((option, optIdx) => (
                          <div key={optIdx} className="flex gap-2 items-center">
                            <Input
                              value={option.option_text}
                              onChange={(e) => {
                                const updated = [...questions];
                                if (updated[qIdx].options) {
                                  updated[qIdx].options![optIdx].option_text = e.target.value;
                                }
                                setQuestions(updated);
                              }}
                              placeholder="Option text"
                            />
                            <input
                              type="checkbox"
                              checked={option.is_correct}
                              onChange={(e) => {
                                const updated = [...questions];
                                if (updated[qIdx].options) {
                                  updated[qIdx].options![optIdx].is_correct = e.target.checked;
                                }
                                setQuestions(updated);
                              }}
                              className="rounded"
                            />
                            <Label className="text-sm">Correct</Label>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updated = [...questions];
                                if (updated[qIdx].options) {
                                  updated[qIdx].options = updated[qIdx].options!.filter((_, i) => i !== optIdx);
                                }
                                setQuestions(updated);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Quiz'}
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

export default function ProtectedCreateQuizPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'super_admin']}>
      <CreateQuizPage />
    </ProtectedRoute>
  );
}

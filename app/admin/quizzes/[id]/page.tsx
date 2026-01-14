"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizApi } from '@/lib/api';
import type { Quiz, QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Edit, Trash2, Settings, Eye, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function AdminQuizViewPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.id as string);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId || isNaN(quizId)) {
      router.push('/admin/quizzes');
      return;
    }
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await quizApi.admin.getQuiz(quizId);
      setQuiz(quizData);
    } catch (error: any) {
      console.error('Failed to load quiz:', error);
      alert(error.message || 'Failed to load quiz');
      router.push('/admin/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await quizApi.admin.deleteQuiz(quizId);
      router.push('/admin/quizzes');
    } catch (error: any) {
      alert(error.message || 'Failed to delete quiz');
    }
  };

  const handlePublish = async () => {
    try {
      await quizApi.admin.publishQuiz(quizId);
      loadQuiz();
    } catch (error: any) {
      alert(error.message || 'Failed to publish quiz');
    }
  };

  const handlePublishResults = async () => {
    try {
      await quizApi.admin.publishResults(quizId);
      loadQuiz();
    } catch (error: any) {
      alert(error.message || 'Failed to publish results');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading quiz details...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Quiz not found.</p>
          <Button onClick={() => router.push('/admin/quizzes')}>Back to Quizzes</Button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const submissions = quiz.submissions || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.push('/admin/quizzes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/quizzes/${quizId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Quiz
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/quizzes/${quizId}/submissions`)}
          >
            <Settings className="mr-2 h-4 w-4" />
            View Submissions
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quiz Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
              <CardDescription className="text-base">
                {quiz.description || 'No description available'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={
                  quiz.status === 'published'
                    ? 'default'
                    : quiz.status === 'closed'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {quiz.status}
              </Badge>
              {quiz.results_published && (
                <Badge variant="outline">Results Published</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Time</p>
              <p className="font-medium">{formatDate(quiz.start_time)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">End Time</p>
              <p className="font-medium">{formatDate(quiz.end_time)}</p>
            </div>
            {quiz.time_limit_minutes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Time Limit</p>
                <p className="font-medium">{quiz.time_limit_minutes} minutes</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Points</p>
              <p className="font-medium">{quiz.total_points} points</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Number of Questions</p>
              <p className="font-medium">{questions.length} questions</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Submissions</p>
              <p className="font-medium">{submissions.length} submissions</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Show Correct Answer</p>
              <p className="font-medium">{quiz.show_correct_answer ? 'Yes' : 'No'}</p>
            </div>
            {quiz.creator && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Created By</p>
                <p className="font-medium">{quiz.creator.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Created At</p>
              <p className="font-medium">{formatDate(quiz.created_at)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6 pt-6 border-t">
            {quiz.status === 'draft' && (
              <Button onClick={handlePublish}>
                Publish Quiz
              </Button>
            )}
            {quiz.status === 'published' && !quiz.results_published && (
              <Button onClick={handlePublishResults} variant="outline">
                Publish Results
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push(`/quizzes/${quizId}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View as Participant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Questions ({questions.length})</CardTitle>
          <CardDescription>All questions in this quiz</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No questions added yet.</p>
              <Button onClick={() => router.push(`/admin/quizzes/${quizId}/edit`)}>
                Add Questions
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question: QuizQuestion, index: number) => (
                <Card key={question.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Question {index + 1}: {question.question_text}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Type: {question.question_type === 'mcq' ? 'Multiple Choice' : 'Descriptive'} • 
                          Points: {question.points} • 
                          Required: {question.is_required ? 'Yes' : 'No'}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{question.points} pts</Badge>
                    </div>
                  </CardHeader>
                  {question.question_type === 'mcq' && question.options && question.options.length > 0 && (
                    <CardContent>
                      <p className="text-sm font-medium mb-2">Options:</p>
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`p-3 rounded border ${
                              option.is_correct
                                ? 'bg-green-50 border-green-500 font-medium'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.option_text}</span>
                              {option.is_correct && (
                                <Badge className="bg-green-500">Correct Answer</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Submissions Summary</CardTitle>
              <CardDescription>Overview of quiz submissions</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/quizzes/${quizId}/submissions`)}
            >
              View All Submissions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No submissions yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.slice(0, 5).map((submission: any) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      {submission.user?.name || `User #${submission.user_id}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          submission.status === 'submitted'
                            ? 'default'
                            : submission.status === 'closed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.status === 'submitted'
                        ? `${submission.total_score} / ${quiz.total_points}`
                        : '-'}
                    </TableCell>
                    <TableCell>{formatDate(submission.started_at)}</TableCell>
                    <TableCell>
                      {submission.submitted_at
                        ? formatDate(submission.submitted_at)
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {submissions.length > 5 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/quizzes/${quizId}/submissions`)}
              >
                View All {submissions.length} Submissions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProtectedAdminQuizViewPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'super_admin']}>
      <AdminQuizViewPage />
    </ProtectedRoute>
  );
}

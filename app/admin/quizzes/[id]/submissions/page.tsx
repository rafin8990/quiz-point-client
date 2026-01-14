"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizApi } from '@/lib/api';
import type { QuizSubmission, QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function QuizSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.id as string);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSubmissions();
  }, [quizId, currentPage]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await quizApi.admin.getSubmissions(quizId, { page: currentPage });
      setSubmissions(response.data);
      setTotalPages(response.last_page);
    } catch (error: any) {
      console.error('Failed to load submissions:', error);
      alert(error.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionDetails = async (submissionId: number) => {
    try {
      const submission = await quizApi.admin.getSubmission(quizId, submissionId);
      setSelectedSubmission(submission);
    } catch (error: any) {
      console.error('Failed to load submission:', error);
      alert(error.message || 'Failed to load submission details');
    }
  };

  const handleGradeDescriptive = async (submissionId: number, answerId: number, score: number, isCorrect: boolean, feedback: string) => {
    try {
      setGrading({ ...grading, [answerId]: true });
      await quizApi.admin.gradeDescriptive(submissionId, answerId, {
        score_awarded: score,
        is_correct: isCorrect,
        feedback: feedback,
      });
      
      // Reload submission details
      await loadSubmissionDetails(submissionId);
      await loadSubmissions();
    } catch (error: any) {
      alert(error.message || 'Failed to grade answer');
    } finally {
      setGrading({ ...grading, [answerId]: false });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/admin/quizzes')}>
          Back to Quizzes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>List of all quiz submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No submissions yet.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow
                        key={submission.id}
                        className={selectedSubmission?.id === submission.id ? 'bg-blue-50' : ''}
                      >
                        <TableCell>{submission.user?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.status === 'submitted'
                                ? 'default'
                                : submission.status === 'in_progress'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.total_score} / {submission.quiz?.total_points || 0}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => loadSubmissionDetails(submission.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Submission Details & Grading */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
            <CardDescription>
              {selectedSubmission
                ? `Reviewing submission by ${selectedSubmission.user?.name || 'Unknown'}`
                : 'Select a submission to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedSubmission ? (
              <p className="text-center text-gray-500 py-8">
                Select a submission from the list to view and grade answers.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Score</Label>
                    <p className="text-2xl font-bold">
                      {selectedSubmission.total_score} / {selectedSubmission.quiz?.total_points || 0}
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={selectedSubmission.status === 'submitted' ? 'default' : 'secondary'}>
                      {selectedSubmission.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {selectedSubmission.quiz?.questions?.map((question, qIdx) => {
                    const answer = selectedSubmission.answers?.find(a => a.question_id === question.id);
                    const isDescriptive = question.question_type === 'descriptive';
                    const needsGrading = isDescriptive && (answer?.is_correct === null || answer?.score_awarded === 0);

                    return (
                      <Card key={question.id} className={needsGrading ? 'border-yellow-500 border-2' : ''}>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Question {qIdx + 1}: {question.question_text}
                          </CardTitle>
                          <CardDescription>
                            {question.question_type === 'mcq' ? 'MCQ' : 'Descriptive'} • {question.points} points
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {question.question_type === 'mcq' ? (
                            <div>
                              <p className="font-medium mb-2">Selected Answer:</p>
                              <p className="p-2 bg-gray-50 rounded">
                                {answer?.selectedOption?.option_text || 'No answer'}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                Score: {answer?.score_awarded || 0} / {question.points}
                              </p>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="font-medium mb-2">Answer:</p>
                                <p className="p-2 bg-gray-50 rounded min-h-[100px]">
                                  {answer?.answer_text || 'No answer provided'}
                                </p>
                              </div>
                              {needsGrading && (
                                <GradingForm
                                  question={question}
                                  answer={answer}
                                  onSubmit={(score, isCorrect, feedback) =>
                                    handleGradeDescriptive(selectedSubmission.id, answer!.id, score, isCorrect, feedback)
                                  }
                                  loading={grading[answer!.id] || false}
                                />
                              )}
                              {!needsGrading && answer && (
                                <div className="space-y-2">
                                  <p className="font-medium">Score: {answer.score_awarded} / {question.points}</p>
                                  {answer.feedback && (
                                    <div>
                                      <p className="font-medium mb-1">Feedback:</p>
                                      <p className="p-2 bg-blue-50 rounded">{answer.feedback}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GradingForm({
  question,
  answer,
  onSubmit,
  loading,
}: {
  question: QuizQuestion;
  answer: any;
  onSubmit: (score: number, isCorrect: boolean, feedback: string) => void;
  loading: boolean;
}) {
  const [score, setScore] = useState(answer?.score_awarded || 0);
  const [isCorrect, setIsCorrect] = useState(answer?.is_correct ?? false);
  const [feedback, setFeedback] = useState(answer?.feedback || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(score, isCorrect, feedback);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-yellow-50 rounded">
      <div className="space-y-2">
        <Label htmlFor={`score-${answer.id}`}>Score (0 - {question.points})</Label>
        <Input
          id={`score-${answer.id}`}
          type="number"
          min="0"
          max={question.points}
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value) || 0)}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`correct-${answer.id}`}
          checked={isCorrect}
          onChange={(e) => setIsCorrect(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor={`correct-${answer.id}`}>Mark as Correct</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`feedback-${answer.id}`}>Feedback (Optional)</Label>
        <Textarea
          id={`feedback-${answer.id}`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? 'Saving...' : 'Save Grade'}
      </Button>
    </form>
  );
}

export default function ProtectedQuizSubmissionsPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'super_admin']}>
      <QuizSubmissionsPage />
    </ProtectedRoute>
  );
}

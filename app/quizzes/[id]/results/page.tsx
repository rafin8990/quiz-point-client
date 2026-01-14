"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { submissionApi, quizApi } from '@/lib/api';
import type { QuizSubmission, Quiz } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = parseInt(params.id as string);
  const submissionId = searchParams.get('submission') ? parseInt(searchParams.get('submission')!) : null;
  const { isAuthenticated } = useAuth();
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/quizzes/${quizId}/results`);
      return;
    }
    loadResults();
  }, [quizId, submissionId, isAuthenticated]);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      if (submissionId) {
        const subResponse = await submissionApi.getSubmission(submissionId);
        setSubmission(subResponse.submission);
        
        const quizResponse = await quizApi.getQuiz(quizId);
        setQuiz(quizResponse.quiz);
      } else {
        // Try to find user's submission
        const quizResponse = await quizApi.getQuiz(quizId);
        setQuiz(quizResponse.quiz);
        
        if (quizResponse.submission_id) {
          const subResponse = await submissionApi.getSubmission(quizResponse.submission_id);
          setSubmission(subResponse.submission);
        }
      }
    } catch (error: any) {
      console.error('Failed to load results:', error);
      alert(error.message || 'Failed to load results');
      router.push(`/quizzes/${quizId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !quiz || !submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading results...</div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const answers = submission.answers || [];
  const showCorrectAnswers = quiz.show_correct_answer && (quiz.results_published || submission.status === 'submitted');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <CardDescription>Quiz Results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Score</p>
              <p className="text-2xl font-bold">{submission.total_score} / {quiz.total_points}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Percentage</p>
              <p className="text-2xl font-bold">
                {Math.round((submission.total_score / quiz.total_points) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant={submission.status === 'submitted' ? 'default' : 'secondary'}>
                {submission.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submitted At</p>
              <p className="text-sm">
                {submission.submitted_at
                  ? new Date(submission.submitted_at).toLocaleString()
                  : 'Not submitted'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Question Review</h2>
        {questions.map((question, index) => {
          const answer = answers.find(a => a.question_id === question.id);
          const isCorrect = answer?.is_correct;
          const scoreAwarded = answer?.score_awarded || 0;

          return (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Question {index + 1}: {question.question_text}
                    </CardTitle>
                    <CardDescription>
                      {question.question_type === 'mcq' ? 'Multiple Choice' : 'Descriptive'} • {question.points} points
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        isCorrect === true
                          ? 'default'
                          : isCorrect === false
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {scoreAwarded} / {question.points} pts
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {question.question_type === 'mcq' ? (
                  <>
                    <div className="space-y-2">
                      <p className="font-medium">Your Answer:</p>
                      {answer?.selectedOption ? (
                        <div className={`p-3 rounded border ${
                          showCorrectAnswers && answer.selectedOption.is_correct
                            ? 'bg-green-50 border-green-500'
                            : showCorrectAnswers && !answer.selectedOption.is_correct
                            ? 'bg-red-50 border-red-500'
                            : 'bg-gray-50'
                        }`}>
                          {answer.selectedOption.option_text}
                          {showCorrectAnswers && answer.selectedOption.is_correct && (
                            <Badge className="ml-2">Correct</Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">No answer provided</p>
                      )}
                    </div>
                    {showCorrectAnswers && question.options && (
                      <div className="space-y-2">
                        <p className="font-medium">All Options:</p>
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`p-2 rounded border ${
                              option.is_correct
                                ? 'bg-green-50 border-green-500 font-medium'
                                : 'bg-gray-50'
                            }`}
                          >
                            {option.option_text}
                            {option.is_correct && (
                              <Badge className="ml-2">Correct Answer</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="font-medium">Your Answer:</p>
                      <div className="p-3 rounded border bg-gray-50">
                        {answer?.answer_text || 'No answer provided'}
                      </div>
                    </div>
                    {answer?.feedback && (
                      <div className="space-y-2">
                        <p className="font-medium">Feedback:</p>
                        <div className="p-3 rounded border bg-blue-50">
                          {answer.feedback}
                        </div>
                      </div>
                    )}
                    {answer?.is_correct === null && (
                      <Badge variant="secondary">Pending Review</Badge>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={() => router.push(`/quizzes/${quizId}/leaderboard`)}>
          View Leaderboard
        </Button>
        <Button variant="outline" onClick={() => router.push('/quizzes')}>
          Back to Quizzes
        </Button>
      </div>
    </div>
  );
}

export default function ProtectedQuizResultsPage() {
  return (
    <ProtectedRoute>
      <QuizResultsPage />
    </ProtectedRoute>
  );
}

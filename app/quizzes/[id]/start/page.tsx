"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { quizApi, submissionApi } from '@/lib/api';
import type { Quiz, QuizSubmission, QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { checkQuizAvailability } from '@/lib/quizUtils';

function QuizTakingPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.id as string);
  const { isAuthenticated } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { selected_option_id?: number; answer_text?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/quizzes/${quizId}/start`);
      return;
    }
    loadQuiz();
  }, [quizId, isAuthenticated]);

  useEffect(() => {
    if (submission && quiz?.time_limit_minutes) {
      const startTime = new Date(submission.started_at).getTime();
      const timeLimitMs = quiz.time_limit_minutes * 60 * 1000;
      const endTime = startTime + timeLimitMs;

      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0) {
          handleAutoSubmit();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [submission, quiz]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizApi.getQuiz(quizId);
      setQuiz(response.quiz);

      // Check if quiz is available based on time
      const timeStatus = checkQuizAvailability(response.quiz.start_time, response.quiz.end_time);
      if (!timeStatus.isAvailable) {
        alert(timeStatus.message);
        router.push(`/quizzes/${quizId}`);
        return;
      }

      // Try to start the quiz
      try {
        const startResponse = await quizApi.startQuiz(quizId);
        setSubmission(startResponse.submission);
        
        if (startResponse.one_time && !warningAcknowledged) {
          setShowWarning(true);
        }

        // Load existing answers
        if (startResponse.submission.answers) {
          const existingAnswers: Record<number, any> = {};
          startResponse.submission.answers.forEach((answer: any) => {
            existingAnswers[answer.question_id] = {
              selected_option_id: answer.selected_option_id,
              answer_text: answer.answer_text,
            };
          });
          setAnswers(existingAnswers);
        }
      } catch (error: any) {
        if (error.status === 400) {
          alert(error.message || 'You have already participated in this quiz.');
          router.push(`/quizzes/${quizId}`);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Failed to load quiz:', error);
      alert(error.message || 'Failed to load quiz');
      router.push('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId: number, value: { selected_option_id?: number; answer_text?: string }) => {
    if (!submission) return;

    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Auto-save
    try {
      await submissionApi.saveAnswer(submission.id, {
        question_id: questionId,
        ...value,
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleAutoSubmit = async () => {
    if (submitting || !submission) return;
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!submission || submitting) return;

    if (!confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await submissionApi.submit(submission.id);
      router.push(`/quizzes/${quizId}/results?submission=${submission.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !quiz || !submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading quiz...</div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Timer and Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">{quiz.title}</h2>
              <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            {timeRemaining !== null && (
              <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question_text}
            </CardTitle>
            <CardDescription>
              {currentQuestion.question_type === 'mcq' ? 'Multiple Choice' : 'Descriptive Answer'} • {currentQuestion.points} points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.question_type === 'mcq' ? (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={answers[currentQuestion.id]?.selected_option_id === option.id}
                      onChange={() => handleAnswerChange(currentQuestion.id, { selected_option_id: option.id })}
                      className="w-4 h-4"
                    />
                    <span className="flex-1">{option.option_text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor={`answer-${currentQuestion.id}`}>Your Answer</Label>
                <Textarea
                  id={`answer-${currentQuestion.id}`}
                  value={answers[currentQuestion.id]?.answer_text || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, { answer_text: e.target.value })}
                  rows={6}
                  placeholder="Type your answer here..."
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>

      {/* Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Important Warning</DialogTitle>
            <DialogDescription>
              This is a one-time quiz. Make sure you have a stable internet connection before starting.
              You will not be able to retake this quiz once submitted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/quizzes/${quizId}`);
              }}
            >
              Go Back
            </Button>
            <Button
              onClick={() => {
                setShowWarning(false);
                setWarningAcknowledged(true);
              }}
            >
              I Understand, Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProtectedQuizTakingPage() {
  return (
    <ProtectedRoute>
      <QuizTakingPage />
    </ProtectedRoute>
  );
}

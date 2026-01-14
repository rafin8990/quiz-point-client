"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { quizApi } from '@/lib/api';
import type { Quiz } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkQuizAvailability } from '@/lib/quizUtils';

export default function QuizDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.id as string);
  const { isAuthenticated } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasParticipated, setHasParticipated] = useState(false);

  useEffect(() => {
    if (isAuthenticated === undefined) {
      // Still checking authentication status
      return;
    }
    
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/quizzes/${quizId}`);
      return;
    }
    
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, isAuthenticated]);

  const loadQuiz = async () => {
    if (!quizId || isNaN(quizId)) {
      router.push('/quizzes');
      return;
    }
    
    try {
      setLoading(true);
      const response = await quizApi.getQuiz(quizId);
      setQuiz(response.quiz);
      setHasParticipated(response.has_participated || false);
    } catch (error: any) {
      console.error('Failed to load quiz:', error);
      if (error.status === 401 || error.status === 403) {
        router.push(`/login?returnUrl=/quizzes/${quizId}`);
        return;
      }
      alert(error.message || 'Failed to load quiz');
      router.push('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/quizzes/${quizId}/start`);
      return;
    }
    router.push(`/quizzes/${quizId}/start`);
  };

  const handleViewResults = () => {
    router.push(`/quizzes/${quizId}/results`);
  };

  const handleViewLeaderboard = () => {
    router.push(`/quizzes/${quizId}/leaderboard`);
  };

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.status === 'draft') {
      return <Badge variant="secondary">Draft</Badge>;
    } else if (quiz.status === 'closed') {
      return <Badge variant="destructive">Closed</Badge>;
    } else if (quiz.availability === 'active') {
      return <Badge className="bg-green-500">Active</Badge>;
    } else if (quiz.availability === 'upcoming') {
      return <Badge className="bg-blue-500">Upcoming</Badge>;
    } else {
      return <Badge variant="outline">Published</Badge>;
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
          <Button onClick={() => router.push('/quizzes')}>Back to Quizzes</Button>
        </div>
      </div>
    );
  }

  // Check quiz time availability
  const timeStatus = quiz ? checkQuizAvailability(quiz.start_time, quiz.end_time) : null;
  const canStart = isAuthenticated && !hasParticipated && timeStatus?.isAvailable === true;
  const showResults = isAuthenticated && hasParticipated;
  const isUpcoming = timeStatus?.isUpcoming === true;
  const isExpired = timeStatus?.isExpired === true;
  const isClosed = quiz.status === 'closed' || isExpired;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-3xl">{quiz.title}</CardTitle>
            {getStatusBadge(quiz)}
          </div>
          <CardDescription className="text-base">
            {quiz.description || 'No description available'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {quiz.questions && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Number of Questions</p>
                <p className="font-medium">{quiz.questions.length} questions</p>
              </div>
            )}
            {quiz.creator && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Created By</p>
                <p className="font-medium">{quiz.creator.name}</p>
              </div>
            )}
          </div>

          {showResults && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">
                You have already participated in this quiz.
              </p>
            </div>
          )}

          {isUpcoming && timeStatus && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium">
                {timeStatus.message}
              </p>
            </div>
          )}

          {isExpired && !showResults && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-800 font-medium">
                {timeStatus?.message || 'This quiz has ended. You can no longer participate. Results are now available.'}
              </p>
            </div>
          )}

          {!timeStatus?.isAvailable && !isUpcoming && !isExpired && !showResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-800 font-medium">
                This quiz is not currently available.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-4">
          {!isAuthenticated ? (
            <Button
              className="w-full"
              onClick={() => router.push(`/login?returnUrl=/quizzes/${quizId}`)}
            >
              Login to Participate
            </Button>
          ) : showResults ? (
            <>
              <Button onClick={handleViewResults} className="flex-1">
                View Results
              </Button>
              <Button variant="outline" onClick={handleViewLeaderboard} className="flex-1">
                View Leaderboard
              </Button>
            </>
          ) : canStart ? (
            <Button onClick={handleStartQuiz} className="w-full">
              Start Quiz
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              {isUpcoming ? 'Quiz Not Yet Available' : isExpired ? 'Quiz Ended - View Results' : 'Quiz Not Available'}
            </Button>
          )}
          {isExpired && !showResults && (
            <Button variant="outline" onClick={handleViewLeaderboard} className="w-full">
              View Leaderboard
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/quizzes')}>
            Back to Quizzes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

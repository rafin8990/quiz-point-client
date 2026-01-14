"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { quizApi } from '@/lib/api';
import type { Quiz } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkQuizAvailability } from '@/lib/quizUtils';

export default function QuizzesPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, [isAuthenticated]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const data = await quizApi.getQuizzes();
        setQuizzes(data);
      } else {
        const data = await quizApi.getPublicQuizzes();
        setQuizzes(data);
      }
    } catch (error: any) {
      console.error('Failed to load quizzes:', error);
      // Show user-friendly error message
      if (error.status === 0 || error.message?.includes('Network error')) {
        console.error('API Server Connection Error:', error.message);
        // Don't show alert for network errors, just log and show empty state
      } else {
        console.error('API Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quiz: Quiz) => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/quizzes/${quiz.id}`);
      return;
    }

    // Check time availability
    const timeStatus = checkQuizAvailability(quiz.start_time, quiz.end_time);

    if (quiz.has_participated) {
      router.push(`/quizzes/${quiz.id}/results`);
    } else if (timeStatus.isAvailable) {
      router.push(`/quizzes/${quiz.id}/start`);
    } else {
      // Show quiz details (upcoming or expired)
      router.push(`/quizzes/${quiz.id}`);
    }
  };

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.status === 'draft') {
      return <Badge variant="secondary">Draft</Badge>;
    } else if (quiz.status === 'closed') {
      return <Badge variant="destructive">Closed</Badge>;
    }
    
    // Check time-based availability
    const timeStatus = checkQuizAvailability(quiz.start_time, quiz.end_time);
    
    if (timeStatus.isAvailable) {
      return <Badge className="bg-green-500">Active</Badge>;
    } else if (timeStatus.isUpcoming) {
      return <Badge className="bg-blue-500">Upcoming</Badge>;
    } else if (timeStatus.isExpired) {
      return <Badge variant="destructive">Ended</Badge>;
    } else {
      return <Badge variant="outline">Published</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderQuizButton = (quiz: Quiz) => {
    if (!isAuthenticated) {
      return (
        <Button
          className="w-full"
          onClick={() => router.push(`/login?returnUrl=/quizzes/${quiz.id}`)}
        >
          Login to participate the quiz
        </Button>
      );
    }

    if (quiz.has_participated) {
      return (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/quizzes/${quiz.id}/results`)}
        >
          View Results
        </Button>
      );
    }

    const timeStatus = checkQuizAvailability(quiz.start_time, quiz.end_time);
    if (timeStatus.isAvailable) {
      return (
        <Button
          className="w-full"
          onClick={() => handleQuizClick(quiz)}
        >
          Start Quiz
        </Button>
      );
    } else if (timeStatus.isExpired) {
      return (
        <Button
          variant="outline"
          className="w-full"
          disabled
        >
          Ended - View Results
        </Button>
      );
    } else {
      return (
        <Button
          variant="outline"
          className="w-full"
          disabled
        >
          Not Available
        </Button>
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Available Quizzes</h1>
        <div className="text-center py-12">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Quizzes</h1>
        {isAuthenticated && user?.role !== 'user' && (
          <Button onClick={() => router.push('/admin/quizzes/create')}>
            Create Quiz
          </Button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No quizzes available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                  {getStatusBadge(quiz)}
                </div>
                <CardDescription className="line-clamp-2">
                  {quiz.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <strong>Start:</strong> {formatDate(quiz.start_time)}
                  </div>
                  <div>
                    <strong>End:</strong> {formatDate(quiz.end_time)}
                  </div>
                  {quiz.time_limit_minutes && (
                    <div>
                      <strong>Time Limit:</strong> {quiz.time_limit_minutes} minutes
                    </div>
                  )}
                  <div>
                    <strong>Total Points:</strong> {quiz.total_points}
                  </div>
                  {isAuthenticated && quiz.has_participated && (
                    <div className="mt-2">
                      <Badge variant="outline">Already Participated</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {renderQuizButton(quiz)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

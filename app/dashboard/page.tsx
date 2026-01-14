"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { quizApi, submissionApi } from "@/lib/api";
import type { Quiz, QuizSubmission } from "@/types";
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Clock, 
  Award,
  Play,
  Calendar,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    quizzesCompleted: 0,
    averageScore: 0,
    totalPoints: 0,
    inProgress: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load available quizzes
      const quizzesData = await quizApi.getQuizzes();
      setAvailableQuizzes(quizzesData.filter((q: Quiz) => q.availability === 'active' && !q.has_participated));
      setRecentQuizzes(quizzesData.slice(0, 4));
      
      // Calculate stats from user's submissions
      let completedCount = 0;
      let totalScore = 0;
      let totalMaxScore = 0;
      let inProgressCount = 0;
      const submissions: any[] = [];
      
      for (const quiz of quizzesData) {
        if (quiz.has_participated && quiz.participation_status) {
          try {
            // Try to get submission details
            const quizDetails = await quizApi.getQuiz(quiz.id);
            if (quizDetails.submission_id) {
              const submission = await submissionApi.getSubmission(quizDetails.submission_id);
              if (submission.submission.status === 'submitted') {
                completedCount++;
                totalScore += submission.submission.total_score;
                totalMaxScore += submission.submission.quiz.total_points;
                submissions.push({
                  quiz: submission.submission.quiz,
                  submission: submission.submission,
                });
              } else if (submission.submission.status === 'in_progress') {
                inProgressCount++;
              }
            }
          } catch (error) {
            // Skip if submission not found
            console.error('Failed to load submission:', error);
          }
        }
      }
      
      const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
      
      setStats({
        quizzesCompleted: completedCount,
        averageScore,
        totalPoints: totalScore,
        inProgress: inProgressCount,
      });
      
      // Sort submissions by submitted_at and get recent ones
      submissions.sort((a, b) => {
        const dateA = a.submission.submitted_at ? new Date(a.submission.submitted_at).getTime() : 0;
        const dateB = b.submission.submitted_at ? new Date(b.submission.submitted_at).getTime() : 0;
        return dateB - dateA;
      });
      setRecentSubmissions(submissions.slice(0, 5));
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.name}! Here's your progress overview.
            </p>
          </div>
          <Link href="/quizzes">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Play className="mr-2 h-4 w-4" />
              Browse Quizzes
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.quizzesCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.inProgress > 0 && `${stats.inProgress} in progress`}
                    {stats.inProgress === 0 && "All completed"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {stats.averageScore >= 80 && (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        Excellent performance!
                      </>
                    )}
                    {stats.averageScore < 80 && stats.averageScore >= 60 && (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
                        Good progress
                      </>
                    )}
                    {stats.averageScore < 60 && "Keep practicing!"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <p className="text-xs text-muted-foreground">Quizzes started</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPoints}</div>
                  <p className="text-xs text-muted-foreground">Points earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="recent" className="space-y-4">
              <TabsList>
                <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                <TabsTrigger value="available">Available Quizzes</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Quiz Attempts</CardTitle>
                        <CardDescription>Your latest quiz results and performance</CardDescription>
                      </div>
                      <Link href="/quizzes">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentSubmissions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No completed quizzes yet</p>
                        <Link href="/quizzes">
                          <Button>
                            <Play className="mr-2 h-4 w-4" />
                            Start Your First Quiz
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentSubmissions.map((item) => {
                          const quiz = item.quiz;
                          const submission = item.submission;
                          const score = quiz.total_points > 0 
                            ? Math.round((submission.total_score / quiz.total_points) * 100) 
                            : 0;
                          
                          return (
                            <div
                              key={submission.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                                  score >= 90 ? "bg-gradient-to-br from-green-500 to-emerald-600" :
                                  score >= 70 ? "bg-gradient-to-br from-blue-500 to-purple-600" :
                                  "bg-gradient-to-br from-orange-500 to-red-600"
                                }`}>
                                  {score}%
                                </div>
                                <div>
                                  <p className="font-semibold">{quiz.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary">
                                      {submission.total_score} / {quiz.total_points} points
                                    </Badge>
                                    <span className="text-sm text-muted-foreground flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {submission.submitted_at ? formatDate(submission.submitted_at) : 'Not submitted'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/quizzes/${quiz.id}/results?submission=${submission.id}`)}
                              >
                                View Details
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="available" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Available Quizzes</CardTitle>
                        <CardDescription>Explore and take new quizzes to improve your knowledge</CardDescription>
                      </div>
                      <Link href="/quizzes">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {availableQuizzes.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No available quizzes at the moment</p>
                        <Link href="/quizzes">
                          <Button>
                            <Play className="mr-2 h-4 w-4" />
                            Browse All Quizzes
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableQuizzes.map((quiz) => (
                          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                <Badge className={
                                  quiz.availability === 'active' ? 'bg-green-500' : ''
                                }>
                                  {quiz.availability}
                                </Badge>
                              </div>
                              <CardDescription>
                                {quiz.description || 'No description available'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                <span className="flex items-center">
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  {quiz.questions?.length || 0} questions
                                </span>
                                {quiz.time_limit_minutes && (
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {quiz.time_limit_minutes} min
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <Award className="h-4 w-4 mr-1" />
                                  {quiz.total_points} points
                                </span>
                              </div>
                              <Button 
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                onClick={() => router.push(`/quizzes/${quiz.id}/start`)}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Start Quiz
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProtectedDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}

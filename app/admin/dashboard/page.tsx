"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { quizApi, userApi } from "@/lib/api";
import type { Quiz } from "@/types";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  Settings
} from "lucide-react";
import Link from "next/link";
import { QuizManagement } from "@/app/admin/components/QuizManagement";
import { UserManagement } from "@/app/admin/components/UserManagement";

function AdminDashboardPage() {
  const router = useRouter();
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    publishedQuizzes: 0,
    draftQuizzes: 0,
    closedQuizzes: 0,
    totalUsers: 0,
    totalSubmissions: 0,
    averageScore: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load quizzes
      const quizzesResponse = await quizApi.admin.getQuizzes({ page: 1 });
      const allQuizzes = quizzesResponse.data;
      
      // Calculate stats
      const totalQuizzes = quizzesResponse.total;
      const publishedQuizzes = allQuizzes.filter((q: Quiz) => q.status === 'published').length;
      const draftQuizzes = allQuizzes.filter((q: Quiz) => q.status === 'draft').length;
      const closedQuizzes = allQuizzes.filter((q: Quiz) => q.status === 'closed').length;
      
      // Calculate total submissions
      let totalSubmissions = 0;
      let totalScore = 0;
      let submissionCount = 0;
      
      for (const quiz of allQuizzes) {
        if (quiz.submissions) {
          totalSubmissions += quiz.submissions.length;
          quiz.submissions.forEach((sub: any) => {
            if (sub.status === 'submitted' && sub.total_score !== null) {
              totalScore += sub.total_score;
              submissionCount++;
            }
          });
        }
      }
      
      const averageScore = submissionCount > 0 ? Math.round((totalScore / submissionCount / (allQuizzes[0]?.total_points || 100)) * 100) : 0;
      
      // Load users count
      let totalUsers = 0;
      try {
        const usersResponse = await userApi.getAll(1);
        totalUsers = usersResponse.total;
      } catch (error) {
        console.error('Failed to load users:', error);
      }
      
      setStats({
        totalQuizzes,
        publishedQuizzes,
        draftQuizzes,
        closedQuizzes,
        totalUsers,
        totalSubmissions,
        averageScore,
      });
      
      // Get recent quizzes (latest 5)
      setRecentQuizzes(allQuizzes.slice(0, 5));
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Manage quizzes, users, and portal settings</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/quizzes/create">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </Link>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.publishedQuizzes} published, {stats.draftQuizzes} draft
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                  <p className="text-xs text-muted-foreground">Quiz attempts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">Across all quizzes</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Quizzes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Quizzes</CardTitle>
                    <CardDescription>Latest quizzes you've created</CardDescription>
                  </div>
                  <Link href="/admin/quizzes">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentQuizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No quizzes yet</p>
                    <Link href="/admin/quizzes/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Quiz
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold">{quiz.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  quiz.status === 'published'
                                    ? 'default'
                                    : quiz.status === 'draft'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {quiz.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {quiz.submissions?.length || 0} participants
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/quizzes/${quiz.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/quizzes/${quiz.id}/submissions`)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Management Tabs */}
        <Tabs defaultValue="quizzes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="quizzes">Quiz Management</TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="users">User Management</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your quizzes</CardDescription>
                  </div>
                  <Link href="/admin/quizzes">
                    <Button variant="outline">View All Quizzes</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/admin/quizzes/create">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="pt-6 text-center">
                        <Plus className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                        <h3 className="font-semibold mb-2">Create New Quiz</h3>
                        <p className="text-sm text-muted-foreground">
                          Build a new quiz with questions and options
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/admin/quizzes">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="pt-6 text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                        <h3 className="font-semibold mb-2">Manage Quizzes</h3>
                        <p className="text-sm text-muted-foreground">
                          View, edit, and manage all your quizzes
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/quizzes">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="pt-6 text-center">
                        <Eye className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <h3 className="font-semibold mb-2">View Public Quizzes</h3>
                        <p className="text-sm text-muted-foreground">
                          See how quizzes appear to participants
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default function ProtectedAdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'super_admin']}>
      <AdminDashboardPage />
    </ProtectedRoute>
  );
}

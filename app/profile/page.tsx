"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, quizApi, submissionApi } from "@/lib/api";
import type { Quiz, QuizSubmission } from "@/types";
import { Calendar, Trophy, BookOpen, Edit2, Camera, AlertCircle, ArrowRight, Clock } from "lucide-react";

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [address, setAddress] = useState(user?.address || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Quiz statistics
  const [stats, setStats] = useState({
    quizzesCompleted: 0,
    averageScore: 0,
    totalPoints: 0,
    inProgress: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Sync form state when user changes (e.g. after refresh)
  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setMobile(user?.mobile || "");
    setAddress(user?.address || "");
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadQuizStats();
    }
  }, [user]);

  const loadQuizStats = async () => {
    try {
      setLoadingStats(true);
      
      // Load all quizzes
      const quizzesData = await quizApi.getQuizzes();
      
      // Calculate stats from user's submissions
      let completedCount = 0;
      let totalScore = 0;
      let totalMaxScore = 0;
      let inProgressCount = 0;
      const submissions: any[] = [];
      
      for (const quiz of quizzesData) {
        if (quiz.has_participated && quiz.participation_status) {
          try {
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
      console.error('Failed to load quiz stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await authApi.updateProfile({
        name,
        email: email || undefined,
        mobile: mobile || undefined,
        address: address || undefined,
        password: password || undefined,
      });
      updateUser(res.user);
      setSuccess("Profile updated successfully.");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
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

  const avatarInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-background flex items-center justify-center text-4xl font-bold text-white">
                  {avatarInitials}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{user?.name}</h1>
                    <p className="text-muted-foreground">
                      {user?.email || user?.mobile || "No contact info"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Role: {user?.role ?? "user"}
                    </p>
                  </div>
                  <Button variant="outline" className="hidden sm:flex">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards with Real Data */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.quizzesCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.quizzesCompleted === 0 
                      ? "Your quiz stats will appear here."
                      : `${stats.inProgress > 0 ? `${stats.inProgress} in progress` : "All completed"}`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.averageScore === 0 
                      ? "Start taking quizzes to see your score."
                      : stats.averageScore >= 80 
                        ? "Excellent performance!"
                        : stats.averageScore >= 60 
                          ? "Good progress"
                          : "Keep practicing!"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalPoints}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalPoints === 0 
                      ? "Points earned from quizzes"
                      : "Points earned"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 p-3 rounded-md text-sm">
                  {success}
                </div>
              )}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email || ""}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={mobile || ""}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address || ""}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password (optional)</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Your account is active and ready to use</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity with Real Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent quiz attempts and achievements</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="text-center py-8 text-muted-foreground">Loading activity...</div>
            ) : recentSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No quiz activity yet</p>
                <Button onClick={() => router.push('/quizzes')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Quizzes
                </Button>
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
      </div>
    </div>
  );
}

export default function ProtectedProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}

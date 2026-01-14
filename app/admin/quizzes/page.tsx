"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { quizApi } from '@/lib/api';
import type { Quiz } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye, Settings } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function AdminQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadQuizzes();
  }, [currentPage]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizApi.admin.getQuizzes({ page: currentPage });
      setQuizzes(response.data);
      setTotalPages(response.last_page);
    } catch (error: any) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: number) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await quizApi.admin.deleteQuiz(quizId);
      loadQuizzes();
    } catch (error: any) {
      alert(error.message || 'Failed to delete quiz');
    }
  };

  const handlePublish = async (quizId: number) => {
    try {
      await quizApi.admin.publishQuiz(quizId);
      loadQuizzes();
    } catch (error: any) {
      alert(error.message || 'Failed to publish quiz');
    }
  };

  const handlePublishResults = async (quizId: number) => {
    try {
      await quizApi.admin.publishResults(quizId);
      loadQuizzes();
    } catch (error: any) {
      alert(error.message || 'Failed to publish results');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quiz Management</CardTitle>
              <CardDescription>Create, edit, and manage quizzes</CardDescription>
            </div>
            <Button onClick={() => router.push('/admin/quizzes/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No quizzes found.</p>
              <Button onClick={() => router.push('/admin/quizzes/create')}>
                Create Your First Quiz
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Total Points</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>
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
                          <Badge variant="outline" className="ml-2">
                            Results Published
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(quiz.start_time)}</TableCell>
                      <TableCell>{formatDate(quiz.end_time)}</TableCell>
                      <TableCell>{quiz.total_points}</TableCell>
                      <TableCell>{quiz.submissions?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/quizzes/${quiz.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/quizzes/${quiz.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {quiz.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePublish(quiz.id)}
                            >
                              Publish
                            </Button>
                          )}
                          {quiz.status === 'published' && !quiz.results_published && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePublishResults(quiz.id)}
                            >
                              Publish Results
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/quizzes/${quiz.id}/submissions`)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(quiz.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
    </div>
  );
}

export default function ProtectedAdminQuizzesPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'super_admin']}>
      <AdminQuizzesPage />
    </ProtectedRoute>
  );
}

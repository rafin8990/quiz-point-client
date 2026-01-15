"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, MoreVertical } from "lucide-react";
import type { Quiz } from "@/types";

export function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of JavaScript basics",
      created_by: 1,
      time_limit_minutes: 30,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 30 * 60000).toISOString(),
      show_correct_answer: true,
      total_points: 100,
      status: "published",
      results_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "React Advanced Concepts",
      description: "Advanced React patterns and concepts",
      created_by: 1,
      time_limit_minutes: 45,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 45 * 60000).toISOString(),
      show_correct_answer: true,
      total_points: 100,
      status: "published",
      results_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "TypeScript Basics",
      description: "Introduction to TypeScript",
      created_by: 1,
      time_limit_minutes: 20,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 20 * 60000).toISOString(),
      show_correct_answer: true,
      total_points: 100,
      status: "published",
      results_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time_limit_minutes: 0,
    status: "draft" as "draft" | "published" | "closed",
    total_points: 0,
    show_correct_answer: true,
  });

  const handleCreate = () => {
    const newQuiz: Quiz = {
      id: Date.now(),
      title: formData.title,
      description: formData.description || null,
      created_by: 1,
      time_limit_minutes: formData.time_limit_minutes,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + formData.time_limit_minutes * 60000).toISOString(),
      show_correct_answer: formData.show_correct_answer,
      total_points: formData.total_points,
      status: formData.status,
      results_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setQuizzes([...quizzes, newQuiz]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || "",
      time_limit_minutes: quiz.time_limit_minutes || 0,
      status: quiz.status,
      total_points: quiz.total_points,
      show_correct_answer: quiz.show_correct_answer,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingQuiz) return;
    setQuizzes(
      quizzes.map((q) =>
        q.id === editingQuiz.id
          ? {
              ...editingQuiz,
              title: formData.title,
              description: formData.description || null,
              time_limit_minutes: formData.time_limit_minutes,
              status: formData.status,
              total_points: formData.total_points,
              show_correct_answer: formData.show_correct_answer,
              updated_at: new Date().toISOString(),
            }
          : q
      )
    );
    setIsEditDialogOpen(false);
    setEditingQuiz(null);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes(quizzes.filter((q) => q.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      time_limit_minutes: 0,
      status: "draft",
      total_points: 0,
      show_correct_answer: true,
    });
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (quiz.description && quiz.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quiz Management</CardTitle>
            <CardDescription>Create, edit, and manage quizzes</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new quiz
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter quiz title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter quiz description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "draft" | "published" | "closed") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time_limit_minutes">Time Limit (minutes)</Label>
                    <Input
                      id="time_limit_minutes"
                      type="number"
                      value={formData.time_limit_minutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          time_limit_minutes: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_points">Total Points</Label>
                    <Input
                      id="total_points"
                      type="number"
                      value={formData.total_points}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_points: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="show_correct_answer">Show Correct Answer</Label>
                    <Select
                      value={formData.show_correct_answer ? "true" : "false"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          show_correct_answer: value === "true",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleCreate}
                >
                  Create Quiz
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead>Total Points</TableHead>
              <TableHead>Show Answers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No quizzes found
                </TableCell>
              </TableRow>
            ) : (
              filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        quiz.status === "published"
                          ? "default"
                          : quiz.status === "draft"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {quiz.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{quiz.time_limit_minutes || "N/A"} min</TableCell>
                  <TableCell>{quiz.total_points}</TableCell>
                  <TableCell>{quiz.show_correct_answer ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(quiz)}
                      >
                        <Edit className="h-4 w-4" />
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
              ))
            )}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Quiz</DialogTitle>
              <DialogDescription>
                Update the quiz details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Quiz Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "draft" | "published" | "closed") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time_limit_minutes">Time Limit (minutes)</Label>
                  <Input
                    id="edit-time_limit_minutes"
                    type="number"
                    value={formData.time_limit_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_limit_minutes: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-total_points">Total Points</Label>
                  <Input
                    id="edit-total_points"
                    type="number"
                    value={formData.total_points}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_points: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-show_correct_answer">Show Correct Answer</Label>
                  <Select
                    value={formData.show_correct_answer ? "true" : "false"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        show_correct_answer: value === "true",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingQuiz(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleUpdate}
              >
                Update Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

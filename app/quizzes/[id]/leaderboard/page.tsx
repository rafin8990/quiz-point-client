"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizApi } from '@/lib/api';
import type { Quiz, LeaderboardEntry, LeaderboardStats } from '@/types';
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
import { Trophy, Medal, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function LeaderboardPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = parseInt(params.id as string);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [quizId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const quizResponse = await quizApi.getQuiz(quizId);
      setQuiz(quizResponse.quiz);

      if (!quizResponse.quiz.results_published) {
        alert('Results are not yet published for this quiz.');
        router.push(`/quizzes/${quizId}`);
        return;
      }

      const leaderboardResponse = await quizApi.getLeaderboard(quizId);
      setLeaderboard(leaderboardResponse.leaderboard);
      setStats(leaderboardResponse.stats);
    } catch (error: any) {
      console.error('Failed to load leaderboard:', error);
      alert(error.message || 'Failed to load leaderboard');
      router.push(`/quizzes/${quizId}`);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-500" />;
    return <span className="w-6 text-center font-bold">{rank}</span>;
  };

  if (loading || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading leaderboard...</div>
      </div>
    );
  }

  if (!quiz.results_published) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Results are not yet published for this quiz.</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push(`/quizzes/${quizId}`)}>
                Back to Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{quiz.title} - Leaderboard</h1>
        <p className="text-gray-500">See how you rank against other participants</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_participants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_score.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Top Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.top_score}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quiz.total_points}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end gap-4 h-48">
              {topThree[1] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gray-300 rounded-t-lg p-4 text-center" style={{ height: '60%' }}>
                    <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-bold">{topThree[1].user.name}</p>
                    <p className="text-2xl font-bold">{topThree[1].total_score}</p>
                    <p className="text-sm text-gray-500">2nd Place</p>
                  </div>
                </div>
              )}
              {topThree[0] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-full bg-yellow-200 rounded-t-lg p-4 text-center" style={{ height: '100%' }}>
                    <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                    <p className="font-bold">{topThree[0].user.name}</p>
                    <p className="text-3xl font-bold">{topThree[0].total_score}</p>
                    <p className="text-sm text-gray-500">1st Place</p>
                  </div>
                </div>
              )}
              {topThree[2] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-full bg-orange-200 rounded-t-lg p-4 text-center" style={{ height: '40%' }}>
                    <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="font-bold">{topThree[2].user.name}</p>
                    <p className="text-2xl font-bold">{topThree[2].total_score}</p>
                    <p className="text-sm text-gray-500">3rd Place</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      {mounted && stats && stats.score_distribution.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Score Distribution Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>Number of participants in each score range</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.score_distribution.map((count, index) => {
                    const rangeStart = Math.floor((index * quiz.total_points) / stats.score_distribution.length);
                    const rangeEnd = Math.floor(((index + 1) * quiz.total_points) / stats.score_distribution.length);
                    return {
                      range: `${rangeStart}-${rangeEnd}`,
                      participants: count,
                    };
                  })}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="range" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number | undefined) => [`${value ?? 0} participants`, 'Count']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="participants" 
                    fill="#3b82f6" 
                    radius={[8, 8, 0, 0]}
                    name="Participants"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 10 Scores Line Chart */}
          {leaderboard.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Scores</CardTitle>
                <CardDescription>Score progression of top performers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={leaderboard.slice(0, 10).map((entry) => ({
                      rank: entry.rank,
                      name: entry.user.name.length > 10 ? entry.user.name.substring(0, 10) + '...' : entry.user.name,
                      score: entry.total_score,
                      percentage: Math.round((entry.total_score / quiz.total_points) * 100),
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="rank" 
                      label={{ value: 'Rank', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number | undefined, name: string | undefined) => {
                        const val = value ?? 0;
                        const nameStr = name ?? '';
                        if (nameStr === 'score') return [`${val} / ${quiz.total_points}`, 'Score'];
                        if (nameStr === 'percentage') return [`${val}%`, 'Percentage'];
                        return [val, nameStr];
                      }}
                      labelFormatter={(label) => `Rank ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Percentage"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Score Range Pie Chart */}
          {leaderboard.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Score Range Distribution</CardTitle>
                <CardDescription>Percentage of participants in each score range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const ranges = [
                          { name: 'Excellent (90-100%)', min: 0.9, max: 1.0, color: '#10b981' },
                          { name: 'Good (75-89%)', min: 0.75, max: 0.9, color: '#3b82f6' },
                          { name: 'Average (50-74%)', min: 0.5, max: 0.75, color: '#f59e0b' },
                          { name: 'Below Average (<50%)', min: 0, max: 0.5, color: '#ef4444' },
                        ];
                        return ranges.map((range) => {
                          const count = leaderboard.filter((entry) => {
                            const percentage = entry.total_score / quiz.total_points;
                            return percentage >= range.min && percentage < range.max;
                          }).length;
                          return {
                            name: range.name,
                            value: count,
                            color: range.color,
                          };
                        });
                      })()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }) => value > 0 && percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(() => {
                        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
                        return colors.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ));
                      })()}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number | undefined) => [`${value ?? 0} participants`, 'Count']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Performance Comparison Chart */}
          {leaderboard.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
                <CardDescription>Top 15 participants score comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={leaderboard.slice(0, 15).map((entry) => ({
                      name: entry.user.name.length > 8 ? entry.user.name.substring(0, 8) + '...' : entry.user.name,
                      score: entry.total_score,
                      percentage: Math.round((entry.total_score / quiz.total_points) * 100),
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, quiz.total_points]} />
                    <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number | undefined, name: string | undefined) => {
                        const val = value ?? 0;
                        const nameStr = name ?? '';
                        if (nameStr === 'score') return [`${val} / ${quiz.total_points}`, 'Score'];
                        if (nameStr === 'percentage') return [`${val}%`, 'Percentage'];
                        return [val, nameStr];
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="score" 
                      fill="#3b82f6" 
                      radius={[0, 8, 8, 0]}
                      name="Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Full Leaderboard</CardTitle>
          <CardDescription>Complete ranking of all participants</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No participants yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead className="text-right">Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{entry.user.name}</TableCell>
                    <TableCell className="text-right font-bold">
                      {entry.total_score} / {quiz.total_points}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round((entry.total_score / quiz.total_points) * 100)}%
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {new Date(entry.submitted_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 mt-6">
        <Button onClick={() => router.push(`/quizzes/${quizId}`)}>
          Back to Quiz
        </Button>
        <Button variant="outline" onClick={() => router.push('/quizzes')}>
          All Quizzes
        </Button>
      </div>
    </div>
  );
}

export default LeaderboardPage;

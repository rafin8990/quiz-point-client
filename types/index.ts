// Common types for the application

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string | null;
  mobile: string | null;
  image: string | null;
  address: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  time_limit_minutes: number | null;
  start_time: string;
  end_time: string;
  show_correct_answer: boolean;
  total_points: number;
  status: 'draft' | 'published' | 'closed';
  results_published: boolean;
  created_at: string;
  updated_at: string;
  availability?: 'upcoming' | 'active' | 'closed';
  participation_status?: 'in_progress' | 'submitted' | 'closed' | null;
  has_participated?: boolean;
  creator?: User;
  questions?: QuizQuestion[];
  submissions?: QuizSubmission[];
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'mcq' | 'descriptive';
  points: number;
  order_index: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
  options?: QuizQuestionOption[];
}

export interface QuizQuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuizSubmission {
  id: number;
  quiz_id: number;
  user_id: number;
  attempt_no: number;
  status: 'in_progress' | 'submitted' | 'closed';
  started_at: string;
  submitted_at: string | null;
  total_score: number;
  created_at: string;
  updated_at: string;
  quiz?: Quiz;
  user?: User;
  answers?: QuizSubmissionAnswer[];
}

export interface QuizSubmissionAnswer {
  id: number;
  submission_id: number;
  question_id: number;
  selected_option_id: number | null;
  answer_text: string | null;
  is_correct: boolean | null;
  score_awarded: number;
  feedback: string | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
  question?: QuizQuestion;
  selectedOption?: QuizQuestionOption;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  user_id: number;
  total_score: number;
  submitted_at: string;
  user: {
    id: number;
    name: string;
    email: string | null;
  };
}

export interface LeaderboardStats {
  total_participants: number;
  average_score: number;
  top_score: number;
  score_distribution: number[];
}

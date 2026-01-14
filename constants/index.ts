// Application constants

export const APP_NAME = 'QuizPoint';
export const APP_DESCRIPTION = 'Test your knowledge with interactive quizzes';

export const QUIZ_CATEGORIES = [
  'All',
  'Technology',
  'Science',
  'History',
  'Geography',
  'Sports',
  'Entertainment',
  'General Knowledge',
] as const;

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;

export const FEATURES = [
  {
    title: 'Interactive Quizzes',
    description: 'Engage with thousands of questions across multiple categories',
    icon: '🎯',
  },
  {
    title: 'Real-time Scoring',
    description: 'Get instant feedback and track your progress',
    icon: '⚡',
  },
  {
    title: 'Learn & Improve',
    description: 'Review explanations and improve your knowledge',
    icon: '📚',
  },
  {
    title: 'Challenge Friends',
    description: 'Compete with others and climb the leaderboard',
    icon: '🏆',
  },
];

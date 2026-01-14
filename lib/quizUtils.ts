// Utility functions for quiz availability and time checking

export interface QuizTimeStatus {
  isAvailable: boolean;
  isUpcoming: boolean;
  isExpired: boolean;
  message: string;
}

/**
 * Check if a quiz is currently available based on start and end times
 */
export function checkQuizAvailability(
  startTime: string,
  endTime: string
): QuizTimeStatus {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) {
    return {
      isAvailable: false,
      isUpcoming: true,
      isExpired: false,
      message: 'Quiz is not yet available. It will start on ' + start.toLocaleString(),
    };
  }

  if (now > end) {
    return {
      isAvailable: false,
      isUpcoming: false,
      isExpired: true,
      message: 'Quiz has ended. Results are now available.',
    };
  }

  return {
    isAvailable: true,
    isUpcoming: false,
    isExpired: false,
    message: 'Quiz is currently available',
  };
}

/**
 * Get time remaining until quiz starts (in milliseconds)
 */
export function getTimeUntilStart(startTime: string): number {
  const now = new Date();
  const start = new Date(startTime);
  return Math.max(0, start.getTime() - now.getTime());
}

/**
 * Get time remaining until quiz ends (in milliseconds)
 */
export function getTimeUntilEnd(endTime: string): number {
  const now = new Date();
  const end = new Date(endTime);
  return Math.max(0, end.getTime() - now.getTime());
}

/**
 * Format time remaining in a human-readable format
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '0 seconds';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

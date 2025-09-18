/**
 * Utility functions for date formatting and deadline calculations
 */

/**
 * Formats a date to a readable string (e.g., "Nov 15, 2025")
 */
export function formatDeadlineDate(deadline: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(deadline);
}

/**
 * Calculates the time remaining until a deadline
 * @param deadline - The deadline date
 * @returns Formatted string showing time remaining or "Closed" if past
 */
export function getDeadlineCountdown(deadline: Date): string {
  const now = new Date();
  const timeDiff = deadline.getTime() - now.getTime();

  // If deadline has passed
  if (timeDiff <= 0) {
    return 'Closed';
  }

  // Calculate days and hours
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  // More than 1 day left
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} left`;
  }

  // Less than 1 day but more than 0 hours
  if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} left`;
  }

  // Less than 1 hour left
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} left`;
  }

  // Less than 1 minute left
  return 'Less than 1 minute left';
}

/**
 * Checks if a deadline has passed
 * @param deadline - The deadline date
 * @returns true if deadline has passed, false otherwise
 */
export function isDeadlinePassed(deadline: Date): boolean {
  return deadline.getTime() <= new Date().getTime();
}

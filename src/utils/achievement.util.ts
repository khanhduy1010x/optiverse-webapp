export function validateAchievement({ title, description }: { title: string; description?: string }) {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required.' };
  }
  if (title.length > 50) {
    return { valid: false, error: 'Title must be at most 100 characters.' };
  }
  if (description && description.length > 100) {
    return { valid: false, error: 'Description must be at most 500 characters.' };
  }
  return { valid: true };
} 
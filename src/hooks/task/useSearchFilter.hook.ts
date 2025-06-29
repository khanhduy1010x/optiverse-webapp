import { useEffect } from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';

export function useSearchFilter(
  tasks: Task[],
  searchQuery: string,
  setFilteredTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  sortTasksWithCompletedAtBottom: (tasksToSort: Task[]) => Task[]
) {
  // Update the useEffect for filtering and sorting tasks
  useEffect(() => {
    if (tasks.length === 0) return;

    let result = [...tasks];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting with completed tasks at the bottom
    result = sortTasksWithCompletedAtBottom(result);

    console.log(`Filtered tasks: ${result.length} of ${tasks.length}`);
    setFilteredTasks(result);
  }, [tasks, searchQuery]);

  // Update the search handling
  const handleSearchChange = (
    query: string,
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
    filterTags: string[]
  ) => {
    setSearchQuery(query);

    // If we have a tag filter active, we need to apply search on the already filtered tasks
    if (filterTags.length > 0) {
      setFilteredTasks(prev => {
        return prev.filter(
          task =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            (task.description &&
              task.description.toLowerCase().includes(query.toLowerCase()))
        );
      });
    }
  };

  return {
    handleSearchChange,
  };
}

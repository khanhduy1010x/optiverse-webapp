import { useEffect, useState } from 'react';
import { fetchAllUserTasks, createTask, Task, updateTask, deleteTask, getTaskTags } from '../../services/taskservice';
import { format } from 'date-fns';
import { Tag, fetchAllUserTags, createTag, createTaskTag, fetchTasksByTagId, deleteTag, deleteTaskTag, fetchTasksByMultipleTags } from '../../services/tagservices';

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskTags, setTaskTags] = useState<{ [taskId: string]: Tag[] }>({});
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6'); // Default blue color
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showTagManagement, setShowTagManagement] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [showDeleteTagConfirm, setShowDeleteTagConfirm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed' | 'overdue'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');

  // Helper function to sort tasks with completed tasks at the bottom
  const sortTasksWithCompletedAtBottom = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      // First, separate completed and non-completed tasks
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // Then sort by creation date (newest first) within each group
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  // CSS for animations
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0% { background-color: transparent; }
      50% { background-color: rgba(239, 68, 68, 0.2); }
      100% { background-color: transparent; }
    }
  `;

  // Effect để thêm style animation vào DOM
  useEffect(() => {
    // Tạo style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [animationStyles]);

  // Fetch all user tags
  const fetchUserTags = async () => {
    try {
      const tags = await fetchAllUserTags();
      setAllTags(tags);
    } catch (error) {
      console.error('Error fetching user tags:', error);
    }
  };

  // Fetch tasks from API
  const fetchTasks = () => {
    setLoading(true);
    fetchAllUserTasks()
      .then((fetchedTasks) => {
        // Sort tasks using our helper function
        const sortedTasks = sortTasksWithCompletedAtBottom(fetchedTasks);
        setTasks(sortedTasks);
        setFilteredTasks(sortedTasks);

        // Fetch tags for each task
        const tagPromises = sortedTasks.map(task => fetchTaskTags(task._id));
        Promise.all(tagPromises).then(() => {
          console.log("All task tags loaded");
        }).catch(err => {
          console.error("Error loading task tags:", err);
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Fetch tags for a specific task
  const fetchTaskTags = async (taskId: string) => {
    try {
      const tags = await getTaskTags(taskId);
      console.log(`Tags for task ${taskId}:`, tags);
      
      // Ensure tags is an array before updating state
      const tagsArray = Array.isArray(tags) ? tags : [];
      
      setTaskTags(prev => ({
        ...prev,
        [taskId]: tagsArray
      }));
      
      return tagsArray;
    } catch (error) {
      console.error(`Error fetching tags for task ${taskId}:`, error);
      return [];
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUserTags();
  }, []);

  // Update the useEffect for filtering and sorting tasks
  useEffect(() => {
    if (tasks.length === 0) return;

    let result = [...tasks];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply tag filtering only if we're not already using API-based filtering
    if (filterTags.length > 0 && filterTags.length === 0) {
      // This condition will never be true - keeping for reference
      // Client-side tag filtering logic would go here
    }

    // Apply sorting with completed tasks at the bottom
    result = sortTasksWithCompletedAtBottom(result);

    console.log(`Filtered tasks: ${result.length} of ${tasks.length}`);
    setFilteredTasks(result);
  }, [tasks, searchQuery, sortOrder]);

  // Reset form when popup is closed
  useEffect(() => {
    if (!showPopup) {
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('low');
      setSelectedTags([]);
      setShowNewTagForm(false);
      setNewTagName('');
      setNewTagColor('#3B82F6');
    }
  }, [showPopup]);

  // Handle tag selection
  const handleTagSelect = (tag: Tag) => {
    console.log(`Selecting tag: ${tag.name} with ID: ${tag._id}`);

    // Check if tag is already selected by comparing IDs
    const isAlreadySelected = selectedTags.some(t => t._id === tag._id);

    if (isAlreadySelected) {
      // Remove tag if already selected
      console.log(`Removing tag: ${tag.name}`);
      setSelectedTags(prev => prev.filter(t => t._id !== tag._id));
    } else {
      // Add tag if not already selected
      console.log(`Adding tag: ${tag.name}`);
      // Create a new copy of the tag to avoid reference issues
      const tagToAdd = { ...tag };
      setSelectedTags(prev => [...prev, tagToAdd]);
    }
  };

  // Handle new tag creation
  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;

    try {
      console.log("Creating new tag:", newTagName, newTagColor);

      // Disable form while tag is being created
      const createTagButton = document.getElementById("create-tag-button");
      if (createTagButton) {
        createTagButton.setAttribute("disabled", "true");
        createTagButton.textContent = "Adding...";
      }

      const newTag = await createTag({
        name: newTagName,
        color: newTagColor
      });

      console.log("New tag created:", newTag);

      // Proceed even with a temporary ID - the server sync can happen later
      // Add the new tag to allTags and selectedTags
      setAllTags(prevAllTags => {
        // Check if we already have this tag (by name)
        if (prevAllTags.some(tag => tag.name === newTag.name)) {
          console.log("Tag with this name already exists, not adding duplicate");
          return prevAllTags;
        }
        return [...prevAllTags, newTag];
      });

      setSelectedTags(prevSelectedTags => {
        // Check if we already have this tag selected (by name or id)
        if (prevSelectedTags.some(tag =>
          tag.name === newTag.name || tag._id === newTag._id
        )) {
          console.log("Tag already selected, not adding duplicate");
          return prevSelectedTags;
        }
        return [...prevSelectedTags, newTag];
      });

      // Reset form
      setNewTagName('');
      setNewTagColor('#3B82F6');

      // Wait a moment before hiding the form to give visual feedback
      setTimeout(() => {
        setShowNewTagForm(false);
      }, 300);
    } catch (error) {
      console.error('Error creating new tag:', error);
      alert("There was a problem creating the tag. Please try again.");
    } finally {
      // Re-enable form
      const createTagButton = document.getElementById("create-tag-button");
      if (createTagButton) {
        createTagButton.removeAttribute("disabled");
        createTagButton.textContent = "Add";
      }
    }
  };

  const handleTaskUpdate = async (taskId: string, updatedFields: Partial<Task>) => {
    try {
      // Create a temporary optimistic update for better UI responsiveness
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task._id === taskId ? { ...task, ...updatedFields } : task
        );
        
        // If the task is being marked as completed, sort the tasks to move completed tasks to the bottom
        if (updatedFields.status === 'completed' || updatedFields.status === 'pending') {
          return sortTasksWithCompletedAtBottom(updatedTasks);
        }
        
        return updatedTasks;
      });

      // Apply the same sorting to filtered tasks
      setFilteredTasks(prevFilteredTasks => {
        const updatedFilteredTasks = prevFilteredTasks.map(task =>
          task._id === taskId ? { ...task, ...updatedFields } : task
        );
        
        // If the task is being marked as completed, sort the tasks to move completed tasks to the bottom
        if (updatedFields.status === 'completed' || updatedFields.status === 'pending') {
          return sortTasksWithCompletedAtBottom(updatedFilteredTasks);
        }
        
        return updatedFilteredTasks;
      });

      // Send the update to the server
      const response = await updateTask(taskId, updatedFields);

      // If the update was successful, refresh the tasks
      if (response && response.data) {
        console.log("Task updated successfully:", response.data);
      } else {
        // If there was an issue with the response, revert back and fetch tasks
        fetchTasks();
      }

      // Update selected task if it's currently being viewed
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({ ...selectedTask, ...updatedFields });
      }
    } catch (error) {
      console.error('Update task failed:', error);
      // Revert the optimistic update by refetching tasks
      fetchTasks();
    }
  };

  const confirmDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete);

      // Update the tasks list immediately without refetching
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskToDelete));

      // Close task detail if the deleted task was being viewed
      if (selectedTask && selectedTask._id === taskToDelete) {
        setShowTaskDetail(false);
        setSelectedTask(null);
      }

      // Close the confirmation dialog
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Delete task failed:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);

    // Make sure we have the latest tags
    fetchTaskTags(task._id);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);

    // Set selected tags if available
    if (taskTags[task._id]) {
      setSelectedTags(taskTags[task._id]);
    } else {
      // Fetch tags if not already loaded
      fetchTaskTags(task._id).then(() => {
        if (taskTags[task._id]) {
          setSelectedTags(taskTags[task._id]);
        }
      });
    }

    setShowTaskDetail(false);
    setShowPopup(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) return alert('Please enter a title');

    try {
      if (selectedTask) {
        // Update existing task
        console.log('Updating existing task:', selectedTask._id);
        await updateTask(selectedTask._id, {
          title,
          description,
          status,
          priority
        });

        // Handle tag updates
        if (taskTags[selectedTask._id]) {
          const currentTags = taskTags[selectedTask._id];

          // Find tags to remove (in current but not in selected)
          const tagsToRemove = currentTags.filter(
            currentTag => !selectedTags.some(selectedTag => selectedTag._id === currentTag._id)
          );

          // Find tags to add (in selected but not in current)
          const tagsToAdd = selectedTags.filter(
            selectedTag => !currentTags.some(currentTag => currentTag._id === selectedTag._id)
          );
          console.log("Tags to add:", tagsToAdd.map(t => t.name));

          // Add new tags
          if (tagsToAdd.length > 0) {
            console.log(`Adding ${tagsToAdd.length} tags to task ${selectedTask._id}`);
            const addTagPromises = tagsToAdd.map(tag =>
              createTaskTag(selectedTask._id, tag._id)
            );

            await Promise.all(addTagPromises);
          }
        } else {
          // If no existing tags, just add all selected tags
          if (selectedTags.length > 0) {
            console.log(`Adding ${selectedTags.length} tags to task ${selectedTask._id}`);
            const tagPromises = selectedTags.map(tag =>
              createTaskTag(selectedTask._id, tag._id)
            );

            await Promise.all(tagPromises);
          }
        }
      } else {
        // Create new task
        console.log('Creating new task:', { title, description, status, priority });
        const createdTask = await createTask({ title, description, status, priority });
        console.log('Created Task:', createdTask);

        // Add tags to the newly created task
        if (selectedTags.length > 0 && createdTask && createdTask._id) {
          console.log(`Adding ${selectedTags.length} tags to new task ${createdTask._id}`);
          const taskTagPromises = selectedTags.map(tag => {
            console.log(`Creating task-tag for task=${createdTask._id}, tag=${tag._id}`);
            return createTaskTag(createdTask._id, tag._id);
          });
          await Promise.all(taskTagPromises);
        }
      }

      // Reset form and close popup
      setShowPopup(false);
      setSelectedTask(null);

      // Refresh task list
      fetchTasks();
    } catch (error) {
      console.error(selectedTask ? 'Update task failed:' : 'Create task failed:', error);
      alert('There was an error creating/updating the task. Please try again.');
    }
  };

  // Update the handleFilterByTags function to support multiple tag filtering
  const handleFilterByTags = async (tags: Tag[]) => {
    console.log(`Filtering by ${tags.length} tags:`, tags.map(tag => tag.name));
    setFilterTags(tags);

    if (tags.length === 0) {
      // When no tags are selected, show all tasks with applied search and sorting
      let result = [...tasks];

      if (searchQuery) {
        result = result.filter(task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Apply sorting
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });

      setFilteredTasks(result);
      return;
    }

    setLoading(true);
    try {
      // Get tag IDs from the selected tags
      const tagIds = tags.map(tag => tag._id);

      // Use the service function to fetch tasks by multiple tags
      const tasksWithAllTags = await fetchTasksByMultipleTags(tagIds);
      console.log(`Found ${tasksWithAllTags.length} tasks with all selected tags`);

      if (tasksWithAllTags && tasksWithAllTags.length > 0) {
        // Format tasks if needed
        const formattedTasks = tasksWithAllTags.map(task => ({
          ...task,
          // Ensure consistent naming for dates
          createdAt: task.createdAt || task.created_at,
          updatedAt: task.updatedAt || task.updated_at
        }));

        // Apply additional filters (search)
        let finalResult = formattedTasks;
        if (searchQuery) {
          finalResult = finalResult.filter(task =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        // Apply sorting
        finalResult.sort((a, b) => {
          const dateA = new Date(a.createdAt || '').getTime();
          const dateB = new Date(b.createdAt || '').getTime();
          return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        // Update filtered tasks
        setFilteredTasks(finalResult);

        // Fetch tags for each task to ensure we have them for display
        const tagPromises = formattedTasks.map(task => fetchTaskTags(task._id));
        await Promise.all(tagPromises);
      } else {
        console.log('No tasks found with all selected tags');
        setFilteredTasks([]);
      }
    } catch (error) {
      console.error('Error filtering by tags:', error);

      // Fallback to client-side filtering if API fails
      const tasksWithTags = [...tasks]; // Start with all tasks

      // Filter tasks that have ALL the selected tags
      const filteredResult = tasksWithTags.filter(task => {
        // Get the tags for this task
        const taskTagsList = taskTags[task._id] || [];

        // Check if the task has ALL the selected tags
        return tags.every(filterTag =>
          taskTagsList.some(taskTag => taskTag._id === filterTag._id)
        );
      });

      console.log(`Client-side filtering found ${filteredResult.length} tasks with all selected tags`);

      // Apply additional filters (search)
      let finalResult = filteredResult;
      if (searchQuery) {
        finalResult = finalResult.filter(task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Apply sorting
      finalResult.sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });

      setFilteredTasks(finalResult);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort change
  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setShowSortMenu(false);

    // Apply sorting immediately to filtered tasks
    setFilteredTasks(prev => sortTasksWithCompletedAtBottom([...prev]));
  };

  // Update the search handling
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    // If we have a tag filter active, we need to apply search on the already filtered tasks
    if (filterTags.length > 0) {
      setFilteredTasks(prev => {
        return prev.filter(task =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
        );
      });
    }
  };

  // Handle tag deletion confirmation
  const confirmDeleteTag = (tag: Tag) => {
    setTagToDelete(tag);
    setShowDeleteTagConfirm(true);
  };

  // Handle tag deletion
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    try {
      // First update the UI optimistically
      setAllTags(prevTags => prevTags.filter(tag => tag._id !== tagToDelete._id));

      // If this was the filtered tag, reset the filter
      if (filterTags.some(t => t._id === tagToDelete._id)) {
        setFilterTags([]);
        setFilteredTasks([...tasks]);
      }

      // Update any tasks that had this tag
      const updatedTaskTags = { ...taskTags };
      Object.keys(updatedTaskTags).forEach(taskId => {
        updatedTaskTags[taskId] = updatedTaskTags[taskId].filter(
          tag => tag._id !== tagToDelete._id
        );
      });
      setTaskTags(updatedTaskTags);

      // Delete the tag from the server
      await deleteTag(tagToDelete._id);

      // Close the confirmation dialog
      setShowDeleteTagConfirm(false);
      setTagToDelete(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
      // Revert the UI updates on error
      fetchUserTags();
      fetchTasks();
    }
  };

  // Effect để đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Kiểm tra xem click có phải là bên ngoài menu filter hay không
      const filterMenuElement = document.getElementById('filter-menu');
      const filterButtonElement = document.getElementById('filter-button');
      if (
        showFilterMenu &&
        filterMenuElement &&
        !filterMenuElement.contains(event.target as Node) &&
        filterButtonElement &&
        !filterButtonElement.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }

      // Kiểm tra xem click có phải là bên ngoài menu sort hay không
      const sortMenuElement = document.getElementById('sort-menu');
      const sortButtonElement = document.getElementById('sort-button');
      if (
        showSortMenu &&
        sortMenuElement &&
        !sortMenuElement.contains(event.target as Node) &&
        sortButtonElement &&
        !sortButtonElement.contains(event.target as Node)
      ) {
        setShowSortMenu(false);
      }
    };

    // Thêm event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu, showSortMenu]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">My Tasks</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTagManagement(true)}
                className="text-gray-500 hover:text-gray-700 p-2"
                title="Manage Tags"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="w-full md:w-auto flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-gray-50"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPopup(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md flex items-center shadow-sm transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add task
              </button>

              <div className="relative group">
                <button
                  id="filter-button"
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex items-center"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="mr-1">Filter</span>
                  {filterTags.length > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium rounded-full px-2 py-0.5">
                      {filterTags.length}
                    </span>
                  )}
                </button>

                {/* Filter Menu with explicit show/hide */}
                {showFilterMenu && (
                  <div
                    id="filter-menu"
                    className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg z-10 py-1 animate-fade-in"
                    style={{
                      animation: 'fadeIn 0.2s ease-in-out'
                    }}
                  >
                    <div
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${filterTags.length === 0 ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                      onClick={() => {
                        setFilterTags([]);
                        handleFilterByTags([]);
                      }}
                    >
                      All Tasks
                    </div>
                    <div className="border-t border-gray-100"></div>
                    {allTags.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">No tags available</div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        {allTags.map(tag => {
                          const isSelected = filterTags.some(t => t._id === tag._id);
                          return (
                            <div
                              key={tag._id}
                              className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-between ${isSelected ? 'bg-red-50' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Cập nhật danh sách tag được chọn
                                const updatedTags = isSelected
                                  ? filterTags.filter(t => t._id !== tag._id)
                                  : [...filterTags, tag];

                                // Thêm hiệu ứng nhấp nháy khi chọn tag
                                const element = e.currentTarget;
                                element.classList.add('bg-red-100');
                                setTimeout(() => {
                                  element.classList.remove('bg-red-100');
                                }, 200);

                                // Cập nhật state và filter tasks
                                setFilterTags(updatedTags);
                                handleFilterByTags(updatedTags);
                              }}
                            >
                              <div className="flex items-center">
                                <span
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: tag.color }}
                                ></span>
                                <span className={isSelected ? 'font-medium text-red-600' : 'text-gray-700'}>
                                  {tag.name}
                                </span>
                              </div>
                              {isSelected && (
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {filterTags.length > 0 && (
                      <div className="border-t border-gray-100 mt-1 pt-1 px-4 py-2">
                        <button
                          className="text-xs text-red-600 hover:text-red-800"
                          onClick={() => {
                            setFilterTags([]);
                            handleFilterByTags([]);
                          }}
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  id="sort-button"
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex items-center"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                >
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                </button>

                {/* Sort Menu with explicit show/hide */}
                {showSortMenu && (
                  <div
                    id="sort-menu"
                    className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 animate-fade-in"
                    style={{
                      animation: 'fadeIn 0.2s ease-in-out'
                    }}
                  >
                    <div
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${sortOrder === 'newest' ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                      onClick={() => {
                        handleSortChange('newest');
                        setShowSortMenu(false);
                      }}
                    >
                      Newest First
                    </div>
                    <div
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${sortOrder === 'oldest' ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                      onClick={() => {
                        handleSortChange('oldest');
                        setShowSortMenu(false);
                      }}
                    >
                      Oldest First
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Task Table */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filterTags.length > 0 ? 'No tasks match your search or filter.' : 'Get started by creating a new task.'}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowPopup(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add a task
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <li
                    key={task._id}
                    className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 mt-1 w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : task.status === 'overdue'
                            ? 'border-red-400 hover:border-red-500'
                            : 'border-gray-400 hover:border-green-500'
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskUpdate(
                            task._id,
                            { status: task.status === 'completed' ? 'pending' : 'completed' }
                          );
                        }}
                      >
                        {task.status === 'completed' && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {task.priority === 'high' ? 'P1' : task.priority === 'medium' ? 'P2' : 'P3'}
                            </span>
                          </div>
                        </div>

                        {task.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-2 flex items-center">
                          <div className="flex flex-wrap gap-1">
                            {taskTags[task._id] && taskTags[task._id].length > 0 ? (
                              taskTags[task._id].map((tag) => (
                                <span
                                  key={tag._id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: `${tag.color}15`,
                                    color: tag.color
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">No tags</span>
                            )}
                          </div>
                          <span className="ml-auto text-xs text-gray-500">
                            {task.createdAt ? format(new Date(task.createdAt), 'MMM dd') : ''}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0 invisible group-hover:visible flex">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task);
                          }}
                          className="text-gray-400 hover:text-gray-600 mr-2"
                          title="Edit task"
                          aria-label="Edit task"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteTask(task._id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete task"
                          aria-label="Delete task"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>

                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Task Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            {/* Task name */}
            <div className="px-6 pt-6 pb-3">
              <input
                className="w-full text-xl font-medium border-0 p-0 mb-2 focus:outline-none focus:ring-0 placeholder-gray-400"
                type="text"
                placeholder="Task name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="px-6 pb-4">
              <textarea
                className="w-full text-sm border-0 p-0 focus:outline-none focus:ring-0 placeholder-gray-400 resize-none"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="px-6 py-2 border-t border-gray-100">
              {/* Task attributes */}
              <div className="space-y-2">
                {/* Status */}
                <div className="flex items-center py-2">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <select
                    aria-label="Task status"
                    className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-700"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>

                </div>

                {/* Priority */}
                <div className="flex items-center py-2">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <select
                    aria-label="Task priority"
                    className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-700"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="high">P1: High Priority</option>
                    <option value="medium">P2: Medium Priority</option>
                    <option value="low">P3: Low Priority</option>
                  </select>

                </div>

                {/* Tags */}
                <div className="flex items-center py-2">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div className="flex-grow">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {selectedTags.length === 0 ? (
                        <span
                          className="text-sm text-gray-500 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowNewTagForm(!showNewTagForm);
                          }}
                        >
                          Add tags
                        </span>
                      ) : (
                        <>
                          {selectedTags.map((tag) => (
                            <span
                              key={tag._id}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${tag.color}15`,
                                color: tag.color
                              }}
                            >
                              {tag.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedTags(prev => prev.filter(t => t._id !== tag._id));
                                }}
                                className="ml-1 text-xs hover:text-red-500"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowNewTagForm(!showNewTagForm);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 py-0.5 px-1"
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tag selector */}
              {showNewTagForm && (
                <div className="mt-2 border border-gray-200 rounded-lg p-3 bg-gray-50" onClick={(e) => e.stopPropagation()}>
                  {/* Create new tag */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="New tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <input
                      type="color"
                      aria-label="Pick tag color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 border-0 p-0 cursor-pointer rounded"
                    />

                    <button
                      id="create-tag-button"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateNewTag();
                      }}
                      disabled={!newTagName.trim()}
                      className={`px-3 py-1 rounded text-sm ${newTagName.trim()
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      Add
                    </button>
                  </div>

                  {/* Existing tags */}
                  <div className="max-h-32 overflow-y-auto">
                    {allTags.length === 0 ? (
                      <p className="text-gray-500 text-sm">No tags available. Create your first tag!</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => {
                          const isSelected = selectedTags.some(t => t._id === tag._id);

                          return (
                            <button
                              key={tag._id}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTagSelect(tag);
                              }}
                              className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${isSelected ? 'ring-1 ring-red-500' : ''
                                }`}
                              style={{
                                backgroundColor: `${tag.color}15`,
                                color: tag.color
                              }}
                            >
                              {tag.name}
                              {isSelected && (
                                <span className="ml-1">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setShowPopup(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <div>
                <button
                  onClick={handleSaveTask}
                  className={`px-4 py-2 text-sm text-white rounded-full transition-colors ${title.trim() ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  disabled={!title.trim()}
                >
                  {selectedTask ? 'Save' : 'Add task'}
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              aria-label="Close popup"
              title="Close popup"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-5 w-[350px] max-w-[90vw]">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete task?</h3>
            <p className="text-sm text-center text-gray-500 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail View */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            {/* Task title */}
            <div className="px-6 pt-6 pb-3">
              <h2 className="text-xl font-medium text-gray-900">
                {selectedTask.title}
              </h2>
            </div>

            {/* Description */}
            {selectedTask.description && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedTask.description}
                </p>
              </div>
            )}

            <div className="px-6 py-2 border-t border-gray-100">
              <div className="space-y-2">
                <div className="flex items-center py-2">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-700">Status:</div>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedTask.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center py-2">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <div className="text-sm text-gray-700">Priority:</div>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${selectedTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {selectedTask.priority === 'high' ? 'P1' :
                      selectedTask.priority === 'medium' ? 'P2' : 'P3'}
                  </span>
                </div>

                <div className="flex items-center py-2">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-sm text-gray-700">Created:</div>
                  <span className="ml-auto text-sm text-gray-600">
                    {selectedTask.createdAt ? format(new Date(selectedTask.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                  </span>
                </div>

                <div className="flex items-center py-2">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div className="text-sm text-gray-700">Tags:</div>
                  <div className="ml-auto flex flex-wrap justify-end gap-1">
                    {taskTags[selectedTask._id] && taskTags[selectedTask._id].length > 0 ? (
                      taskTags[selectedTask._id].map((tag) => (
                        <span
                          key={tag._id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${tag.color}15`,
                            color: tag.color
                          }}
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setShowTaskDetail(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => handleEditTask(selectedTask)}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full"
              >
                Edit
              </button>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowTaskDetail(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              aria-label="Close task details"
              title="Close task details"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

          </div>
        </div>
      )}

      {/* Tag Management Modal */}
      {showTagManagement && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Manage Tags</h3>
              <button
                type="button"
                onClick={() => setShowTagManagement(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close tag management"
                title="Close tag management"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

            </div>

            <div className="px-4 py-4">
              {/* Create new tag */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Tag</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-10 h-10 border-0 p-0 cursor-pointer rounded"
                    aria-label="Choose tag color"
                    title="Choose tag color"
                  />

                  <button
                    type="button"
                    onClick={handleCreateNewTag}
                    disabled={!newTagName.trim()}
                    className={`px-3 py-2 rounded text-sm ${newTagName.trim()
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* List of existing tags */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Your Tags</h3>
                {allTags.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-gray-200 rounded-md bg-gray-50">
                    <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No tags available. Create your first tag!</p>
                  </div>
                ) : (
                  <ul className="mt-2 max-h-64 overflow-y-auto rounded-md divide-y divide-gray-100">
                    {allTags.map((tag) => (
                      <li key={tag._id} className="py-2 px-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <span
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          ></span>
                          <span className="text-sm font-medium">{tag.name}</span>
                        </div>
                        <button
                          onClick={() => confirmDeleteTag(tag)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                          title="Delete tag"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Tag Confirmation Modal */}
      {showDeleteTagConfirm && tagToDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-5 w-[350px] max-w-[90vw]">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete tag?</h3>
            <p className="text-sm text-center text-gray-500 mb-4">
              This will remove <span className="font-semibold" style={{ color: tagToDelete.color }}>{tagToDelete.name}</span> from all tasks.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteTagConfirm(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTag}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
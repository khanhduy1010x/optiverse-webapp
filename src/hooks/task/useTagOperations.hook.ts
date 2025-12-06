import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import tagService from '../../services/tag.service';
import taskService from '../../services/task.service';

export function useTagOperations(
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setFilteredTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  allTags: Tag[],
  setAllTags: React.Dispatch<React.SetStateAction<Tag[]>>,
  selectedTags: Tag[],
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>,
  filterTags: string[],
  setFilterTags: React.Dispatch<React.SetStateAction<string[]>>,
  taskTags: { [taskId: string]: Tag[] },
  setTaskTags: React.Dispatch<
    React.SetStateAction<{ [taskId: string]: Tag[] }>
  >,
  filterTasksByTags: (tags: Tag[]) => Promise<void>,
  sortTasksWithCompletedAtBottom: (tasksToSort: Task[]) => Task[]
) {
  // Fetch all user tags
  const fetchUserTags = async () => {
    try {
      const tags = await tagService.fetchAllUserTags();
      setAllTags(tags);
      return tags;
    } catch (error) {
      console.error('Error fetching user tags:', error);
      return [];
    }
  };

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
  const handleCreateNewTag = async (
    newTagName: string,
    newTagColor: string,
    resetForm: () => void
  ) => {
    if (!newTagName.trim()) {
      console.warn('Tag name is empty, cannot create tag');
      return null;
    }

    try {
      console.log('Creating new tag:', newTagName.trim(), newTagColor);

      // Disable form while tag is being created
      const createTagButton = document.getElementById('create-tag-button');
      if (createTagButton) {
        createTagButton.setAttribute('disabled', 'true');
        createTagButton.textContent = 'Adding...';
      }

      const newTag = await tagService.createTag({
        name: newTagName.trim(),
        color: newTagColor,
      });

      console.log('New tag created:', newTag);

      // Đảm bảo tag có đủ các trường cần thiết
      const completeTag: Tag = {
        // Lấy tất cả các trường từ API trả về
        ...newTag,
        // Đảm bảo các trường quan trọng luôn tồn tại
        _id: newTag._id || `temp-${Date.now()}`,
        name: newTag.name || newTagName,
        color: newTag.color || newTagColor,
      };

      // Cập nhật allTags
      setAllTags(prevAllTags => {
        // Check if we already have this tag (by name or ID)
        if (
          prevAllTags.some(
            tag => tag.name === completeTag.name || tag._id === completeTag._id
          )
        ) {
          console.log(
            'Tag with this name already exists, not adding duplicate'
          );
          return prevAllTags;
        }
        return [...prevAllTags, completeTag];
      });

      // Cập nhật selectedTags
      setSelectedTags(prevSelectedTags => {
        // Check if we already have this tag selected (by name or id)
        if (
          prevSelectedTags.some(
            tag => tag.name === completeTag.name || tag._id === completeTag._id
          )
        ) {
          console.log('Tag already selected, not adding duplicate');
          return prevSelectedTags;
        }
        return [...prevSelectedTags, completeTag];
      });

      // Reset form
      resetForm();

      return completeTag;
    } catch (error) {
      console.error('Error creating new tag:', error);
      return null;
    } finally {
      // Re-enable form
      const createTagButton = document.getElementById('create-tag-button');
      if (createTagButton) {
        createTagButton.removeAttribute('disabled');
        createTagButton.textContent = 'Add';
      }
    }
  };

  // Handle filter by tags
  const handleFilterByTags = async (tagIds: string[]) => {
    console.log(
      `Filtering by ${tagIds.length} tag IDs:`,
      tagIds
    );

    // Update filter tags state
    setFilterTags(tagIds);

    // Thực hiện filter trực tiếp từ data sẵn có
    if (tagIds.length === 0) {
      console.log('No tags selected, showing all tasks');
      setFilteredTasks(sortTasksWithCompletedAtBottom([...tasks]));
    } else {
      console.log('Filtering tasks locally by tag IDs:', tagIds);

      // Filter tasks that have ALL selected tags
      const filteredResult = tasks.filter(task => {
        const taskTagsList = taskTags[task._id] || [];
        // Kiểm tra task có chứa tất cả tags được chọn không
        return tagIds.every(tagId =>
          taskTagsList.some(taskTag => taskTag._id === tagId)
        );
      });

      console.log(
        `Found ${filteredResult.length} tasks matching selected tags`
      );
      setFilteredTasks(sortTasksWithCompletedAtBottom(filteredResult));
    }
  };

  // Handle sort change
  const handleSortChange = (
    order: 'newest' | 'oldest',
    setSortOrder: React.Dispatch<React.SetStateAction<'newest' | 'oldest'>>,
    setShowSortMenu: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setSortOrder(order);
    setShowSortMenu(false);

    // Apply sorting immediately to filtered tasks
    setFilteredTasks(prev => sortTasksWithCompletedAtBottom([...prev]));
  };

  // Handle tag deletion confirmation
  const confirmDeleteTag = (
    tag: Tag,
    setTagToDelete: React.Dispatch<React.SetStateAction<Tag | null>>,
    setShowDeleteTagConfirm: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setTagToDelete(tag);
    setShowDeleteTagConfirm(true);
  };

  // Handle tag deletion
  const handleDeleteTag = async (
    tagToDelete: Tag | null,
    setShowDeleteTagConfirm: React.Dispatch<React.SetStateAction<boolean>>,
    setTagToDelete: React.Dispatch<React.SetStateAction<Tag | null>>
  ) => {
    if (!tagToDelete) return false;

    try {
      // First update the UI optimistically
      setAllTags(prevTags =>
        prevTags.filter(tag => tag._id !== tagToDelete._id)
      );

      // If this was the filtered tag, reset the filter
      if (filterTags.some(t => t === tagToDelete._id)) {
        // Lọc bỏ tag khỏi danh sách filter
        const remainingTags = filterTags.filter(t => t !== tagToDelete._id);
        setFilterTags(remainingTags);

        // Nếu không còn tag nào để filter, hiển thị tất cả task
        if (remainingTags.length === 0) {
          setFilteredTasks(sortTasksWithCompletedAtBottom([...tasks]));
        } else {
          // Ngược lại, filter lại tasks với các tag còn lại
          const filteredResult = tasks.filter(task => {
            const taskTagsList = taskTags[task._id] || [];
            return remainingTags.every(filterTag =>
              taskTagsList.some(taskTag => taskTag._id === filterTag)
            );
          });
          setFilteredTasks(sortTasksWithCompletedAtBottom(filteredResult));
        }
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
      await tagService.deleteTag(tagToDelete._id);

      // Close the confirmation dialog
      setShowDeleteTagConfirm(false);
      setTagToDelete(null);

      // Show success message
      console.log(`Tag "${tagToDelete.name}" deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      // Show error message
      console.log(
        `Failed to delete tag "${tagToDelete.name}". Please try again.`
      );
      return false;
    }
  };

  // Handle tag updating
  const handleUpdateTag = async (
    tagId: string,
    payload: Partial<Pick<Tag, 'name' | 'color'>>,
  ) => {
    try {
      const updated = await tagService.updateTag(tagId, payload);

      // Update allTags state
      setAllTags(prev => prev.map(t => (t._id === tagId ? { ...t, ...updated } : t)));

      // Update selectedTags state
      setSelectedTags(prev => prev.map(t => (t._id === tagId ? { ...t, ...updated } : t)));

      // Update taskTags mapping for all tasks
      setTaskTags(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(taskIdKey => {
          next[taskIdKey] = (next[taskIdKey] || []).map(t => (t._id === tagId ? { ...t, ...updated } : t));
        });
        return next;
      });

      console.log('Tag updated successfully:', updated);
      return true;
    } catch (error) {
      console.error('Error updating tag:', error);
      return false;
    }
  };

  // Update tags for a task
  const updateTaskTags = async (
    taskId: string,
    newSelectedTags: Tag[],
    currentTags: Tag[]
  ) => {
    try {
      // Find tags to remove (in current but not in selected)
      const tagsToRemove = currentTags.filter(
        currentTag =>
          !newSelectedTags.some(
            selectedTag => selectedTag._id === currentTag._id
          )
      );

      // Find tags to add (in selected but not in current)
      const tagsToAdd = newSelectedTags.filter(
        selectedTag =>
          !currentTags.some(currentTag => currentTag._id === selectedTag._id)
      );

      console.log(
        'Tags to add:',
        tagsToAdd.map(t => t.name)
      );
      console.log(
        'Tags to remove:',
        tagsToRemove.map(t => t.name)
      );

      // Remove tags that are no longer selected
      if (tagsToRemove.length > 0) {
        console.log(`Removing ${tagsToRemove.length} tags from task ${taskId}`);
        const removeTagPromises = tagsToRemove
          .filter(tag => tag.taskTagId) // Make sure we have the taskTagId
          .map(tag => tagService.deleteTaskTag(tag.taskTagId!));

        await Promise.all(removeTagPromises);
      }

      // Add new tags
      if (tagsToAdd.length > 0) {
        console.log(`Adding ${tagsToAdd.length} tags to task ${taskId}`);
        const addTagPromises = tagsToAdd.map(tag =>
          tagService.createTaskTag(taskId, tag._id)
        );

        await Promise.all(addTagPromises);
      }

      // Update taskTags state
      setTaskTags(prev => ({
        ...prev,
        [taskId]: newSelectedTags,
      }));

      return true;
    } catch (error) {
      console.error('Error updating task tags:', error);
      return false;
    }
  };

  return {
    fetchUserTags,
    handleTagSelect,
    handleCreateNewTag,
    handleFilterByTags,
    handleSortChange,
    confirmDeleteTag,
    handleDeleteTag,
    handleUpdateTag,
    updateTaskTags,
  };
}

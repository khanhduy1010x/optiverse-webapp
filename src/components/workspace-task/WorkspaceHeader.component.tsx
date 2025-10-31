import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Workspace } from '../../types/workspace/response/workspace.response';

interface WorkspaceHeaderProps {
  workspace: Workspace;
  onAddTask?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  workspace,
  onAddTask,
  searchQuery = '',
  onSearchChange,
}) => {
  const { t } = useTranslation('workspace-task');

  return (
    <>
      <div className="space-y-4">
        {/* Header Row - Title and Search on same line */}
        <div className="flex items-start justify-between gap-6">
          {/* Left: Title and Description */}
          <div className="space-y-1 flex-1">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-gray-500 text-sm font-medium">{workspace.description}</p>
            )}
          </div>

          {/* Right: Search Bar - Apple Style */}
          <div className="relative w-64 flex-shrink-0">
            <svg
              className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm font-medium text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkspaceHeader;

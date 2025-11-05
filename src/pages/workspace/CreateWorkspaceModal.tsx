import React, { useEffect, useState } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { CreateWorkspaceModalProps } from '../../types/workspace/workspace.props';
import workspaceService from '../../services/workspace.service';

interface WorkspaceLimits {
  current: number;
  max: number;
  canCreateMore: boolean;
  membershipLevel: string;
  packageName?: string;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  name,
  description,
  hasPassword,
  password,
  searchQuery,
  friendResults,
  selectedFriends,
  onClose,
  onSubmit,
  onNameChange,
  onDescriptionChange,
  onToggleHasPassword,
  onPasswordChange,
  onSearchChange,
  onAddFriend,
  onRemoveFriend,
}) => {
  const { t } = useAppTranslate('workspace');
  const [limits, setLimits] = useState<WorkspaceLimits | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch workspace limits when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);

      workspaceService.getWorkspaceLimits()
        .then((limitsData) => {
          setLimits(limitsData);
        })
        .catch((err) => {
          console.error('Failed to fetch workspace limits:', err);
          setError('Failed to check workspace limits');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] ">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {limits?.canCreateMore === false
                ? t('createWorkspace.limitReached', 'Workspace Limit Reached')
                : t('createWorkspace.title', 'Create Workspace')
              }
            </h3>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="px-5 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking workspace limits...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="px-5 py-8 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          )}

          {/* Limit Reached Notice */}
          {limits && !limits.canCreateMore && !isLoading && !error && (
            <div className="px-5 py-8">
              <div className="text-center mb-6">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('createWorkspace.limitReachedTitle', 'Workspace Limit Reached')}
                </h4>
                <p className="text-gray-600 mb-4">
                  {t('createWorkspace.limitReachedDesc',
                    'You have reached the maximum number of workspaces allowed for your plan.'
                  )}
                </p>
              </div>

              {/* Current Usage */}
              <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-red-700">
                    {t('createWorkspace.currentUsage', 'Current Usage')}
                  </span>
                  <span className="text-sm font-bold text-red-900">
                    {limits.current} / {limits.max}
                  </span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${Math.min((limits.current / limits.max) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-red-600">
                  {t('createWorkspace.membershipLevel', 'Membership')}: {limits.membershipLevel}
                </div>
              </div>

              {/* Upgrade Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h5 className="font-medium text-blue-900 mb-2">
                  {t('createWorkspace.upgradeTitle', 'Need More Workspaces?')}
                </h5>
                <p className="text-blue-700 text-sm mb-3">
                  {t('createWorkspace.upgradeDesc', 'Upgrade your plan to create more workspaces and unlock additional features.')}
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  {t('createWorkspace.upgradeBtn', 'Upgrade Plan')}
                </button>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  {t('createWorkspace.close', 'Close')}
                </button>
              </div>
            </div>
          )}

          {/* Normal Create Form - Only show if can create more */}
          {limits && limits.canCreateMore && !isLoading && !error && (
            <>
              {/* Body */}
              <div className="px-5 py-4 space-y-5 flex flex-col gap-4">
                {/* Usage Progress Bar */}
                <div className={`rounded-lg p-3 mb-2 ${limits.current >= limits.max ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-medium ${limits.current >= limits.max ? 'text-red-700' : 'text-blue-700'}`}>
                      {t('createWorkspace.usage', 'Workspace Usage')}
                    </span>
                    <span className={`text-xs font-bold ${limits.current >= limits.max ? 'text-red-900' : 'text-blue-900'}`}>
                      {limits.current} / {limits.max}
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-1.5 ${limits.current >= limits.max ? 'bg-red-200' : 'bg-blue-200'}`}>
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${limits.current >= limits.max ? 'bg-red-600' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min((limits.current / limits.max) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`mt-1 text-xs ${limits.current >= limits.max ? 'text-red-600' : 'text-blue-600'}`}>
                    {limits.membershipLevel}
                  </div>
                </div>
                {/* Name - floating label */}
                <div className="mb-1">
                  <div className="relative w-full h-14 border-2 rounded-xl transition-colors duration-200 border-gray-200 focus-within:border-[#21b4ca]">
                    <input
                      id="ws-name"
                      type="text"
                      value={name}
                      onChange={onNameChange}
                      placeholder=" "
                      className="peer absolute inset-0 w-full h-full rounded-xl bg-transparent px-3 py-2 text-gray-900 outline-none"
                    />
                    <label
                      htmlFor="ws-name"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-500 transition-all bg-white px-1 pointer-events-none
                        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#21b4ca]
                        peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs"
                    >
                      {t('createWorkspace.name')}
                    </label>
                  </div>
                </div>

                {/* Description - floating label */}
                <div className="">
                  <div className="relative w-full min-h-30 border-2 rounded-xl transition-colors duration-200 border-gray-200 focus-within:border-[#21b4ca]">
                    <textarea
                      id="ws-description"
                      value={description ?? ''}
                      onChange={onDescriptionChange}
                      placeholder=" "
                      rows={3}
                      className="peer absolute inset-0 w-full h-full bg-transparent px-3 py-2 text-gray-900 outline-none resize-none"
                    />
                    <label
                      htmlFor="ws-description"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-500 transition-all bg-white px-1 pointer-events-none
                        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#21b4ca]
                        peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs"
                    >
                      {t('createWorkspace.description', 'Description (optional)')}
                    </label>
                  </div>
                </div>

                {/* Password toggle */}
                <div className="flex flex-col mb-0 gap-3">
                  <div className="flex items-center gap-2 ml-2">
                    <input
                      id="ws-has-password"
                      type="checkbox"
                      checked={hasPassword}
                      onChange={onToggleHasPassword}
                      className="h-4 w-4 rounded border-gray-300 text-red-500 outline-none focus:outline-none"
                    />
                    <label htmlFor="ws-has-password" className="text-sm text-gray-700 select-none">
                      {t('createWorkspace.havePassword', 'Have password')}
                    </label>
                  </div>

                  {hasPassword && (
                    <div className="mb-1">
                      <div className="relative w-full h-14 border-2 rounded-xl transition-colors duration-200 border-gray-200 focus-within:border-[#21b4ca]">
                        <input
                          id="ws-password"
                          type="password"
                          value={password}
                          onChange={onPasswordChange}
                          placeholder=" "
                          className="peer absolute inset-0 w-full h-full bg-transparent px-3 py-2 text-gray-900 outline-none"
                        />
                        <label
                          htmlFor="ws-password"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-500 transition-all bg-white px-1 pointer-events-none
                          peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#21b4ca]
                          peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs"
                        >
                          {t('createWorkspace.password', 'Password')}
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Friend search */}
                <div className="space-y-3">
                  <div className="mb-1">
                    <div className="relative w-full h-14 border-2 rounded-xl transition-colors duration-200 border-gray-200 focus-within:border-[#21b4ca]">
                      <input
                        id="ws-invite"
                        type="text"
                        value={searchQuery}
                        onChange={onSearchChange}
                        placeholder=" "
                        className="peer absolute inset-0 w-full h-full bg-transparent px-3 py-2 text-gray-900 outline-none"
                      />
                      <label
                        htmlFor="ws-invite"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-500 transition-all bg-white px-1 pointer-events-none
                          peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#21b4ca]
                          peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs"
                      >
                        {t('createWorkspace.inviteFriends', 'Invite friends')}
                      </label>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="max-h-40 overflow-y-auto mt-4 rounded-md border border-gray-200 divide-y divide-gray-100">
                    {friendResults.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No results</div>
                    ) : (
                      friendResults.map((f) => (
                        <div key={f.id} className="flex items-center justify-between px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                            {f.email ? (
                              <p className="text-xs text-gray-500 truncate">{f.email}</p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            data-id={f.id}
                            onClick={onAddFriend}
                            className="ml-3 inline-flex items-center rounded-md border border-blue-600 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            + Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Selected friends */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Selected</p>
                    {selectedFriends.length === 0 ? (
                      <div className="rounded-md border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500">
                        {t('createWorkspace.noFriends', 'No friends added yet')}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedFriends.map((f) => (
                          <span
                            key={f.id}
                            className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                          >
                            <span className="truncate max-w-[12rem]">{f.name}</span>
                            <button
                              type="button"
                              data-id={f.id}
                              onClick={onRemoveFriend}
                              className="rounded-full px-2 py-0.5 text-gray-600 hover:bg-gray-200"
                              aria-label={`Remove ${f.name}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  {t('createWorkspace.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={onSubmit}
                >
                  {t('createWorkspace.submit', 'Create Workspace')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;

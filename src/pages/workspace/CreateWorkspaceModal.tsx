import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { CreateWorkspaceModalProps } from '../../types/workspace/workspace.props';

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
            <h3 className="text-lg font-semibold text-gray-900">{t('createWorkspace.title', 'Create Workspace')}</h3>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-5 flex flex-col gap-4">
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
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;

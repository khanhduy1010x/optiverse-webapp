import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon/Icon.component';
import Button from '../common/Button.component';
import CreateWorkspaceModal from '../../pages/workspace/CreateWorkspaceModal';
import WorkspaceHubModal from '../../pages/workspace/WorkspaceHubModal';
import useCreateWorkspaceHook from '../../hooks/workspace/useCreateWorkspaceHook';
import useDropDownWorkspace from '../../hooks/workspace/useDropDownWorkspace.hook';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const WorkspaceSelector: React.FC = () => {
    const { t } = useAppTranslate('workspace');
    const [isWorkspaceHubOpen, setIsWorkspaceHubOpen] = useState(false);
    const dropdownHook = useDropDownWorkspace();
    const createHook = useCreateWorkspaceHook(dropdownHook.onWorkspaceCreated);
    return (
        <div className="flex items-center gap-2 z-50">
            {/* Home quick button */}
            <button
                onClick={dropdownHook.onHomeClick}
                className="flex items-center justify-center rounded-md border border-gray-200 text-white hover:bg-gray-50 hover:text-gray-800 transition-colors w-12 h-9"
                aria-label="Go home"
                title={t('workspaceSelector.home')}
            >
                <Icon name="home" size={16} />
            </button>

            {/* Workspace Dropdown */}
            <div className="relative ml-2">
                <Button
                    onClick={dropdownHook.onToggleDropdown}
                    className="flex items-center justify-around  px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
                >
                    <span className="hidden sm:inline">{dropdownHook.selectedWorkspace}</span>
                    <Icon
                        name="chevronDown"
                        color='white'
                        size={12}
                        className={`transition-transform ml-1 ${dropdownHook.isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                </Button>

                {dropdownHook.isDropdownOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-20"
                            onClick={dropdownHook.onCloseDropdown}
                        />
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg  z-20">
                            {dropdownHook.isLoadingWorkspaces ? (
                                <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    {t('workspaceSelector.loading')}
                                </div>
                            ) : (
                                dropdownHook.workspaces.map(workspace => (
                                    <button
                                        key={workspace.id}
                                        onClick={() => dropdownHook.onSelectWorkspace(workspace)}
                                        className={`w-full text-left  rounded-lg  cursor-pointer px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${dropdownHook.selectedWorkspace === workspace.name ? 'text-gray-900 font-medium' : 'text-gray-600'
                                            }`}
                                    >
                                        {workspace.name}
                                    </button>
                                ))
                            )}

                            <div className="border-t border-gray-200" />
                            <button
                                onClick={() => {
                                    dropdownHook.onCloseDropdown();
                                    setIsWorkspaceHubOpen(true);
                                }}
                                className="w-full text-left cursor-pointer px-4 py-2 rounded-lg text-sm flex items-center gap-2 text-purple-600 hover:bg-purple-50 transition-colors"
                            >
                                Workspace Hub
                            </button>
                            <button
                                onClick={() => {
                                    dropdownHook.onCloseDropdown();
                                    dropdownHook.setIsShowCreate(true);
                                }}
                                className="w-full text-left cursor-pointer px-4 py-2  rounded-lg  text-sm flex items-center gap-2 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                {t('workspaceSelector.createNew')}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Create Workspace Modal */}
            <CreateWorkspaceModal
                isOpen={dropdownHook.isShowCreate}
                onClose={() => dropdownHook.setIsShowCreate(false)}
                name={createHook.name}
                description={createHook.description}
                hasPassword={createHook.hasPassword}
                password={createHook.password}
                searchQuery={createHook.searchQuery}
                friendResults={createHook.friendResults}
                selectedFriends={createHook.selectedFriends}
                onSubmit={createHook.onSubmit}
                onNameChange={createHook.onNameChange}
                onDescriptionChange={createHook.onDescriptionChange}
                onToggleHasPassword={createHook.onToggleHasPassword}
                onPasswordChange={createHook.onPasswordChange}
                onSearchChange={createHook.onSearchChange}
                onAddFriend={createHook.onAddFriend}
                onRemoveFriend={createHook.onRemoveFriend}
            />

            {/* Workspace Hub Modal */}
            <WorkspaceHubModal
                isOpen={isWorkspaceHubOpen}
                onClose={() => setIsWorkspaceHubOpen(false)}
            />
        </div>
    );
};

export default WorkspaceSelector;

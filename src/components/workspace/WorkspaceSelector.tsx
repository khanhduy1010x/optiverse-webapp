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
                <Icon name="home" size={18} />
            </button>

            {/* Workspace Dropdown */}
            <div className="relative ml-1">
                <Button
                    onClick={dropdownHook.onToggleDropdown}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-500 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                    <span className="hidden sm:inline truncate max-w-xs">{dropdownHook.selectedWorkspace}</span>
                    <Icon
                        name="chevronDown"
                        size={14}
                        className={`transition-transform duration-200 text-gray-500 ${dropdownHook.isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                </Button>

                {dropdownHook.isDropdownOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-20"
                            onClick={dropdownHook.onCloseDropdown}
                        />
                        <div className="absolute top-full left-0  w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden" style={{
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
                        }}>
                            {dropdownHook.isLoadingWorkspaces ? (
                                <div className="px-4 py-6 flex flex-col items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-500"></div>
                                    <p className="text-sm text-gray-600">{t('workspaceSelector.loading')}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Home button */}
                                    <button
                                        onClick={() => dropdownHook.onSelectWorkspace({ id: 'home', name: 'Home' })}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${dropdownHook.selectedWorkspace === 'Home'
                                            ? 'bg-gray-50 text-gray-900 font-500'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon name="home" size={18} className="text-gray-600" />
                                        <span>{t('workspaceSelector.home')}</span>
                                    </button>

                                    {/* Owner Workspaces Section */}
                                    {dropdownHook.ownerWorkspaces.length > 0 && (
                                        <>
                                            <div className="border-t border-gray-100 mb-1" />
                                            <div className="px-4 py-2 text-xs font-600 text-gray-500 uppercase tracking-wider">
                                                {t('workspaceSelector.myWorkspaces')}
                                            </div>
                                            {dropdownHook.ownerWorkspaces.map(workspace => (
                                                <button
                                                    key={workspace.id}
                                                    onClick={() => !workspace.locked && dropdownHook.onSelectWorkspace(workspace)}
                                                    disabled={workspace.locked}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${workspace.locked
                                                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                                        : dropdownHook.selectedWorkspace === workspace.name
                                                            ? 'bg-gray-50 text-gray-900 font-500 hover:bg-gray-50'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${workspace.locked ? 'bg-gray-300' : 'bg-blue-500'}`} />
                                                    <span className="flex-1 text-left truncate">{workspace.name}</span>
                                                    {workspace.locked && (
                                                        <span className="text-xs gap-1 font-500 flex px-2 py-1 bg-gray-200 text-gray-600 rounded">
                                                            <Icon name='lock' size={14} /> Locked
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </>
                                    )}

                                    {/* Member Workspaces Section */}
                                    {dropdownHook.memberWorkspaces.length > 0 && (
                                        <>
                                            <div className="border-t border-gray-100 mb-1" />
                                            <div className="px-4 py-2 text-xs font-600 text-gray-500 uppercase tracking-wider">
                                                {t('workspaceSelector.memberOf')}
                                            </div>
                                            {dropdownHook.memberWorkspaces.map(workspace => (
                                                <button
                                                    key={workspace.id}
                                                    onClick={() => !workspace.locked && dropdownHook.onSelectWorkspace(workspace)}
                                                    disabled={workspace.locked}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${workspace.locked
                                                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                                        : dropdownHook.selectedWorkspace === workspace.name
                                                            ? 'bg-gray-50 text-gray-900 font-500 hover:bg-gray-50'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${workspace.locked ? 'bg-gray-300' : 'bg-gray-400'}`} />
                                                    <span className="flex-1 text-left truncate">{workspace.name}</span>
                                                    {workspace.locked ? (
                                                        <span className="text-xs flex gap-1 font-500 px-2 py-1 bg-gray-200 text-gray-600 rounded">
                                                            <Icon name='lock' size={14} /> Locked

                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 font-500">
                                                            {workspace.role === 'admin' ? t('workspaceSelector.admin') : t('workspaceSelector.member')}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </>
                                    )}

                                    {/* Empty state */}
                                    {dropdownHook.ownerWorkspaces.length === 0 && dropdownHook.memberWorkspaces.length === 0 && (
                                        <div className="px-4 py-8 text-sm text-gray-500 text-center">
                                            {t('workspaceSelector.noWorkspaces')}
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="border-t border-gray-100" />
                            <button
                                onClick={() => {
                                    dropdownHook.onCloseDropdown();
                                    setIsWorkspaceHubOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 font-500"
                            >
                                <span className='flex items-center gap-2'><Icon name='workspace' size={18} /> Workspace Hub</span>
                            </button>
                            <button
                                onClick={() => {
                                    dropdownHook.onCloseDropdown();
                                    dropdownHook.setIsShowCreate(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-600 text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                            >
                                <span className="text-base">+</span>
                                <span>{t('workspaceSelector.createNew')}</span>
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
        </div >
    );
};

export default WorkspaceSelector;

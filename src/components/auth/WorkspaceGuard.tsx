import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import WorkspaceService from '../../services/workspace.service';
import { useWorkspaceWebSocket } from '../../hooks/websocket/useWorkspaceWebSocket';
import { useGlobalWorkspaceEvents } from '../../hooks/websocket/useGlobalWorkspaceEvents';

interface WorkspaceGuardProps {
    children: React.ReactNode;
}

const WorkspaceGuard: React.FC<WorkspaceGuardProps> = ({ children }) => {
    const { t } = useTranslation();
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // WebSocket connection for global workspace events (ban, remove)
    const { socket } = useWorkspaceWebSocket({
        workspaceId: workspaceId || null,
        isDashboard: false
    });

    // Listen to global workspace events
    useGlobalWorkspaceEvents({ socket, workspaceId: workspaceId || null });

    useEffect(() => {
        const checkWorkspaceAccess = async () => {
            if (!workspaceId || !currentUser) {
                setIsLoading(false);
                setError(t('dashboardWorkspace.workspaceGuard.invalidWorkspaceOrUser'));
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Call API to check if user has access to this workspace
                const accessResponse = await WorkspaceService.verifyWorkspaceAccess(workspaceId);

                if (accessResponse && accessResponse.hasAccess) {
                    // If user has access, allow them to proceed
                    setHasAccess(true);
                } else {
                    setHasAccess(false);
                    setError(t('dashboardWorkspace.workspaceGuard.noAccess'));
                }
            } catch (error: any) {
                console.error('Workspace access check failed:', error);
                setHasAccess(false);

                if (error.response?.status === 403) {
                    setError(t('dashboardWorkspace.workspaceGuard.noAccess'));
                } else if (error.response?.status === 404) {
                    setError(t('dashboardWorkspace.workspaceGuard.workspaceNotFound'));
                } else {
                    setError(t('dashboardWorkspace.workspaceGuard.verifyFailed'));
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkWorkspaceAccess();
    }, [workspaceId, currentUser]);

    // Handle navigation when access is denied
    useEffect(() => {
        if (!isLoading && !hasAccess && error) {
            // Redirect to workspace list after showing error briefly
            const timer = setTimeout(() => {
                navigate('/', { replace: true });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isLoading, hasAccess, error, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
                        <h2 className="text-xl font-semibold text-gray-800">{t('dashboardWorkspace.workspaceGuard.verifying')}</h2>
                        <p className="text-gray-600 text-center">{t('dashboardWorkspace.workspaceGuard.checkingPermissions')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !hasAccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.5 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-red-800">{t('dashboardWorkspace.workspaceGuard.accessDenied')}</h2>
                        <p className="text-gray-600 text-center">{error}</p>
                        <p className="text-sm text-gray-500 text-center">
                            {t('dashboardWorkspace.workspaceGuard.redirectMessage')}
                        </p>
                        <button
                            onClick={() => navigate('/', { replace: true })}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
                        >
                            {t('dashboardWorkspace.workspaceGuard.goToWorkspaceList')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default WorkspaceGuard;
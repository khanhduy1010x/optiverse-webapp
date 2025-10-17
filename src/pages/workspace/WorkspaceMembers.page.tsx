import React from 'react';
import { useParams } from 'react-router-dom';

const WorkspaceMembersPage: React.FC = () => {
    const { workspaceId } = useParams();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">Workspace Members</h1>
            <p className="text-gray-600 mt-2">Manage members for workspace: {workspaceId}</p>
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6">
                <p className="text-gray-500">UI mẫu quản lý thành viên workspace.</p>
            </div>
        </div>
    );
};

export default WorkspaceMembersPage;

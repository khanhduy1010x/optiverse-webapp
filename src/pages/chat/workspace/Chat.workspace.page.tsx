import React from 'react';
import { useParams } from 'react-router-dom';

const ChatWorkspacePage: React.FC = () => {
    const { workspaceId } = useParams();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">Workspace Chat</h1>
            <p className="text-gray-600 mt-2">Workspace ID: {workspaceId}</p>
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6">
                <p className="text-gray-500">UI mẫu cho Chat trong workspace.</p>
            </div>
        </div>
    );
};

export default ChatWorkspacePage;

import React, { forwardRef } from 'react';

interface CursorPosition {
    index: number;
    length: number;
}

interface UserCursorProps {
    userId: string;
    position?: CursorPosition;
    userName: string;
    userColor: string;
}

const UserCursor = forwardRef<HTMLDivElement, UserCursorProps>(
    ({ userId, position, userName, userColor }, ref) => {
        if (!position) return null;

        return (
            <div
                ref={ref}
                className="user-cursor-container"
                style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    zIndex: 100,
                    transition: 'transform 0.1s ease-out',
                }}
                data-user-id={userId}
            >
                {/* Con trỏ */}
                <div
                    className="user-cursor"
                    style={{
                        position: 'absolute',
                        width: '2px',
                        height: '20px',
                        backgroundColor: userColor,
                        transition: 'left 0.1s ease-out, top 0.1s ease-out',
                    }}
                />

                {/* Nhãn tên người dùng */}
                <div
                    className="user-cursor-label"
                    style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '0px',
                        backgroundColor: userColor,
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        fontWeight: 'bold',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        opacity: 0.9,
                    }}
                >
                    {userName}
                </div>

                {/* Highlight text nếu có selection */}
                {position.length > 0 && (
                    <div
                        className="user-cursor-selection"
                        style={{
                            position: 'absolute',
                            backgroundColor: `${userColor}33`, // Thêm độ trong suốt
                            height: '20px',
                            transition: 'left 0.1s ease-out, top 0.1s ease-out, width 0.1s ease-out',
                        }}
                    />
                )}
            </div>
        );
    }
);

UserCursor.displayName = 'UserCursor';

export default UserCursor; 
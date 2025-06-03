import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import UserCursor from './UserCursor';

interface CursorPosition {
    index: number;
    length: number;
}

interface UserCursor {
    userId: string;
    position: CursorPosition;
    userName: string;
    userColor: string;
    lastUpdated: number;
}

interface UserCursorsContainerProps {
    quillRef: React.RefObject<ReactQuill | null>;
    currentUserId: string | null;
}

export interface UserCursorsContainerHandle {
    updateCursors: (newCursor: UserCursor) => void;
    removeCursor: (userId: string) => void;
    clearAllCursors: () => void;
}

const UserCursorsContainer = forwardRef<UserCursorsContainerHandle, UserCursorsContainerProps>(
    ({ quillRef, currentUserId }, ref) => {
        const [cursors, setCursors] = useState<UserCursor[]>([]);
        const cursorsRef = useRef<{ [userId: string]: HTMLDivElement | null }>({});
        const isMountedRef = useRef<boolean>(true);

        // Kiểm tra component có còn mounted không
        useEffect(() => {
            isMountedRef.current = true;
            return () => {
                isMountedRef.current = false;
            };
        }, []);

        // Hàm này dùng để cập nhật vị trí của con trỏ trên giao diện
        const updateCursorPositions = () => {
            if (!quillRef.current || !isMountedRef.current) return;

            const quill = quillRef.current.getEditor();
            const quillContainer = quill.root;

            cursors.forEach(cursor => {
                if (cursor.userId === currentUserId) return; // Không hiển thị con trỏ của người dùng hiện tại

                const cursorElement = cursorsRef.current[cursor.userId];
                if (!cursorElement) return;

                try {
                    // Lấy tọa độ dựa trên index
                    const positionInfo = quill.getBounds(cursor.position.index);

                    // Cập nhật vị trí của container
                    cursorElement.style.transform = `translate(${positionInfo.left}px, ${positionInfo.top}px)`;

                    // Cập nhật con trỏ
                    const cursorEl = cursorElement.querySelector('.user-cursor');
                    if (cursorEl instanceof HTMLElement) {
                        cursorEl.style.height = `${positionInfo.height}px`;
                    }

                    // Cập nhật selection nếu có
                    const selectionEl = cursorElement.querySelector('.user-cursor-selection');
                    if (selectionEl instanceof HTMLElement && cursor.position.length > 0) {
                        // Lấy tọa độ của phần cuối selection
                        const endPositionInfo = quill.getBounds(cursor.position.index + cursor.position.length);

                        // Nếu ở cùng một dòng
                        if (endPositionInfo.top === positionInfo.top) {
                            selectionEl.style.width = `${endPositionInfo.left - positionInfo.left}px`;
                            selectionEl.style.height = `${positionInfo.height}px`;
                            selectionEl.style.display = 'block';
                        } else {
                            // Nếu ở nhiều dòng khác nhau, hiện tại chỉ hiển thị con trỏ không highlight
                            selectionEl.style.display = 'none';
                        }
                    }
                } catch (error) {
                    console.error('Error updating cursor position:', error);
                }
            });
        };

        // Cập nhật vị trí con trỏ khi cursors thay đổi
        useEffect(() => {
            if (isMountedRef.current) {
                updateCursorPositions();
            }
        }, [cursors]);

        // Cập nhật vị trí con trỏ khi scroll hoặc resize
        useEffect(() => {
            if (!quillRef.current) return;

            const quill = quillRef.current.getEditor();
            const container = quill.root.parentElement;

            const handleScroll = () => {
                updateCursorPositions();
            };

            const handleResize = () => {
                updateCursorPositions();
            };

            container?.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', handleResize);

            return () => {
                container?.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleResize);
            };
        }, [quillRef.current]);

        // Xóa con trỏ cũ (inactive) sau 30 giây
        useEffect(() => {
            const interval = setInterval(() => {
                const now = Date.now();
                setCursors(prevCursors =>
                    prevCursors.filter(cursor => now - cursor.lastUpdated < 30000)
                );
            }, 5000);

            return () => clearInterval(interval);
        }, []);

        // Xử lý khi có cursor mới hoặc cursor cập nhật
        const updateCursors = (newCursor: UserCursor) => {
            if (!isMountedRef.current) return;

            setCursors(prevCursors => {
                // Kiểm tra xem đã có con trỏ của user này chưa
                const existingIndex = prevCursors.findIndex(c => c.userId === newCursor.userId);

                if (existingIndex >= 0) {
                    // Cập nhật con trỏ hiện có
                    const updatedCursors = [...prevCursors];
                    updatedCursors[existingIndex] = newCursor;
                    return updatedCursors;
                } else {
                    // Thêm con trỏ mới
                    return [...prevCursors, newCursor];
                }
            });
        };

        // Xóa cursor khi người dùng rời đi
        const removeCursor = (userId: string) => {
            if (!isMountedRef.current) return;

            setCursors(prevCursors => prevCursors.filter(cursor => cursor.userId !== userId));
        };

        // Thêm phương thức để xóa tất cả con trỏ
        const clearAllCursors = () => {
            if (!isMountedRef.current) return;

            setCursors([]);
            cursorsRef.current = {};
        };

        // Expose public methods
        useImperativeHandle(ref, () => ({
            updateCursors,
            removeCursor,
            clearAllCursors
        }));

        // Hàm callback an toàn cho ref
        const setRef = (userId: string) => (el: HTMLDivElement | null) => {
            cursorsRef.current[userId] = el;
        };

        return (
            <div className="user-cursors-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                {cursors.map(cursor => (
                    cursor.userId !== currentUserId && (
                        <UserCursor
                            key={cursor.userId}
                            userId={cursor.userId}
                            position={cursor.position}
                            userName={cursor.userName}
                            userColor={cursor.userColor}
                            ref={setRef(cursor.userId)}
                        />
                    )
                ))}
            </div>
        );
    }
);

UserCursorsContainer.displayName = 'UserCursorsContainer';

export { UserCursorsContainer, type UserCursor }; 
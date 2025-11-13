import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface PromptModalState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Custom hook to block navigation and show confirmation dialog
 * @param when - Boolean condition to enable/disable blocking
 * @param message - Message to show in confirmation dialog
 * @returns Modal state and component for rendering
 */
export function usePrompt(when: boolean, message: string) {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalState, setModalState] = useState<PromptModalState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirmModal = useCallback((onConfirm: () => void) => {
    setModalState({
      isOpen: true,
      message,
      onConfirm: () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        onConfirm();
      },
      onCancel: () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, [message]);

  useEffect(() => {
    if (!when) return;

    // Store original pushState and replaceState
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    // Override pushState
    window.history.pushState = function(...args) {
      showConfirmModal(() => {
        return originalPushState.apply(window.history, args);
      });
    };

    // Override replaceState
    window.history.replaceState = function(...args) {
      showConfirmModal(() => {
        return originalReplaceState.apply(window.history, args);
      });
    };

    // Handle popstate (back/forward buttons)
    const handlePopState = (e: PopStateEvent) => {
      showConfirmModal(() => {
        // Allow navigation by doing nothing - the browser will handle it
      });
      // Push current state back to prevent navigation initially
      window.history.pushState(null, '', location.pathname + location.search);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      // Restore original methods
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [when, showConfirmModal, location.pathname, location.search]);

  return modalState;
}

/**
 * Hook to handle browser beforeunload event (tab close, reload, etc.)
 * @param when - Boolean condition to enable/disable blocking
 * @param message - Message to show (browsers may use their own message)
 */
export function useBeforeUnload(when: boolean, message: string = "") {
  useEffect(() => {
    if (!when) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when, message]);
}
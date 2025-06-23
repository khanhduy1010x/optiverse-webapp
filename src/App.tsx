import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard.page';
import FlashcardStatistic from './pages/Flashcard/FlashcardStatistic.page';
import AuthContainer from './pages/Auth/AuthContainer.page';
import GoogleCallback from './pages/Auth/GoogleCallback.page';
import FlashcardDeckList from './pages/Flashcard/FlashcardDeckList.page';
import './App.css';
import "./i18n.ts"
import { getMainSidebarActiveSection } from './components/common/Navigation/navigation';
import SliderBar from './components/layout/Sidebar.component';
import AddFlashcard from './pages/Flashcard/AddFlashcard.page';
import UserProfile from './pages/Profile/UserProfile.page';
import FocusTimer from './pages/FocusTimer/FocusTimer.page';
import FocusTimerStatistic from './pages/FocusTimer/FocusTimerStatistic.page';
import { ThemeProvider } from './contexts/theme.context';
import NoteScreen from './pages/Note/NoteScreen.page';
import FlashcardList from './pages/Flashcard/FlashcardList.page';
import FlashcardReview from './pages/Flashcard/FlashcardReview.page';
import FriendList from './pages/Friend/FriendList.page';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AuthChecker } from './components/auth/AuthChecker';
import FocusSessionList from './pages/FocusTimer/FocusTimerList.page';
import { AuthViewType } from './types/auth/auth.types';
import LoginSessions from './pages/Profile/LoginSession.page';
import AchievementsPage from './pages/Profile/Achievements.page';
import TaskPage from './pages/Task/Task.page';
import TemplateComponent from './pages/Template/TemplateComponent.page';
import FocusTimerLayout from './pages/FocusTimer/FocusTimerLayout.page';
import ChatPage from './pages/chat/ChatPage';
import { useNewMessageNotification } from './hooks/chat/useNewMessageNotification';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = (searchParams.get('view') as AuthViewType) || 'login';

  // Sử dụng hook để lắng nghe tin nhắn mới
  useNewMessageNotification();

  const showSidebar =
    location.pathname !== '/' &&
    !location.pathname.startsWith('/template') &&
    !location.pathname.startsWith('/auth/google') &&
    !location.pathname.startsWith('/forgot-password');

  // Sử dụng hàm mới để lấy active section cho sidebar chính
  const activeSection = getMainSidebarActiveSection(location.pathname);

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen">
      {showSidebar && (
        <SliderBar activeSection={activeSection} onNavClick={handleNavClick} />
      )}

      <div
        className={`flex-1 transition-all bg-white duration-300 ease-in-out ${showSidebar ? '' : 'ml-0'
          } h-full w-full overflow-auto`}
      >
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/template" element={<TemplateComponent />} />
          <Route
            path="/"
            element={
              <PublicRoute restricted={true}>
                <AuthContainer initialView={initialView} />
              </PublicRoute>
            }
          />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute restricted={true}>
                <AuthContainer initialView="forgot" />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute restricted={true}>
                <AuthContainer initialView="verify" />
              </PublicRoute>
            }
          />
          <Route
            path="*"
            element={
              <PublicRoute restricted={true}>
                <AuthContainer initialView={initialView} />
              </PublicRoute>
            }
          />

          {/* Protected routes - require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcard-statistic"
            element={
              <ProtectedRoute>
                <FlashcardStatistic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcard-deck"
            element={
              <ProtectedRoute>
                <FlashcardDeckList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcard-deck/:deckId"
            element={
              <ProtectedRoute>
                <FlashcardList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcard-deck/:deckId/add"
            element={
              <ProtectedRoute>
                <AddFlashcard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcard-deck/:deckId/learn"
            element={
              <ProtectedRoute>
                <FlashcardReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Focus Timer routes with shared layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <FocusTimerLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="focus-timer"
              element={<FocusTimer />}
            />
            <Route
              path="manage-focus-timer"
              element={<FocusSessionList />}
            />
            <Route
              path="statistics-timer"
              element={<FocusTimerStatistic />}
            />
          </Route>

          <Route
            path="/note"
            element={
              <ProtectedRoute>
                <NoteScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task"
            element={
              <ProtectedRoute>
                <TaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login-session"
            element={
              <ProtectedRoute>
                <LoginSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthChecker>
          <AppContent />
        </AuthChecker>
      </Router>
    </ThemeProvider>
  );
};

export default App;

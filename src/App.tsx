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
import { getSectionKeyFromPath } from './components/common/Navigation/navigation';
import SliderBar from './components/layout/Sidebar.component';
import AddFlashcard from './pages/Flashcard/AddFlashcard.page';
import UserProfile from './pages/Profile/UserProfile.page';
import FocusTimer from './pages/FocusTimer/FocusTimer.page';
import Task from './pages/Task/Task.page';
import FocusTimerStatistic from './pages/FocusTimer/FocusTimerStatistic.page';
import { ThemeProvider } from './contexts/theme.context';
import NoteScreen from './pages/Note/NoteScreen.page';
import FlashcardList from './pages/Flashcard/FlashcardList.page';
import FlashcardReview from './pages/Flashcard/FlashcardReview.page';
import FriendList from './pages/Friend/FriendList.page';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AuthProvider } from './contexts/auth.context';
import FocusSessionList from './pages/FocusTimer/FocusTimerList.page';
import { AuthViewType } from './types/auth/auth.types';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = (searchParams.get('view') as AuthViewType) || 'login';

  const showSidebar =
    location.pathname !== '/' &&
    !location.pathname.startsWith('/auth/google') &&
    !location.pathname.startsWith('/forgot-password');
  const activeSection = getSectionKeyFromPath(location.pathname);

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen">
      {showSidebar && (
        <SliderBar activeSection={activeSection} onNavClick={handleNavClick} />
      )}

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${showSidebar ? '' : 'ml-0'
          } h-full w-full overflow-auto`}
      >
        <Routes>
          {/* Public routes - accessible without authentication */}
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
              <PublicRoute restricted={false}>
                <AuthContainer initialView="forgot" />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute restricted={false}>
                <AuthContainer initialView="verify" />
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
            path="/flashcard-static"
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
            path="/view-flashcard"
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
          <Route
            path="/focus-timer"
            element={
              <ProtectedRoute>
                <FocusTimer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-focus-timer"
            element={
              <ProtectedRoute>
                <FocusSessionList />
              </ProtectedRoute>
            }
          />
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
                <Task />
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus-timer/statistic"
            element={
              <ProtectedRoute>
                <FocusTimerStatistic />
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
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Settings from './pages/Settings/Settings';
import FlashCardStatic from './pages/FlashCard/FlashCardStatic';
import AuthContainer from './pages/Auth/AuthContainer';
import GoogleCallback from './pages/Auth/GoogleCallback';
import FlashcardDeckList from './pages/FlashCard/FlashcardDeckList';
import { AuthView } from './types/global.types';
import './App.css';
import { getSectionKeyFromPath } from './components/common/Navigation/navigation';
import SliderBar from './components/layout/Sidebar';
import AddFlashcard from './pages/FlashCard/AddFlashCard';
import UserProfile from './pages/Profile/UserProfile';
import LoginSessions from './pages/Profile/LoginSessions';
import FocusTimer from './pages/FocusTimer/FocusTimer';
import ManageFocusTimer from './pages/FocusTimer/ManageFocusTimer';
import Task from './pages/Task/Task';
import Statistics from './pages/FocusTimer/Statistics';
import { ThemeProvider } from './contexts/ThemeContext';
import NoteScreen from './pages/Note/NoteScreen';
import FlashcardList from './pages/FlashCard/FlashcardList';
import FlashcardReview from './pages/FlashCard/FlashcardReview';
import FriendList from './pages/Friend/FriendList';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import ForgotPasswordForm from './pages/Auth/ForgotPasswordForm';
import { AuthProvider } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = (searchParams.get('view') as AuthView) || 'login';

  const showSidebar = location.pathname !== '/' && !location.pathname.startsWith('/auth/google') && !location.pathname.startsWith('/forgot-password');
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
        className={`flex-1 transition-all duration-300 ease-in-out ${
          showSidebar ? '' : 'ml-0'
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

          <Route 
            path="/auth/google/callback" 
            element={<GoogleCallback />} 
          />
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
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/flashcard-static" element={
            <ProtectedRoute>
              <FlashCardStatic />
            </ProtectedRoute>
          } />
          <Route path="/flashcard-deck" element={
            <ProtectedRoute>
              <FlashcardDeckList />
            </ProtectedRoute>
          } />
          <Route path="/flashcard-deck/:deckId" element={
            <ProtectedRoute>
              <FlashcardList />
            </ProtectedRoute>
          } />
          <Route path="/flashcard-deck/:deckId/add" element={
            <ProtectedRoute>
              <AddFlashcard />
            </ProtectedRoute>
          } />
          <Route path="/view-flashcard" element={
            <ProtectedRoute>
              <FlashcardReview />
            </ProtectedRoute>
          } />
          <Route path="/user-profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/focus-timer" element={
            <ProtectedRoute>
              <FocusTimer />
            </ProtectedRoute>
          } />
          <Route path="/manage-focus-timer" element={
            <ProtectedRoute>
              <ManageFocusTimer />
            </ProtectedRoute>
          } />
          <Route path="/note" element={
            <ProtectedRoute>
              <NoteScreen />
            </ProtectedRoute>
          } />
          <Route path="/task" element={
            <ProtectedRoute>
              <Task />
            </ProtectedRoute>
          } />
          <Route path="/statistics-timer" element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          } />
          <Route path="/friends" element={
            <ProtectedRoute>
              <FriendList />
            </ProtectedRoute>
          } />
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

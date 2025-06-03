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
import FlashcardDeckList from './pages/FlashCard/FlashcardDeckList';
import { AuthView } from './types/global.types';
import './App.css';
import { getSectionKeyFromPath } from './components/common/Navigation/navigation';
import SliderBar from './components/layout/Sidebar';
import AddFlashcard from './pages/FlashCard/AddFlashCard';
import UserProfile from './pages/Profile/UserProfile';
import FocusTimer from './pages/FocusTimer/FocusTimer';
import ManageFocusTimer from './pages/FocusTimer/ManageFocusTimer';
import Task from './pages/Task/Task';
import Statistics from './pages/FocusTimer/Statistics';
import { ThemeProvider } from './contexts/ThemeContext';
import NoteScreen from './pages/Note/NoteScreen';
import FlashcardList from './pages/FlashCard/FlashcardList';
import FlashcardReview from './pages/FlashCard/FlashcardReview';
import FriendList from './pages/Friend/FriendList'; // Thêm import
const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = (searchParams.get('view') as AuthView) || 'login';

  const showSidebar = location.pathname !== '/';
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
          <Route
            path="/"
            element={<AuthContainer initialView={initialView} />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/flashcard-static" element={<FlashCardStatic />} />
          <Route path="/flashcard-deck" element={<FlashcardDeckList />} />
          <Route
            path="/flashcard-deck/:deckId"
            element={<FlashcardList />}
          />
          <Route
            path="/flashcard-deck/:deckId/add"
            element={<AddFlashcard />}
          />
          <Route path="/view-flashcard" element={<FlashcardReview />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/focus-timer" element={<FocusTimer />} />
          <Route path="/manage-focus-timer" element={<ManageFocusTimer />} />
          <Route path="/note" element={<NoteScreen />} />
          <Route path="/task" element={<Task />} />
          <Route path="/statistics-timer" element={<Statistics />} />
            <Route path="/friends" element={<FriendList />} /> {/* Thêm route cho FriendList */}
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;

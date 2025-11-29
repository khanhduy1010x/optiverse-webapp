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
import DashboardWorkspacePage from './pages/Dashboard/workspace/Dashboard.workspace.page';
import FlashcardStatistic from './pages/Flashcard/FlashcardStatistic.page';
import GoogleCallback from './pages/Auth/GoogleCallback.page';
import FlashcardDeckList from './pages/Flashcard/FlashcardDeckList.page';
import FlashcardWorkspacePage from './pages/Flashcard/workspace/Flashcard.workspace.page';
import FlashcardWorkspaceStatistic from './pages/Flashcard/workspace/FlashcardWorkspaceStatistic.page';
import './App.css';
import "./i18n.ts"
import { getMainSidebarActiveSection } from './components/common/Navigation/navigation';
import SliderBar from './components/layout/Sidebar.component';
import Header from './components/layout/Header.component';
import AddFlashcard from './pages/Flashcard/AddFlashcard.page';
import UserProfile from './pages/Profile/UserProfile.page';
import NotificationSettingsPage from './pages/Profile/NotificationSettingsPage';
import PaymentHistoryPage from './pages/Profile/PaymentHistory.page';
import FocusTimer from './pages/FocusTimer/FocusTimer.page';
import FocusTimerStatistic from './pages/FocusTimer/FocusTimerStatistic.page';
import { ThemeProvider } from './contexts/theme.context';
import { FocusTimerProvider } from './contexts/FocusTimer.context';
import NoteScreen from './pages/Note/NoteScreen.page';
import NoteWorkspacePage from './pages/Note/workspace/Note.workspace.page';
import FlashcardList from './pages/Flashcard/FlashcardList.page';
import FlashcardReview from './pages/Flashcard/FlashcardReview.page';
import FriendList from './pages/Friend/FriendList.page';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AuthChecker } from './components/auth/AuthChecker';
import { AdminRoute } from './components/AdminRoute';
import FocusSessionList from './pages/FocusTimer/FocusTimerList.page';
import { AuthViewType } from './types/auth/auth.types';
import LoginSessions from './pages/Profile/LoginSession.page';
import TaskPage from './pages/Task/Task.page';
import TaskWorkspacePage from './pages/WorkspaceTask/Task.workspace.page';
import TemplateComponent from './pages/Template/TemplateComponent.page';
import FocusTimerLayout from './pages/FocusTimer/FocusTimerLayout.page';
import FocusTimerWorkspacePage from './pages/FocusTimer/workspace/FocusTimer.workspace.page';
import FocusRoomsPage from './pages/FocusTimer/workspace/FocusRooms.page';
import ChatPage from './pages/chat/ChatPage';
import ChatWorkspacePage from './pages/chat/workspace/Chat.workspace.page';
import WorkspaceChatPage from './pages/workspace/WorkspaceChatPage';
import { useNewMessageNotification } from './hooks/chat/useNewMessageNotification';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { typingAnimationStyles, countdownAnimationStyles } from './styles/global.style';
import WorkspaceGuard from './components/auth/WorkspaceGuard';
import AdminDashboard from './pages/Admin/UserManagement.page';
import MpsManagement from './pages/Admin/MpsManagement.screen';
import SystemSettings from './pages/Admin/SystemSettings';
import AdminLayout from './pages/Admin/AdminLayout';
import { useEffect, useState } from 'react';
import BannedModal from './components/BannedModal';
import TaskStatistic from './pages/Task/TaskStatistic.page';
import UserAchievementPage from './pages/user/UserAchievement.page';
import AchievementManagement from './pages/Achievement/AchievementManagement.page';
import {
  BlogHomePage,
  BlogPostPage,
  BlogCreatePage,
  BlogEditPage
} from './pages/Blog';
import BlogWorkspacePage from './pages/Blog/workspace/Blog.workspace.page';
import WorkspaceBlogCreatePage from './pages/Blog/workspace/BlogCreate.workspace.page';
import WorkspaceBlogPostPage from './pages/Blog/workspace/BlogPost.workspace.page';
import WorkspaceBlogBookmarksPage from './pages/Blog/workspace/BlogBookmarks.workspace.page';
import WorkspaceBlogReportsPage from './pages/Blog/workspace/BlogReports.workspace.page';
import BlogBookmarksPage from './pages/Blog/BlogBookmarks.page';
import BlogReportsPage from './pages/Blog/BlogReports.page';
import Login from './pages/Auth/Login.screen';
import RegisterContainer from './pages/Auth/RegisterContainer';
import HomePage from './pages/Auth/HomePage.page';
import ForgotPasswordContainer from './pages/Auth/ForgotPasswordContainer.page';
import WorkspaceMembersPage from './pages/workspace/WorkspaceMembers.page';
import { Navigate } from 'react-router-dom';
import MarketplaceHomePage from './pages/Marketplace/Home.page';
import MyItemsPage from './pages/Marketplace/MyItems.page';
import PurchaseHistoryPage from './pages/Marketplace/PurchaseHistory.page';
import FavoritesPage from './pages/Marketplace/Favorites.page';
import FollowersPage from './pages/Marketplace/Followers.page';
import SalesAnalyticsPage from './pages/Marketplace/SalesAnalytics.page';
import MembershipScreen from './pages/Membership/Membership.screen';
import PaymentMethodScreen from './pages/Membership/PaymentMethod.screen';
import PaymentCallbackScreen from './pages/Membership/PaymenCallBack.screen';
import PayOSCheckoutScreen from './pages/Membership/PayOSCheckout.screen';
import MoMoCheckoutScreen from './pages/Membership/MoMoCheckout.screen';
import Leaderboard from './components/leaderboard/Leaderboard';


declare global {
  interface Window {
    showUserBannedModal?: () => void;
  }
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useNewMessageNotification();

  const showSidebar =
    location.pathname !== '/' &&
    !location.pathname.startsWith('/template') &&
    !location.pathname.startsWith('/auth/google') &&
    !location.pathname.startsWith('/register') &&
    !location.pathname.startsWith('/forgot') &&
    !location.pathname.startsWith('/forgot-password') &&
    location.pathname !== '/login' && 
    !location.pathname.startsWith('/membership');

  const showHeader =     location.pathname !== '/' &&
    !location.pathname.startsWith('/template') &&
    !location.pathname.startsWith('/auth/google') &&
    !location.pathname.startsWith('/register') &&
    !location.pathname.startsWith('/forgot') &&
    !location.pathname.startsWith('/forgot-password') &&
    location.pathname !== '/login';

  const activeSection = getMainSidebarActiveSection(location.pathname);

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {showHeader && <Header />}

      <div className="flex flex-1 min-h-0">
        {showSidebar && (
          <SliderBar activeSection={activeSection} onNavClick={handleNavClick} />
        )}

        <div
          className={`flex-1 overflow-hidden w-full transition-all  overflow-y-auto ${showSidebar && 'h-[calc(100vh-57px)] mt-[57px]'} duration-300  ease-in-out ${showSidebar && 'pl-16'
            }`}
        >      <Routes>
            {/* Public routes - accessible without authentication */}
            <Route path="/template" element={<TemplateComponent />} />
            <Route
              path="/"
              element={
                <PublicRoute restricted={true}>
                  <HomePage />
                </PublicRoute>
              }
            />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            {/* Marketplace routes */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <MarketplaceHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/my-items"
              element={
                <ProtectedRoute>
                  <MyItemsPage />
                </ProtectedRoute>
              }
            />
            {/* Membership route */}
            <Route
              path="/membership"
              element={
                <ProtectedRoute>
                  <MembershipScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/membership/payment"
              element={
                <ProtectedRoute>
                  <PaymentMethodScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/membership/payos-checkout"
              element={
                <ProtectedRoute>
                  <PayOSCheckoutScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/membership/momo-checkout"
              element={
                <ProtectedRoute>
                  <MoMoCheckoutScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/membership/callback"
              element={
                <ProtectedRoute>
                  <PaymentCallbackScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="rooms"
              element={<FocusRoomsPage />}
            />

            <Route
              path="/marketplace/purchase-history"
              element={
                <ProtectedRoute>
                  <PurchaseHistoryPage />
                </ProtectedRoute>
              }
            />
                 <Route
              path="/marketplace/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/followers"
              element={
                <ProtectedRoute>
                  <FollowersPage />
                </ProtectedRoute>
              }
            />
       
           <Route
              path="/marketplace/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />                
                  </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/analytics"
              element={
                <ProtectedRoute>
                  <SalesAnalyticsPage />
                       </ProtectedRoute>
              }
            />
                  <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forgot"
              element={
                <PublicRoute restricted={true}>
                  <ForgotPasswordContainer />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute restricted={true}>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute restricted={true}>
                  <RegisterContainer />
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
            {/* Workspace prefixed routes */}
            <Route
              path="/workspace/:workspaceId/dashboard"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <DashboardWorkspacePage />
                  </WorkspaceGuard>
                </ProtectedRoute>
              }
            />

            {/* Workspace Chat Route - NEW */}
            <Route
              path="/workspace/:workspaceId/chat"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <WorkspaceChatPage />
                  </WorkspaceGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/task"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <TaskWorkspacePage />
                  </WorkspaceGuard>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<MpsManagement />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="achievements" element={<AchievementManagement />} />

            </Route>
            <Route
              path="/workspace/:workspaceId/focus-timer"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <WorkspaceMembersPage />
                  </WorkspaceGuard>
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
              path="/workspace/:workspaceId/flashcard-deck"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <FlashcardWorkspacePage />
                  </WorkspaceGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/flashcard-statistic"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <FlashcardWorkspaceStatistic />
                  </WorkspaceGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/flashcard-deck/:deckId"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <FlashcardList />
                  </WorkspaceGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/flashcard-deck/:deckId/add"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <AddFlashcard />
                  </WorkspaceGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/flashcard-deck/:deckId/learn"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <FlashcardReview />
                  </WorkspaceGuard>
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
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-history"
              element={
                <ProtectedRoute>
                  <PaymentHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Focus Timer routes with shared layout */}
            <Route
              path="/focus-timer"
              element={
                <ProtectedRoute>
                  <FocusTimerProvider>
                    <FocusTimerLayout />
                  </FocusTimerProvider>
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<FocusTimer />}
              />
              <Route
                path="manage"
                element={<FocusSessionList />}
              />
              <Route
                path="statistics"
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
              path="/workspace/:workspaceId/note"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <NoteWorkspacePage />
                  </WorkspaceGuard>
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
              path="/task-statistic"
              element={
                <ProtectedRoute>
                  <TaskStatistic />
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
              path="/workspace/:workspaceId/focus-rooms"
              element={
                <ProtectedRoute>
                  <WorkspaceGuard>
                    <FocusRoomsPage />
                  </WorkspaceGuard>
                </ProtectedRoute>
              }
            />
            {/* Hide profile/settings inside workspace by redirecting to workspace dashboard */}
            <Route path="/workspace/:workspaceId/user-profile" element={<Navigate to="/workspace/:workspaceId/dashboard" replace />} />
            <Route path="/workspace/:workspaceId/notifications" element={<Navigate to="/workspace/:workspaceId/dashboard" replace />} />
            <Route path="/workspace/:workspaceId/login-session" element={<Navigate to="/workspace/:workspaceId/dashboard" replace />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/chat"
              element={
                <ProtectedRoute>
                  <ChatWorkspacePage />
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
              path="/user-achievements"
              element={
                <ProtectedRoute>
                  <UserAchievementPage />
                </ProtectedRoute>
              }
            />

            {/* Blog routes */}
            <Route
              path="/blog"
              element={
                <ProtectedRoute>
                  <BlogHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/blog"
              element={
                <ProtectedRoute>
                  <BlogWorkspacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/blog/bookmarks"
              element={
                <ProtectedRoute>
                  <WorkspaceBlogBookmarksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/blog/reports"
              element={
                <ProtectedRoute>
                  <WorkspaceBlogReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/blog/create"
              element={
                <ProtectedRoute>
                  <WorkspaceBlogCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/blog/post/:postId"
              element={
                <ProtectedRoute>
                  <WorkspaceBlogPostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blog/post/:id"
              element={
                <ProtectedRoute>
                  <BlogPostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blog/create"
              element={
                <ProtectedRoute>
                  <BlogCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blog/edit/:id"
              element={
                <ProtectedRoute>
                  <BlogEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blog/bookmarks"
              element={
                <ProtectedRoute>
                  <BlogBookmarksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blog/reports"
              element={
                <AdminRoute>
                  <BlogReportsPage />
                </AdminRoute>
              }
            />

          </Routes>
        </div>
      </div>
    </div>

  );
};

const App: React.FC = () => {
  const [bannedModal, setBannedModal] = useState(false);
  useEffect(() => {
    window.showUserBannedModal = () => setBannedModal(true);
    return () => { window.showUserBannedModal = undefined; };
  }, []);

  useEffect(() => {
    // Add typing animation styles to the document head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = typingAnimationStyles + countdownAnimationStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <AuthChecker>
          <AppContent />
        </AuthChecker>
        <BannedModal open={bannedModal} onClose={() => setBannedModal(false)} />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </ThemeProvider>
  );
};

export default App;
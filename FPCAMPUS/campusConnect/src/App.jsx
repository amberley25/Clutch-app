//import Groups from './pages/Groups';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './services/SupabaseClient';

import LandingPage from './pages/landingpage';
import SignupPage from './pages/signup';
import LoginPage from './pages/login';
import ResetPassword from './pages/ResetPassword';
import HomePage from './pages/Homepage';
import CreateEventPage from './pages/createevent';
import Navbar from './components/NavBar';
import FriendsPage from './pages/FriendsPage';
import NotificationsPage from './pages/NotificationPage';
import SettingsModal from './components/SettingsModal';
import ChatPage from './pages/ChatPage';
import GroupPage from './pages/GroupPage';
import InquiryPage from './pages/InquiryPage';
import UserDashboard from './pages/UserDashboard';

import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/Profilepage';

import ViewDetailsPage from './pages/ViewDetailsPage';

import './App.css';
import './modern.css';



function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState('dark'); // default theme is dark
  const currentUser = session?.user?.id;
  const [currentInquiryId, setCurrentInquiryId] = useState(null);

  useEffect(() => {

    // Apply theme to document body so CSS that targets
    // `body[data-theme="light"]` works. Persist selection.
    const saved = localStorage.getItem('cc_theme');
    if (saved) setTheme(saved);

  }, []);

  useEffect(() => {
    try {
      document.body.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
      localStorage.setItem('cc_theme', theme);
    } catch (e) {
      // ignore in environments without document
    }

  }, [theme]);


  useEffect(() => {

  const loadSessionAndRole = async (session) => {
    setSession(session);

    if (!session) {
      setIsAdmin(false);
      setCurrentPage('landing');
      return;
    }

    const userId = session.user.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    console.log("USER ID:", userId);
    console.log("PROFILE:", profile);

    if (!error && profile) {
      setIsAdmin(profile.role === 'admin');
    }

    setCurrentPage('home');
  };

  // Initial session
  supabase.auth.getSession().then(({ data }) => {
    loadSessionAndRole(data.session);
  });

  // Auth change listener
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    loadSessionAndRole(session);
  });

  return () => listener.subscription.unsubscribe();

}, []);

  const navigate = (page, opts) => {
    if (page === 'inquiry') {
      setCurrentInquiryId(opts?.id || null);
      setCurrentPage('inquiry');
      return;
    }
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setCurrentPage('landing');
  };


  // detect reset password redirect
    const path = window.location.pathname;

    if (path === "/reset-password") {
      return <ResetPassword />;
    }

  // --- Render pages ---
  if (!session && currentPage === 'landing') return <LandingPage onNavigate={setCurrentPage} />;
  if (!session && currentPage === 'signup') return <SignupPage onNavigate={setCurrentPage} />;
  if (!session && currentPage === 'login') return <LoginPage onNavigate={setCurrentPage} />;

  return (
    <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      {/* Hide Navbar on chat and group pages */}
      {currentPage !== 'chats' && currentPage !== 'groups' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={navigate}
          onLogout={handleLogout}
          isAdmin={isAdmin}
          theme={theme}
          onThemeChange={setTheme}
          currentUserId={currentUser}
        />
      )}

      {currentPage === 'home' && (
        <HomePage 
          onNavigate={navigate} 
          isAdmin={isAdmin} 
          currentUser={currentUser}
        />
      )}

      {currentPage === 'profile' && currentUser && (
        <ProfilePage
          currentUser={currentUser}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'create-event' && (
        <CreateEventPage onNavigate={navigate} isAdmin={isAdmin} />
      )}

      {currentPage === 'admin-dashboard' && isAdmin && (
        <AdminDashboard />
      )}

      {currentPage === 'user-dashboard' && isAdmin && (
  <UserDashboard />)}


      {currentPage === 'inquiry' && currentInquiryId && (
        <InquiryPage
          id={currentInquiryId}
          currentUserId={currentUser}
          isAdmin={isAdmin}
          onBack={navigate}
        />
      )}

      {currentPage === 'friends' && !isAdmin && (
        <FriendsPage currentUserId={session.user.id} />
      )}

    {currentPage === 'chats' && (
  <ChatPage
    currentUserId={session.user.id}
    onNavigate={navigate}
  />
)}
   {/* {currentPage === "groups" && (
  <Groups />
)}*/}

      {currentPage === 'groups' && (
        <GroupPage currentUserId={session.user.id} 
         onNavigate={navigate}
         />
      )}

      {currentPage === 'notifications' && (
        <NotificationsPage
          currentUserId={session.user.id}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage.startsWith('event/') && (
        <ViewDetailsPage
          eventId={currentPage.split('/')[1]}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}

export default App;

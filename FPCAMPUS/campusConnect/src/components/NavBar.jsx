import { useEffect, useState } from 'react';
import { supabase } from "../services/SupabaseClient";
import SettingsModal from './SettingsModal';

const Navbar = ({
  currentPage,
  onNavigate,
  onLogout,
  isAdmin,
  theme,
  onThemeChange,
  currentUserId
}) => {

  const [settingsOpen, setSettingsOpen] = useState(false);

  // 🔔 notifications
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // user inquiry (non-admin)
  const [userInquiryOpen, setUserInquiryOpen] = useState(false);
  const [userInquirySubject, setUserInquirySubject] = useState('');
  const [userInquiryMessage, setUserInquiryMessage] = useState('');
  const [userInquirySent, setUserInquirySent] = useState(false);

  // inquiries
  const [showInquiries, setShowInquiries] = useState(false);
  const [inquiries, setInquiries] = useState(() => {
    const data = JSON.parse(localStorage.getItem('inquiries') || 'null');
    if (data && data.length) return data;
    return [];
  });

  /* ================= FETCH NOTIFICATIONS ================= */

  useEffect(() => {
    if (!currentUserId) return;
    fetchNotifications();
  }, [currentUserId]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select(`
          id,
          user_id,
          status,
          profiles:user_id(fullname)
        `)
        .eq("friend_id", currentUserId)
        .eq("status", "pending");

      if (error) {
        console.error("Notification error:", error);
        return;
      }

      setNotifications(data || []);
      setNotificationCount(data?.length || 0);

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= ACCEPT ================= */

 const handleAccept = async (id) => {

  /* get request */

  const { data: request, error: reqError } =
    await supabase

      .from("friends")

      .select("*")

      .eq("id", id)

      .single();

  if (reqError || !request) {
    return;
  }

  /* accept */

  const { error: acceptError } =
    await supabase

      .from("friends")

      .update({
        status: "accepted"
      })

      .eq("id", id);

  if (acceptError) {
    return;
  }

  /* create conversation */

  const { data: convo, error: convoError } =
    await supabase

      .from("conversations")

      .insert({
        created_by: currentUserId,
        is_group: false
      })

      .select()

      .single();

  if (convoError || !convo) {
    return;
  }

  /* add both users */

  await supabase

    .from("conversation_members")

    .insert([

      {
        conversation_id: convo.id,
        user_id: currentUserId
      },

      {
        conversation_id: convo.id,
        user_id: request.user_id
      }

    ]);

  fetchNotifications();
};

  /* ================= REJECT ================= */

  const handleReject = async (id) => {
    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    fetchNotifications();
  };

  /* ================= CLICK OUTSIDE CLOSE ================= */

  useEffect(() => {
    const handler = () => {
      setNotificationsOpen(false);
      setShowInquiries(false);
      setUserInquiryOpen(false);
    };

    if (notificationsOpen || showInquiries || userInquiryOpen) {
      document.addEventListener("click", handler);
    }

    return () => document.removeEventListener("click", handler);
  }, [notificationsOpen, showInquiries, userInquiryOpen]);

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setNotificationsOpen(prev => !prev);
  };

  const togglePanel = (e) => {
    e.stopPropagation();
    setShowInquiries(s => !s);
  };

  const toggleUserInquiry = (e) => {
    e.stopPropagation();
    setUserInquiryOpen(s => !s);
    setUserInquirySent(false);
  };

  useEffect(() => {
    const updateFromStorage = () => {
      const data = JSON.parse(localStorage.getItem('inquiries') || '[]');
      setInquiries(data);
    };

    updateFromStorage();
    window.addEventListener('inquiriesUpdated', updateFromStorage);
    return () => window.removeEventListener('inquiriesUpdated', updateFromStorage);
  }, []);

  const submitUserInquiry = () => {
    const subject = userInquirySubject.trim();
    const message = userInquiryMessage.trim();
    if (!message) return;

    const existing = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const payload = {
      id: Date.now(),
      problem: subject || 'General Inquiry',
      field: 'user-message',
      description: message,
      user: currentUserId || 'anonymous',
      userToken: currentUserId || 'anonymous',
      created_at: new Date().toISOString(),
      messages: [
        {
          id: Date.now() + 1,
          from: 'user',
          text: message,
          time: new Date().toISOString(),
          readByUser: true,
          readByAdmin: false
        }
      ]
    };

    const updated = [payload, ...existing];
    localStorage.setItem('inquiries', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('inquiriesUpdated'));

    setUserInquirySubject('');
    setUserInquiryMessage('');
    setUserInquirySent(true);
  };

  const formatUser = (value) => {
    if (!value) return 'anonymous';
    if (value.length > 12) return `${value.slice(0, 8)}...`;
    return value;
  };


  const sortedInquiries = [...inquiries].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  const userInquiries = !isAdmin && currentUserId
    ? inquiries.filter((item) => item.user === currentUserId)
    : [];

  const userReplyItems = userInquiries
    .map((item) => {
      const replies = (item.messages || []).filter((msg) => msg.from === 'admin');
      if (replies.length === 0) return null;
      const unread = replies.filter((msg) => !msg.readByUser).length;
      return {
        id: item.id,
        problem: item.problem || 'User message',
        latest: replies[replies.length - 1],
        unread
      };
    })
    .filter(Boolean);

  const unreadReplyCount = userReplyItems.reduce((sum, item) => sum + item.unread, 0);

  useEffect(() => {
    if (!notificationsOpen || isAdmin || !currentUserId) return;

    const data = JSON.parse(localStorage.getItem('inquiries') || '[]');
    let changed = false;
    const updated = data.map((item) => {
      if (item.user !== currentUserId || !Array.isArray(item.messages)) return item;

      let touched = false;
      const messages = item.messages.map((msg) => {
        if (msg.from === 'admin' && !msg.readByUser) {
          touched = true;
          return { ...msg, readByUser: true };
        }
        return msg;
      });

      if (touched) {
        changed = true;
        return { ...item, messages };
      }

      return item;
    });

    if (changed) {
      localStorage.setItem('inquiries', JSON.stringify(updated));
      setInquiries(updated);
      window.dispatchEvent(new CustomEvent('inquiriesUpdated'));
    }
  }, [notificationsOpen, isAdmin, currentUserId]);

  /* ================= LINKS ================= */

  const adminLinks = [
  { label: '📅 Events', page: 'home' },

  { label: 'Event Dashboard', page: 'admin-dashboard' },

  { label: '👥 User Dashboard', page: 'user-dashboard' },

  { label: '👤 Profile', page: 'profile' },
];

  const userLinks = [
    { label: 'Events', page: 'home' },
    { label: 'Groups', page: 'groups' },
    { label: 'Friends', page: 'friends' },
    { label: 'Chats', page: 'chats' },
    { label: 'Profile', page: 'profile' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  /* ================= UI ================= */

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* LOGO */}
        <div className="nav-logo" onClick={() => onNavigate('home')}>
          <div className="logo-icon">CC</div>
          <span className="logo-text">CampusConnect</span>
        </div>

        {/* LINKS */}
        <div className="nav-links">
          {links.map(link => (
            <button
              key={link.page}
              className={`nav-link ${currentPage === link.page ? 'active' : ''}`}
              onClick={() => onNavigate(link.page)}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="nav-actions" style={{ position: 'relative' }}>

          {/* 🗨️ USER QUERY */}
          {!isAdmin && (
            <>
              <button className="user-query-btn" onClick={toggleUserInquiry} title="Send a message">
                <svg className="user-query-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3C7.59 3 4 6.14 4 10c0 1.64.71 3.15 1.9 4.36L5 21l4.03-2.1c.9.25 1.86.38 2.97.38 4.41 0 8-3.14 8-7s-3.59-7-8-7zm-3 8.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm3 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm3 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
                </svg>
              </button>

              {userInquiryOpen && (
                <div className="user-query-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="user-query-title">Send a query</div>
                  <input
                    className="user-query-input"
                    type="text"
                    placeholder="Subject (optional)"
                    value={userInquirySubject}
                    onChange={(e) => setUserInquirySubject(e.target.value)}
                  />
                  <textarea
                    className="user-query-textarea"
                    placeholder="Describe your issue"
                    rows={4}
                    value={userInquiryMessage}
                    onChange={(e) => setUserInquiryMessage(e.target.value)}
                  />
                  <div className="user-query-actions">
                    <button className="user-query-send" onClick={submitUserInquiry}>
                      Send
                    </button>
                  </div>
                  {userInquirySent && (
                    <div className="user-query-success">Sent to admin.</div>
                  )}
                </div>
              )}
            </>
          )}

          {/* 🔔 NOTIFICATIONS */}
          <button className="notification-btn" onClick={toggleNotifications}>
            🔔
            {notificationCount > 0 && (
              <span className="notification-badge">
                {notificationCount}
              </span>
            )}
            {!isAdmin && unreadReplyCount > 0 && (
              <span className="query-badge">
                {unreadReplyCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
              {!isAdmin && (
                <>
                  <div className="notification-section-title">Query replies</div>
                  {userReplyItems.length === 0 ? (
                    <div className="notification-empty">No new replies</div>
                  ) : (
                    userReplyItems.map((item) => (
                      <div
                        key={item.id}
                        className="notification-item"
                        onClick={() => {
                          setNotificationsOpen(false);
                          onNavigate('inquiry', { id: item.id });
                        }}
                      >
                        <div className="notification-text">
                          {item.problem}
                        </div>
                        <div className="notification-subtext">
                          {item.latest?.text}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              <div className="notification-section-title">Friend requests</div>
              {notifications.length === 0 ? (
                <div className="notification-empty">No new notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="notification-item">

                    <div className="notification-text">
                      <strong>{n.profiles?.fullname}</strong> sent you a request
                    </div>

                    <div className="notification-actions">

                      <button
                        className="accept-btn"
                        onClick={() => handleAccept(n.id)}
                      >
                        Accept
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() => handleReject(n.id)}
                      >
                        Reject
                      </button>

                    </div>

                  </div>
                ))
              )}

              {/* VIEW ALL */}
              <div
                className="view-all"
                onClick={() => {
                  setNotificationsOpen(false);
                  onNavigate("notifications");
                }}
                style={{
                  textAlign: "center",
                  padding: "8px",
                  cursor: "pointer",
                  borderTop: "1px solid #eee",
                  fontWeight: "bold"
                }}
              >
                View all
              </div>

            </div>
          )}

          {/* 📩 INQUIRIES */}
          {isAdmin && (
            <button className="inquiry-btn" onClick={togglePanel}>
              📨
            </button>
          )}

          {showInquiries && (
            <div className="inquiry-panel" onClick={(e) => e.stopPropagation()}>
              {sortedInquiries.length === 0 && (
                <div className="inquiry-empty">No inquiries yet</div>
              )}
              {sortedInquiries.map(item => (
                <div
                  key={item.id}
                  className="inquiry-item"
                  onClick={() => {
                    setShowInquiries(false);
                    onNavigate('inquiry', { id: item.id });
                  }}
                >
                  <div className="inquiry-title">{item.problem || 'User message'}</div>
                  {item.description && (
                    <div className="inquiry-preview">{item.description}</div>
                  )}
                  <div className="inquiry-meta">
                    Token {item.id}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          <button className="settings-btn" onClick={() => setSettingsOpen(!settingsOpen)}>
            ⚙️
          </button>

        </div>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={onLogout}
        theme={theme}
        onThemeChange={onThemeChange}
      />
    </nav>
  );
};

export default Navbar;
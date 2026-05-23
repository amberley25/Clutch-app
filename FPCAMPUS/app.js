const { useState, useEffect } = React;
const COLLEGE_DOMAIN = 'student.sfit.ac.in';
const ADMIN_EMAIL = 'demo@admin.sfit.ac.in';
const ADMIN_PASSWORD = '123456';

const SignupPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    age: '',
    department: '',
    yearsExperience: '',
    position: '',
    phoneNumber: '',
    address: '',
    dob: '',
    adminId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const emailDomain = formData.email.split('@')[1];
    
    if (emailDomain !== COLLEGE_DOMAIN) {
      setError(`Only ${COLLEGE_DOMAIN} emails allowed`);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = formData.email.split('@')[0];
    
    if (users[username]) {
      setError('User already exists');
      return;
    }
    
    users[username] = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      verified: true,
      profile: { 
        branch: '', 
        year: '', 
        skills: [], 
        bio: '',
        age: formData.age,
        department: formData.department,
        yearsExperience: formData.yearsExperience,
        position: formData.position,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dob: formData.dob,
        adminId: formData.adminId,
        version: '1.0'
      }
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    setSuccess('Account created! Redirecting...');
    setTimeout(() => onNavigate('login'), 1500);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-badge">🏆</div>
            <h1>Join the Squad</h1>
            <p>Connect with teammates for hackathons & competitions</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>👤 Full Name</label>
              <input 
                type="text" 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                placeholder="John Doe" 
                required 
              />
            </div>
            <div className="form-group">
              <label>📧 Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder={`john.doe@${COLLEGE_DOMAIN}`}
                required 
              />
              <span className="input-hint">Only @{COLLEGE_DOMAIN} allowed</span>
            </div>
            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label>📅 Age</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="20"
                  min="18"
                />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>🎂 Date of Birth</label>
                <input 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label>🏢 Department</label>
                <input 
                  type="text" 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Computer Science"
                />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>💼 Position</label>
                <input 
                  type="text" 
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="Student / Developer"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label>⏱️ Years of Experience</label>
                <input 
                  type="number" 
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>📞 Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
            </div>
            <div className="form-group">
              <label> Password</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                required 
              />
            </div>
            <div className="form-group">
              <label>🔐 Confirm Password</label>
              <input 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
                required 
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button type="submit" className="btn-primary">Create Account</button>
          </form>
          <div className="auth-footer">
            Already have an account?{' '}
            <button onClick={() => onNavigate('login')} className="link-btn">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Check if admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      onLogin('admin', true);
      return;
    }
    
    // Student login
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = email.split('@')[0];
    const user = users[username];

    if (!user) {
      setError('User not found');
      return;
    }
    
    if (user.password !== password) {
      setError('Invalid password');
      return;
    }

    onLogin(username, false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-badge">🏆</div>
            <h1>Welcome Back</h1>
            <p>Continue your journey to success</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>✉️ Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your.email@student.sfit.ac.in"
                required 
              />
              <span className="input-hint">Use college email or admin login</span>
            </div>
            <div className="form-group">
              <label>🔒 Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-primary">Login</button>
          </form>
          <div className="auth-footer">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('signup')} className="link-btn">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ onNavigate, isAdmin }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Load events from localStorage or use default events
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      const defaultEvents = [
        { 
          id: 1, 
          name: 'HackFest 2026', 
          date: '2026-02-15', 
          category: 'Hackathon', 
          description: '24-hour coding marathon',
          participants: 150 
        },
        { 
          id: 2, 
          name: 'TechTalk Series', 
          date: '2026-02-20', 
          category: 'Technical',
          description: 'Guest lecture on AI/ML', 
          participants: 80 
        },
        { 
          id: 3, 
          name: 'Innovation Challenge', 
          date: '2026-03-01', 
          category: 'Competition',
          description: 'Solve real-world problems', 
          participants: 120 
        },
        { 
          id: 4, 
          name: 'CodeSprint', 
          date: '2026-03-10', 
          category: 'Hackathon',
          description: 'Speed coding competition', 
          participants: 200 
        }
      ];
      localStorage.setItem('events', JSON.stringify(defaultEvents));
      setEvents(defaultEvents);
    }
  }, []);

  return (
    <div>
      {!isAdmin && (
        <div className="hero-section">
          <div>
            <h1 className="hero-title">
              Find Your <span className="highlight">Dream Team</span>
            </h1>
            <p className="hero-subtitle">
              Connect with talented students for hackathons, competitions, and events
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => onNavigate('groups')}>
                ➕ Create Group
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('search')}>
                🔍 Find Teammates
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <span className="icon">🏆</span>
              <span>Hackathons</span>
            </div>
            <div className="floating-card card-2">
              <span className="icon">⚡</span>
              <span>Competitions</span>
            </div>
            <div className="floating-card card-3">
              <span className="icon">👥</span>
              <span>Team Building</span>
            </div>
          </div>
        </div>
      )}

      <section>
        <div className="section-header">
          <h2>Intra-College Events</h2>
          <p>Upcoming events happening at our campus</p>
          {isAdmin && (
            <button 
              className="btn-primary" 
              onClick={() => onNavigate('create-event')}
              style={{ marginTop: '1rem' }}
            >
              ➕ Create New Event
            </button>
          )}
        </div>
        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <span className={`event-category ${event.category.toLowerCase()}`}>
                  {event.category}
                </span>
                <span className="event-participants">
                  👥 {event.participants}
                </span>
              </div>
              <h3 className="event-name">{event.name}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-footer">
                <span className="event-date">
                  📅 {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <button className="btn-view">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {!isAdmin && (
        <section>
          <div className="inter-college-card">
            <h2>Inter-College Opportunities</h2>
            <p>Discover hackathons and competitions happening across the country</p>
            <a 
              href="https://unstop.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-unstop"
            >
              Explore on Unstop 🔗
            </a>
          </div>
        </section>
      )}
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, onLogout, theme, onThemeChange }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={onClose}></div>
      <div className="settings-modal">
        <div className="settings-header">
          <h3>⚙️ Settings</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="settings-content">
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-icon">🎨</span>
              <h4>Theme</h4>
            </div>
            <div className="theme-toggle">
              <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => onThemeChange('light')}
              >
                ☀️ Light
              </button>
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => onThemeChange('dark')}
              >
                🌙 Dark
              </button>
            </div>
          </div>
          <div className="settings-divider"></div>
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-icon">📦</span>
              <h4>System Information</h4>
            </div>
            <div className="system-info">
              <div className="info-label">LATEST WEBSITE VERSION</div>
              <div className="info-value">2.0</div>
            </div>
          </div>
          <div className="settings-divider"></div>
          <div className="settings-item">
            <button className="settings-logout-btn" onClick={onLogout}>
              <span className="settings-icon">🚪</span>
              <h4>Logout</h4>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Navbar = ({ currentPage, onNavigate, onLogout, isAdmin, theme, onThemeChange }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showInquiries, setShowInquiries] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [inquiries, setInquiries] = useState(() => {
    const data = JSON.parse(localStorage.getItem('inquiries') || 'null');
    if (data && data.length) return data;
    const sample = [
      { id: 1, problem: 'Form validation error', field: 'email', description: 'College email domain rejected for valid address', user: 'alice' },
      { id: 2, problem: 'UI overlap', field: 'navbar', description: 'Icons overlap on smaller screens under 480px', user: 'bob' },
      { id: 3, problem: 'Event creation bug', field: 'create-event', description: 'Selected date not saved when time zone is different', user: 'carol' }
    ];
    localStorage.setItem('inquiries', JSON.stringify(sample));
    return sample;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const data = JSON.parse(localStorage.getItem('inquiries') || '[]');
      setInquiries(data);
    };
    window.addEventListener('inquiriesUpdated', handleUpdate);
    return () => window.removeEventListener('inquiriesUpdated', handleUpdate);
  }, []);

  const togglePanel = (e) => {
    e && e.stopPropagation();
    setShowInquiries(s => !s);
  };

  useEffect(() => {
    const handler = () => setShowInquiries(false);
    if (showInquiries) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showInquiries]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => onNavigate('home')}>
          <div className="logo-icon">🏆</div>
          <span className="logo-text">CampusConnect</span>
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            📅 Events
          </button>
          <button 
            className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => onNavigate('profile')}
          >
            👤 Profile
          </button>
        </div>
        <div className="nav-actions" style={{ position: 'relative' }}>
          <button className="notification-btn">
            🔔
            <span className="notification-badge">3</span>
          </button>

          <button className="inquiry-btn" onClick={togglePanel} title="User inquiries">
            <svg className="inquiry-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 1C7.03 1 3 5.03 3 10v3a3 3 0 003 3h1v-6H6v-1c0-3.86 3.14-7 7-7s7 3.14 7 7v1h-1v6h1a3 3 0 003-3v-3c0-4.97-4.03-9-9-9z" fill="currentColor"/>
              <path d="M6 14v3a1 1 0 001 1h1v-5H6z" fill="currentColor"/>
              <path d="M18 14v3a1 1 0 01-1 1h-1v-5h2z" fill="currentColor"/>
            </svg>
          </button>

          {showInquiries && (
            <div className="inquiry-panel" onClick={(e) => e.stopPropagation()}>
              {inquiries.length === 0 && (
                <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No reports</div>
              )}
              {inquiries.map(item => (
                <div key={item.id} className="inquiry-item" onClick={() => { setShowInquiries(false); onNavigate('inquiry', { id: item.id }); }}>
                  <div className="inquiry-title">{item.problem}</div>
                  <div className="inquiry-meta">{item.field} • reported by {item.user}</div>
                </div>
              ))}
            </div>
          )}

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

const ProfilePage = ({ currentUser, isAdmin, onLogout }) => {
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem('users') || '{}'));
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const refreshUsers = JSON.parse(localStorage.getItem('users') || '{}');
    // Initialize admin user data if it doesn't exist
    if (isAdmin && !refreshUsers[currentUser]) {
      refreshUsers[currentUser] = {
        fullName: 'Admin User',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        verified: true,
        profile: {
          branch: '',
          year: '',
          skills: [],
          bio: '',
          age: '',
          department: 'Administration',
          yearsExperience: '',
          position: 'Administrator',
          phoneNumber: '',
          address: '',
          dob: '',
          adminId: 'ADMIN-001',
          avatar: '👨‍💼',
          version: '1.0'
        }
      };
      localStorage.setItem('users', JSON.stringify(refreshUsers));
    }
    setUsers(refreshUsers);
  }, [currentUser, isAdmin]);

  const userData = users[currentUser];

  const handleEditClick = () => {
    if (userData) {
      setEditData({
        fullName: userData.fullName,
        email: userData.email,
        age: userData.profile.age || '',
        department: userData.profile.department || '',
        yearsExperience: userData.profile.yearsExperience || '',
        position: userData.profile.position || '',
        phoneNumber: userData.profile.phoneNumber || '',
        address: userData.profile.address || '',
        dob: userData.profile.dob || '',
        adminId: userData.profile.adminId || '',
        avatar: userData.profile.avatar || (isAdmin ? '👨‍💼' : '👤')
      });
      setEditMode(true);
    }
  };

  const handleSaveEdit = () => {
    if (editData) {
      const updatedUsers = { ...users };
      updatedUsers[currentUser] = {
        ...userData,
        fullName: editData.fullName,
        email: editData.email,
        profile: {
          ...userData.profile,
          age: editData.age,
          department: editData.department,
          yearsExperience: editData.yearsExperience,
          position: editData.position,
          phoneNumber: editData.phoneNumber,
          address: editData.address,
          dob: editData.dob,
          adminId: editData.adminId,
          avatar: editData.avatar
        }
      };
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setEditMode(false);
      setEditData(null);
    }
  };

  const handleDeleteProfile = () => {
    const updatedUsers = { ...users };
    delete updatedUsers[currentUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    onLogout();
  };

  const webVersion = '2.0';

  return (
    <div>
      <div className="page-header">
        <h1>👤 Profile</h1>
        {!isAdmin && <p>Manage your account information</p>}
      </div>

      {editMode ? (
        <div className="profile-edit-container">
          <div className="profile-edit-form">
            <h2>✏️ Edit Profile</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="form-group">
                <label>📷 Avatar Emoji</label>
                <input 
                  type="text" 
                  value={editData.avatar}
                  onChange={(e) => setEditData({...editData, avatar: e.target.value})}
                  placeholder="Enter an emoji (e.g., 👨‍💼, 👩‍💼, 🧑‍💻, 👤)"
                  maxLength="10"
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                  <label>👤 Full Name</label>
                  <input 
                    type="text" 
                    value={editData.fullName}
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>📧 Email</label>
                  <input 
                    type="email" 
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    required
                    disabled={isAdmin}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                  <label>📅 Age</label>
                  <input 
                    type="number" 
                    value={editData.age}
                    onChange={(e) => setEditData({...editData, age: e.target.value})}
                    min="18"
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>🎂 Date of Birth</label>
                  <input 
                    type="date" 
                    value={editData.dob}
                    onChange={(e) => setEditData({...editData, dob: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                  <label>🏢 Department</label>
                  <input 
                    type="text" 
                    value={editData.department}
                    onChange={(e) => setEditData({...editData, department: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>💼 Position</label>
                  <input 
                    type="text" 
                    value={editData.position}
                    onChange={(e) => setEditData({...editData, position: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                  <label>⏱️ Years of Experience</label>
                  <input 
                    type="number" 
                    value={editData.yearsExperience}
                    onChange={(e) => setEditData({...editData, yearsExperience: e.target.value})}
                    min="0"
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>📞 Phone Number</label>
                  <input 
                    type="tel" 
                    value={editData.phoneNumber}
                    onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="form-group">
                  <label>🆔 Admin ID</label>
                  <input 
                    type="text" 
                    value={editData.adminId}
                    onChange={(e) => setEditData({...editData, adminId: e.target.value})}
                    disabled
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  ✅ Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => { setEditMode(false); setEditData(null); }}
                  style={{ flex: 1 }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="profile-container">
          <div className="profile-header-card">
            <div className="profile-avatar">
              {userData?.profile?.avatar || (isAdmin ? '👨‍💼' : '👤')}
            </div>
            <div className="profile-header-info">
              <h2>{isAdmin ? 'Admin Account' : userData?.fullName || 'User'}</h2>
              {!isAdmin && <p className="profile-email">{userData?.email || ''}</p>}
              {isAdmin ? (
                <div className="admin-info-inline">
                  <span className="admin-id">🆔 {userData?.profile?.adminId || 'ADMIN-001'}</span>
                  <span className="status-badge active">Active</span>
                </div>
              ) : null}
            </div>
            <div className="profile-header-actions">
              <button className="btn-edit" onClick={handleEditClick}>
                ✏️ Edit Profile
              </button>
              {!isAdmin && (
                <button className="btn-delete" onClick={() => setShowDeleteConfirm(true)}>
                  🗑️ Delete Profile
                </button>
              )}
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="delete-confirm-modal">
              <div className="modal-content">
                <h3>⚠️ Delete Profile</h3>
                <p>Are you sure you want to permanently delete your profile? This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn-delete" 
                    onClick={handleDeleteProfile}
                    style={{ flex: 1 }}
                  >
                    Yes, Delete
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="profile-details">
            <div className="profile-section">
              <h3>📋 Basic Information</h3>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>👤 Full Name</label>
                  <p>{userData?.fullName || isAdmin ? ADMIN_EMAIL.split('@')[0] : 'N/A'}</p>
                </div>
                <div className="profile-field">
                  <label>📧 Email Address</label>
                  <p>{isAdmin ? ADMIN_EMAIL : userData?.email || 'N/A'}</p>
                </div>
                <div className="profile-field">
                  <label>📅 Age</label>
                  <p>{userData?.profile?.age || 'N/A'}</p>
                </div>
                <div className="profile-field">
                  <label>🎂 Date of Birth</label>
                  <p>{userData?.profile?.dob ? new Date(userData.profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>💼 Professional Information</h3>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>🏢 Department</label>
                  <p>{userData?.profile?.department || 'N/A'}</p>
                </div>
                <div className="profile-field">
                  <label>💼 Position</label>
                  <p>{userData?.profile?.position || 'N/A'}</p>
                </div>
                <div className="profile-field">
                  <label>⏱️ Years of Experience</label>
                  <p>{userData?.profile?.yearsExperience || '0'} years</p>
                </div>
                <div className="profile-field">
                  <label>📞 Phone Number</label>
                  <p>{userData?.profile?.phoneNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InquiryPage = ({ id, onBack }) => {
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const found = data.find(i => i.id === id);
    if (found) {
      // ensure messages array exists
      found.messages = found.messages || [];
      setInquiry(found);
      setMessages(found.messages);
    } else {
      setInquiry(null);
    }
    setLoading(false);
  }, [id]);

  const persistMessages = (newMessages) => {
    const data = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const updated = data.map(i => i.id === id ? { ...i, messages: newMessages } : i);
    localStorage.setItem('inquiries', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('inquiriesUpdated'));
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg = { id: Date.now(), from: 'admin', text: text.trim(), time: new Date().toISOString() };
    const newMessages = [...messages, msg];
    setMessages(newMessages);
    setText('');
    persistMessages(newMessages);
  };

  const markResolved = () => {
    const data = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const remaining = data.filter(i => i.id !== id);
    localStorage.setItem('inquiries', JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('inquiriesUpdated'));
    onBack('home');
  };

  const checkProblem = () => {
    const data = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const updated = data.map(i => i.id === id ? { ...i, checked: true } : i);
    localStorage.setItem('inquiries', JSON.stringify(updated));
    setInquiry(prev => prev ? { ...prev, checked: true } : prev);
    window.dispatchEvent(new CustomEvent('inquiriesUpdated'));
  };

  if (loading) return <div>Loading...</div>;
  if (!inquiry) return (
    <div>
      <div className="page-header">
        <h1>Report Not Found</h1>
      </div>
      <div className="empty-state">
        <p>That report could not be located.</p>
        <button className="btn-primary" onClick={() => onBack('home')}>Go back</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Chat with {inquiry.user}</h1>
        <p className="chat-subtitle">Resolve issues by communicating directly with the reporting user</p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{inquiry.problem}</div>
          <div className="chat-subtitle">field: {inquiry.field}</div>
        </div>

        <div className="chat-window">
          <div className="chat-messages">
            {messages.map(m => (
              <div key={m.id} className={`chat-message ${m.from === 'admin' ? 'admin' : 'user'}`}>
                <div>{m.text}</div>
                <div className="chat-meta">{m.from} • {new Date(m.time).toLocaleString()}</div>
              </div>
            ))}
            {messages.length === 0 && (
              <div style={{ color: 'var(--text-secondary)' }}>No messages yet — start the conversation.</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn-primary" onClick={markResolved}>✅ Resolve</button>
            <button className="btn-secondary" onClick={checkProblem}>🔎 Check Problem</button>
          </div>
          <button className="link-btn" onClick={() => onBack('home')} style={{ marginLeft: 'auto' }}>Back</button>
        </div>

        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder={`Message ${inquiry.user}...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          />
          <button className="chat-send-btn" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

const CreateEventPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    category: 'Hackathon',
    description: '',
    participants: 0
  });
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const newEvent = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      ...formData,
      participants: parseInt(formData.participants)
    };
    
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    
    setSuccess('Event created successfully!');
    setTimeout(() => {
      onNavigate('home');
    }, 1500);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Create Intra-College Event</h1>
        <p>Add a new event for students to participate in</p>
      </div>
      <div className="auth-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>📌 Event Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="HackFest 2026"
              required
            />
          </div>
          <div className="form-group">
            <label>📅 Event Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>🏷️ Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="Hackathon">Hackathon</option>
              <option value="Technical">Technical</option>
              <option value="Competition">Competition</option>
            </select>
          </div>
          <div className="form-group">
            <label>📝 Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the event"
              rows="3"
              required
            />
          </div>
          <div className="form-group">
            <label>👥 Expected Participants</label>
            <input
              type="number"
              value={formData.participants}
              onChange={(e) => setFormData({...formData, participants: e.target.value})}
              placeholder="100"
              min="0"
              required
            />
          </div>
          {success && <div className="success-message">{success}</div>}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              ✅ Create Event
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => onNavigate('home')}
              style={{ flex: 1 }}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [currentInquiryId, setCurrentInquiryId] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('currentUser');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    if (loggedIn) {
      setCurrentUser(loggedIn);
      setIsAdmin(adminStatus);
      setCurrentPage('home');
    }
  }, []);

  const handleLogin = (username, adminStatus) => {
    localStorage.setItem('currentUser', username);
    localStorage.setItem('isAdmin', adminStatus.toString());
    setCurrentUser(username);
    setIsAdmin(adminStatus);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    setCurrentUser(null);
    setIsAdmin(false);
    setCurrentPage('login');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  if (!currentUser && currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} />;
  }

  if (!currentUser && currentPage === 'signup') {
    return <SignupPage onNavigate={setCurrentPage} />;
  }

  const navigate = (page, opts) => {
    if (page === 'inquiry') {
      setCurrentInquiryId(opts?.id || null);
      setCurrentPage('inquiry');
      return;
    }
    setCurrentPage(page);
  };

  return (
    <div>
      <Navbar 
        currentPage={currentPage} 
        onNavigate={navigate} 
        onLogout={handleLogout}
        isAdmin={isAdmin}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
      <main className="main-content">
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} isAdmin={isAdmin} />}
        {currentPage === 'profile' && <ProfilePage currentUser={currentUser} isAdmin={isAdmin} onLogout={handleLogout} />}
        {currentPage === 'create-event' && isAdmin && <CreateEventPage onNavigate={navigate} />}
        {currentPage === 'inquiry' && currentInquiryId && <InquiryPage id={currentInquiryId} onBack={navigate} />}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

const SettingsModal = ({ isOpen, onClose, onLogout, theme, onThemeChange }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={onClose}></div>
      <div className="settings-modal">
        <div className="settings-header">
          <h3>Settings</h3>
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
                Light
              </button>
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => onThemeChange('dark')}
              >
                Dark
              </button>
            </div>
          </div>
          <div className="settings-divider"></div>
          {/* System Information removed as requested */}
          <div className="settings-item">
            <button className="settings-logout-btn" onClick={onLogout}>
              <span className="settings-icon"></span>
              <h4>Logout</h4>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default SettingsModal;
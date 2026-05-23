
import '../App.css';

const LandingPage = ({ onNavigate }) => {
  const features = [
    { icon:'📅', title:'Campus Events', desc:'Browse, register & track all intra-college events in one place — from hackathons to cultural fests.' },
    { icon:'🔍', title:'Find Teammates', desc:'Search by department, year, skills and gender to build your perfect team for any competition.' },
    { icon:'👥', title:'Group Management', desc:'Create groups, add teammates and collaborate efficiently with your squad across multiple events.' },
    { icon:'❤️', title:'Friend Network', desc:'Send friend requests, grow your campus network and stay connected with people who inspire you.' },
    { icon:'�', title:'Inter-College', desc:'Discover opportunities beyond campus — explore hackathons and competitions from Unstop and more.' },
    { icon:'📢', title:'Real-time Alerts', desc:'Never miss a deadline — get instant notifications for registrations, requests and group activity.' },
  ];

  return (
    <div className="landing">
      <nav className="land-nav">
        <div className="land-nav-logo">
          <div className="logo-box">CC</div>
          <span className="logo-text">CampusConnect</span>
        </div>
        <div className="land-nav-links">
          <button className="btn btn-g btn-sm" onClick={() => onNavigate('login')}>Sign In</button>
          <button className="btn btn-p btn-sm" onClick={() => onNavigate('signup')}>Get Started</button>
        </div>
      </nav>

      <div className="hero">
        <div style={{animation:'fadeUp .7s ease'}}>
          <div className="hero-badge">SFIT College Platform</div>
          <h1>Find Your<br/><span className="hl">Dream Team,</span><br/><span className="hl2">Win Together</span></h1>
          <p className="hero-sub">Connect with talented students for hackathons, competitions and campus events. Build your network, showcase skills, and collaborate like never before.</p>
          <div className="hero-btns">
            <button className="btn btn-p" style={{padding:'13px 28px',fontSize:15}} onClick={() => onNavigate('signup')}>
              Join CampusConnect
            </button>
            <button className="btn btn-g" style={{padding:'13px 24px',fontSize:15}} onClick={() => onNavigate('login')}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="features-title">
          <h2>Everything You Need</h2>
          <p>Built for students, by students — one platform to rule your campus life</p>
        </div>
        <div className="feat-grid">
          {features.map((f,i) => (
            <div key={i} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
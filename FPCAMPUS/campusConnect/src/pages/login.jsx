import { useState } from "react";
import { supabase } from "../services/SupabaseClient";

const LoginPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

const resendVerification = async () => {
  setError("");

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: formData.email
  });

  if (error) {
    setError(error.message);
  } else {
    setError("Verification email sent. Please check your inbox.");
  }
};
const sendResetEmail = async () => {

  if (!formData.email) {
    setError("Please enter your email first.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.email,
    {
      redirectTo: window.location.origin + "/reset-password"
    }
  );

  if (error) {
    setError(error.message);
  } else {
    setError("Password reset email sent. Check your inbox.");
  }
};

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (error) {
      setError(error.message);
      return;
    }

            // fetch profile
            const meta = data.user.user_metadata;

         const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
            id: data.user.id,
            fullname: meta.fullname,
            age: meta.age,
            DEPT: meta.department,
            year: meta.year,
            role: "user"
        });

        if (profileError) {
        setError(profileError.message);
        return;
}
        

    // Redirect handled by auth listener in App.jsx
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-badge">🏆</div>
            <h1>Welcome Back</h1>
            <p>Login to continue</p>
          </div>
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>📧 Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required
              />
            </div>
            <div className="form-group">
              <label>🔑 Password</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-primary">
                    Login
                    </button>

                    <button
                    type="button"
                    onClick={sendResetEmail}
                    className="link-btn"
                    >
                    Forgot Password?
                    </button>

                    <button
                    type="button"
                    onClick={resendVerification}
                    className="link-btn"
                    disabled={!formData.email} // change color when not disabled... do  this 
                    >
                    Resend verification email
            </button>
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

export default LoginPage;
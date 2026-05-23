import { useState } from "react";
import { supabase } from "../services/SupabaseClient";

const COLLEGE_DOMAIN = "student.sfit.ac.in";

const SignupPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    age: '',
    department: '',
    year: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Check email domain
    const emailDomain = formData.email?.split("@")[1]?.toLowerCase();
    if (emailDomain !== COLLEGE_DOMAIN) {
      setError(`Only ${COLLEGE_DOMAIN} emails allowed`);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Sign up user with email verification
            const { data, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
            emailRedirectTo: window.location.origin + "/login#", // *** chk the redirect 
            data: {
            fullname: formData.fullName,
            age: formData.age,
            department: formData.department,
            year: formData.year
            }
          }
        });

      if (authError) throw authError;
      if (!data?.user?.id) throw new Error("Signup failed: User ID not returned.");
/*
      // 2️⃣ Insert into profiles table with default role "user"
      const profileData = {
        id: data.user.id,
        fullname: formData.fullName,
        DEPT:formData.department,
        role: "user"
      };*/

      // Only add student fields if filled
     /* if (formData.age) profileData.age = formData.age;
      if (formData.department) profileData.DEPT = formData.department;
      if (formData.year) profileData.year = formData.year;

      /*const { error: profileError } = await supabase.from("profiles").insert([profileData]);
      if (profileError) throw profileErro; */

      setSuccess("Account created! Check your email to verify your account.");
      setFormData({
        fullName: '', email: '', password: '', confirmPassword: '', age: '', department: '', year: ''
      });

    } /*catch (err) {
      setError(err.message || "Something went wrong!");
    } */
     catch (err) {
     console.log("Signup Error:", err);   // 👈 prints real error in console
      setError(err.message || JSON.stringify(err));
}
finally {
      setLoading(false);
    }
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
            </div>
            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label>📅 Age (Optional)</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="20"
                  min="18"
                />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>🏢 Department (Optional)</label>
                <input 
                  type="text" 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="CMPN"
                />
              </div>
            </div>
            <div className="form-group">
              <label>⏱️ Year (Optional)</label>
              <input 
                type="text" 
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                placeholder="FE"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>🔑 Password</label>
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
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
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

export default SignupPage;
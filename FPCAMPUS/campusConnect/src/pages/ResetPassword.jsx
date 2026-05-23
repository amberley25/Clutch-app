import { useState } from "react";
import { supabase } from "../services/SupabaseClient";

const ResetPassword = () => {

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const updatePassword = async () => {

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully.");
    }
  };

  return (
    <div>
      <h2>Set New Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={updatePassword}>
        Update Password
      </button>

      <p>{message}</p>
    </div>
  );
};

export default ResetPassword;
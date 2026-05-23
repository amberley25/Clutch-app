import { useEffect, useState } from "react";
import { supabase } from "../services/SupabaseClient";

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error.message);
      setLoading(false);
      return;
    }

    setUsers(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }

    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  if (loading) {
    return (
      <div style={loadingContainer}>
        <div style={loader}></div>
        <h2 style={{ color: "#fff" }}>Loading Users...</h2>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={headerSection}>
        <h1 style={title}>User Dashboard</h1>

        <p style={subtitle}>
          Manage all registered users
        </p>
      </div>

      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Name</th>
             {/* <th style={th}>Email</th>*/}
              <th style={th}>Branch</th>
              <th style={th}>Year</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    background:
                      index % 2 === 0
                        ? "rgba(255,255,255,0.03)"
                        : "transparent",
                  }}
                >
                  <td style={td}>
                    {user.fullname || "-"}
                  </td>

                 {/*} <td style={td}>
                    {user.email || "-"}
                  </td>*/}

                  <td style={td}>
                    {user.branch || "-"}
                  </td>

                  <td style={td}>
                    {user.year || "-"}
                  </td>

                  <td style={td}>
                    <button
                      style={deleteBtn}
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#999",
                  }}
                >
                  No Users Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const page = {
  minHeight: "100vh",
  background: "#0f172a",
  padding: "40px",
  fontFamily: "Arial, sans-serif",
};

const headerSection = {
  marginBottom: "30px",
};

const title = {
  color: "white",
  fontSize: "38px",
  marginBottom: "10px",
};

const subtitle = {
  color: "#94a3b8",
  fontSize: "16px",
};

const tableContainer = {
  background: "#111827",
  borderRadius: "18px",
  overflowX: "auto",
  boxShadow: "0 0 25px rgba(0,0,0,0.4)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: "18px",
  textAlign: "left",
  color: "#cbd5e1",
  fontSize: "14px",
  background: "#1e293b",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const td = {
  padding: "18px",
  color: "#f1f5f9",
  fontSize: "14px",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
};

const deleteBtn = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "8px",
  background: "#dc2626",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const loadingContainer = {
  height: "100vh",
  background: "#0f172a",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};

const loader = {
  width: "50px",
  height: "50px",
  border: "5px solid #334155",
  borderTop: "5px solid white",
  borderRadius: "50%",
  marginBottom: "20px",
  animation: "spin 1s linear infinite",
};

export default UserDashboard;
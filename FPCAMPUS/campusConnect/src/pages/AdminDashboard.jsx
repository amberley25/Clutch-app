import { useEffect, useState } from "react";
import { supabase } from "../services/SupabaseClient";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check initial theme
    const theme = document.body.getAttribute('data-theme');
    setIsDarkMode(theme !== 'light');

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const newTheme = document.body.getAttribute('data-theme');
      setIsDarkMode(newTheme !== 'light');
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    fetchEvents();
    return () => observer.disconnect();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error.message);
      setLoading(false);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }

    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  if (loading) {
    return (
      <div style={{
        ...loadingContainer,
        background: isDarkMode ? "#0f172a" : "#F5F7FA"
      }}>
        <div style={{
          ...loader,
          border: isDarkMode ? "5px solid #334155" : "5px solid #E5E7EB",
          borderTop: isDarkMode ? "5px solid white" : "5px solid #2563eb"
        }}></div>
        <h2 style={{ color: isDarkMode ? "#fff" : "#1A1A2E" }}>Loading Events...</h2>
      </div>
    );
  }

  return (
    <div style={{
      ...page,
      background: isDarkMode ? "#0f172a" : "#F5F7FA",
      color: isDarkMode ? "#fff" : "#1A1A2E"
    }}>
      <div style={headerSection}>
        <h1 style={{
          ...title,
          color: isDarkMode ? "white" : "#1A1A2E"
        }}>Admin Dashboard</h1>
        <p style={{
          ...subtitle,
          color: isDarkMode ? "#94a3b8" : "#718096"
        }}>
          Manage all event records from the system
        </p>
      </div>

      <div style={{
        ...tableContainer,
        background: isDarkMode ? "#111827" : "#FFFFFF",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
      }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Title</th>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Category</th>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Type</th>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Branch</th>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Year</th>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Event Date</th>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Last Registration</th>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Visibility</th>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Wishlist</th>
              <th style={{
                ...th,
                background: isDarkMode ? "#1e293b" : "#F5F7FA",
                color: isDarkMode ? "#cbd5e1" : "#1A1A2E",
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
              }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.length > 0 ? (
              events.map((event, index) => (
                <tr
                  key={event.id}
                  style={{
                    background:isDarkMode
                      ? (index % 2 === 0
                        ? "rgba(255,255,255,0.03)"
                        : "transparent")
                      : (index % 2 === 0
                        ? "#FBFCFD"
                        : "#FFFFFF"),
                    transition: "0.3s",
                  }}
                >
                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                    <div style={{
                      ...eventTitle,
                      color: isDarkMode ? "#fff" : "#1A1A2E"
                    }}>{event.name}</div>
                    <div style={{
                      ...eventDesc,
                      color: isDarkMode ? "#94a3b8" : "#718096"
                    }}>
                      {event.description || "No description"}
                    </div>
                  </td>

                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                    <span style={{
                      ...categoryBadge,
                      background: isDarkMode ? "#312e81" : "#E8E6F8",
                      color: isDarkMode ? "#c7d2fe" : "#4C1D95"
                    }}>
                      {event.category}
                    </span>
                  </td>

                  {/* TYPE connected properly */}
                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                    <span style={{
                      ...typeBadge,
                      background: isDarkMode ? "#164e63" : "#E0F2FE",
                      color: isDarkMode ? "#a5f3fc" : "#0369A1"
                    }}>
                      {event.TYPE || "-"}
                    </span>
                  </td>

                  {/* target_branch connected */}
                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                    {event.target_branch || "-"}
                  </td>

                  {/* target_year connected */}
                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                    {event.target_year || "-"}
                  </td>

                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                    {event.event_date
                      ? new Date(event.event_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                    {event.last_registration_date
                      ? new Date(
                          event.last_registration_date
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                    <span
                      style={{
                        ...visibilityBadge,
                        background: isDarkMode
                          ? (event.visibility === "public" ? "#14532d" : "#4b5563")
                          : (event.visibility === "public" ? "#D1FAE5" : "#E5E7EB"),
                        color: isDarkMode
                          ? "white"
                          : (event.visibility === "public" ? "#065F46" : "#374151")
                      }}
                    >
                      {event.visibility}
                    </span>
                  </td>

                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                     {event.wishlist_count}
                  </td>

                  <td style={{
                    ...td,
                    color: isDarkMode ? "#f1f5f9" : "#1A1A2E",
                    borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)"
                  }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        style={{
                          ...editBtn,
                          background: isDarkMode ? "#2563eb" : "#2563eb"
                        }}
                        onClick={() =>
                          alert("Edit Event: " + event.id)
                        }
                      >
                        Edit
                      </button>

                      <button
                        style={{
                          ...deleteBtn,
                          background: isDarkMode ? "#ef4444" : "#ef4444"
                        }}
                        onClick={() => handleDelete(event.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: isDarkMode ? "#999" : "#718096"
                  }}
                >
                  No Events Found
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

const eventTitle = {
  fontWeight: "bold",
  marginBottom: "6px",
  color: "#fff",
};

const eventDesc = {
  fontSize: "12px",
  color: "#94a3b8",
  maxWidth: "250px",
};

const categoryBadge = {
  background: "#312e81",
  color: "#c7d2fe",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "12px",
};

const typeBadge = {
  background: "#164e63",
  color: "#a5f3fc",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "12px",
};

const visibilityBadge = {
  padding: "6px 12px",
  borderRadius: "20px",
  color: "white",
  fontSize: "12px",
  textTransform: "capitalize",
};

const editBtn = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
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

export default AdminDashboard;
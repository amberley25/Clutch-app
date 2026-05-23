import { useState } from "react";
import { supabase } from "../services/SupabaseClient";

const branches = [
  "ALL",
  "CMPN",
  "IT",
  "ECS",
  "MECH",
  "ELECTRICAL",
];

const years = [
  "ALL",
  "FE",
  "SE",
  "TE",
  "BE",
];

const eventTypes = [
  "Webinar",
  "Workshop",
  "Hackathon",
  "Sports",
  "Cultural",
  "Training Program",
  "Other",
];

const CreateEventPage = ({ onNavigate, isAdmin }) => {

  const todayStr = new Date().toISOString().split("T")[0];

  const [customType, setCustomType] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: isAdmin ? "intra" : "personal",

    // NEW FIELDS
    TYPE: "",
    target_branch: "",
    target_year: "",

    description: "",
    schedule_date: todayStr,
    event_date: "",
    last_registration_date: "",
    public: false,
  });

  // 🔹 event_details states
  const [aboutText, setAboutText] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [participationType, setParticipationType] = useState("");
  const [certificates, setCertificates] = useState("");
  const [poster, setPoster] = useState(null);

  const [loading, setLoading] = useState(false);

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value === "" ? null : value,
    });
  };

  // ---------------- UPLOAD POSTER ----------------
  const uploadPoster = async (file, eventId) => {
    if (!file) return null;

    const fileName = `${eventId}_${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("event-posters")
      .upload(fileName, file, {
        upsert: true
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("event-posters")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("User not logged in");

      let visibility = "private";

      if (form.category === "personal" && form.public) {
        visibility = "public";
      } else if (form.category === "intra") {
        visibility = "restricted";
      }

      // FINAL TYPE VALUE
      const finalType =
        form.TYPE === "Other"
          ? customType
          : form.TYPE;

      const eventData = {
        ...form,

        TYPE: finalType,

        creator_id: user.id,

        wishlist_count: 0,

        visibility
      };

      // 🔹 STEP 1: Insert event
      const { data: eventInsert, error: eventError } = await supabase
        .from("events")
        .insert([eventData])
        .select()
        .single();

      if (eventError) throw eventError;

      const eventId = eventInsert.id;

      // 🔹 STEP 2: Upload poster
      const posterUrl = await uploadPoster(poster, eventId);

      // 🔹 STEP 3: Insert event_details ONLY if needed
      if (
        aboutText ||
        teamSize ||
        participationType ||
        certificates ||
        posterUrl
      ) {

        const { error: detailsError } = await supabase
          .from("event_details")
          .insert([{
            event_id: eventId,

            about_text: aboutText || null,

            team_size: teamSize || null,

            participation_type: participationType || null,

            certificates: certificates || null,

            poster_url: posterUrl
          }]);

        if (detailsError) throw detailsError;
      }

      alert("Event created successfully!");

      onNavigate("home");

    } catch (err) {

      console.error(err);

      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="create-event-container">

      <h1 className="page-title">Create New Event</h1>

      <form onSubmit={handleSubmit} className="create-event-form compact-form">

        {/* ================= EVENT DETAILS ================= */}

        <div className="form-section">

          <h2 className="section-title">Event Details</h2>

          {/* EVENT NAME */}

          <label className="form-label">
            <span>Event Name</span>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>

          {/* CATEGORY */}

          <label className="form-label">

            <span>Category</span>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={!isAdmin}
              className="form-input"
            >
              {isAdmin ? (
                <>
                  <option value="intra">Intra College</option>

                  <option value="inter">Inter College</option>

                  <option value="personal">Personal</option>
                </>
              ) : (
                <option value="personal">Personal</option>
              )}
            </select>

          </label>

          {/* EVENT TYPE */}

          <label className="form-label">

            <span>Event Type</span>

            <select
              name="TYPE"
              value={form.TYPE}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select Event Type</option>

              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}

            </select>

          </label>

          {/* CUSTOM TYPE */}

          {form.TYPE === "Other" && (

            <label className="form-label">

              <span>Enter Custom Event Type</span>

              <input
                type="text"
                value={customType}
                onChange={(e) =>
                  setCustomType(e.target.value)
                }
                placeholder="Enter event type"
                required
                className="form-input"
              />

            </label>

          )}

          {/* TARGET BRANCH */}

          <label className="form-label">

            <span>Target Branch</span>

            <select
              name="target_branch"
              value={form.target_branch}
              onChange={handleChange}
              required
              className="form-input"
            >

              <option value="">
                Select Branch
              </option>

              {branches.map((branch) => (
                <option
                  key={branch}
                  value={branch}
                >
                  {branch}
                </option>
              ))}

            </select>

          </label>

          {/* TARGET YEAR */}

          <label className="form-label">

            <span>Target Year</span>

            <select
              name="target_year"
              value={form.target_year}
              onChange={handleChange}
              required
              className="form-input"
            >

              <option value="">
                Select Year
              </option>

              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}

            </select>

          </label>

          {/* DESCRIPTION */}

          <label className="form-label">

            <span>Description</span>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="form-textarea"
            />

          </label>

          {/* ================= DATES ================= */}

          <label className="form-label">

            <span>Schedule Date</span>

            <input
              type="date"
              name="schedule_date"
              value={form.schedule_date || ""}
              onChange={handleChange}
              min={todayStr}
              className="form-input"
            />

          </label>

          <label className="form-label">

            <span>Event Date</span>

            <input
              type="date"
              name="event_date"
              value={form.event_date || ""}
              onChange={handleChange}
              min={todayStr}
              className="form-input"
            />

          </label>

          <label className="form-label">

            <span>Last Registration Date</span>

            <input
              type="date"
              name="last_registration_date"
              value={form.last_registration_date || ""}
              onChange={handleChange}
              min={todayStr}
              className="form-input"
            />

          </label>

        </div>

        {/* ================= EXTRA DETAILS ================= */}

        <div className="form-section">

          <h2 className="section-title">
            Additional Details (Optional)
          </h2>

          <label className="form-label">

            <span>About The Competition</span>

            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="form-textarea"
            />

          </label>

          <label className="form-label">

            <span>Team Size</span>

            <input
              type="text"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="form-input"
            />

          </label>

          <label className="form-label">

            <span>Participation Type</span>

            <input
              type="text"
              value={participationType}
              onChange={(e) => setParticipationType(e.target.value)}
              className="form-input"
            />

          </label>

          <label className="form-label">

            <span>Certificates</span>

            <input
              type="text"
              value={certificates}
              onChange={(e) => setCertificates(e.target.value)}
              className="form-input"
            />

          </label>

          <label className="form-label">

            <span>Upload Poster (JPG)</span>

            <input
              type="file"
              accept="image/jpeg"
              onChange={(e) => setPoster(e.target.files[0])}
            />

          </label>

        </div>

        {/* ================= BUTTONS ================= */}

        <div className="form-actions">

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>

          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="btn-secondary"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
};

export default CreateEventPage;
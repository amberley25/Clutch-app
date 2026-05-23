import { useEffect, useState } from "react";
import { supabase } from "../services/SupabaseClient";
//import "./App.css";

const ViewDetailsPage = ({ eventId, onNavigate }) => {
    console.log("EVENT ID RECEIVED:", eventId);
  const [event, setEvent] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (eventId) {
    fetchEventDetails();
  }
}, [eventId]);
 const fetchEventDetails = async () => {
  try {
    console.log("Fetching for eventId:", eventId);

    // 🔹 Fetch event
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    console.log("EVENT DATA:", eventData);
    console.log("EVENT ERROR:", eventError);

    if (eventError) throw eventError;

    setEvent(eventData);

    // 🔹 Fetch event_details
    const { data: detailsData, error: detailsError } = await supabase
      .from("event_details")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle();

    console.log("DETAILS DATA:", detailsData);
    console.log("DETAILS ERROR:", detailsError);

    if (detailsError) throw detailsError;

    setDetails(detailsData);

  } catch (err) {
    console.error("FINAL ERROR:", err);
    alert("Failed to load event details");
  }

  setLoading(false);
};

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!event) return <p className="error-text">Event not found</p>;

  return (
    <div className="details-container">

      <h1 className="details-title">
        All that you need to know about
      </h1>

      <h2 className="event-name">{event.name}</h2>

      {/* ================= POSTER ================= */}
      {details?.poster_url && (
        <div className="poster-container">
          <img
            src={details.poster_url}
            alt="Event Poster"
            className="poster-image"
          />
        </div>
      )}

      {/* ================= ABOUT ================= */}
      {details?.about_text && (
        <div className="details-section">
          <h3>About The Competition:</h3>
          <p>{details.about_text}</p>
        </div>
      )}

      {/* ================= TEAM ================= */}
      {(details?.team_size || details?.participation_type) && (
        <div className="details-section">
          <h3>Team Participation:</h3>

          {details.team_size && (
            <p><strong>Team size:</strong> {details.team_size}</p>
          )}

          {details.participation_type && (
            <p>{details.participation_type}</p>
          )}
        </div>
      )}

      {/* ================= IMPORTANT DATE ================= */}
      <div className="details-section">
        <h3>Important Date:</h3>
        <p><strong>Date:</strong> {event.event_date}</p>
      </div>

      {/* ================= CERTIFICATES ================= */}
      {details?.certificates && (
        <div className="details-section">
          <h3>Certificates:</h3>
          <p>{details.certificates}</p>
        </div>
      )}

      {/* ================= BACK BUTTON ================= */}
      <div className="details-actions">
        <button
          onClick={() => onNavigate("home")}
          className="btn-secondary"
        >
          Back
        </button>
      </div>

    </div>
  );
};

export default ViewDetailsPage;
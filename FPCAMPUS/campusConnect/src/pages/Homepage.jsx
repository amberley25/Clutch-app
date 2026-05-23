import { useEffect, useState } from 'react';
import { supabase } from '../services/SupabaseClient';

const HomePage = ({ onNavigate, isAdmin, currentUser }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
  setLoading(true);
  try {
   const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
  .from('events')
  .select('*')
  .gte('event_date', today)
  .or(`visibility.neq.private,creator_id.eq.${currentUser}`)
  .order('schedule_date', { ascending: true });

    if (error) throw error;

    setEvents(data || []);
  } catch (err) {
    console.error('Error fetching events:', err);
    setEvents([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchEvents();
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
                Create Group
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('friends')}>
                Find Teammates
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">Hackathons</div>
            <div className="floating-card card-2">Competitions</div>
            <div className="floating-card card-3">Team Building</div>
          </div>
        </div>
      )}

      <section>
        <div className="section-header">
          <h2>Intra-College Events</h2>
          <p>Upcoming events happening at our campus</p>
          <div style={{ marginTop: "1rem" }}>
  {/*{isAdmin ? (
    <button
      className="btn-primary"
      onClick={() => onNavigate("create-event")}
    >
      ➕ Create New Event
    </button>
  ) : (
    <button
      className="btn-primary"
      onClick={() => onNavigate("create-event")}
    >
      ➕ Create Personal Event
    </button>
  )}*/}
</div>
        </div>

        {/* Show Create Event button above event cards */}
        {isAdmin ? (
          <button
            className="btn-primary"
            onClick={() => onNavigate("create-event")}
          >
            ➕ Create New Event
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={() => onNavigate("create-event")}
            style={{ marginBottom: "1.5rem" }}
          >
            ➕ Create Personal Event
          </button>
        )}

        {loading ? (
          <p>Loading events...</p>
        ) : (
          <div className="events-grid">
            {events.length === 0 ? (
              <p>No events currently available.</p>
            ) : (
              events.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <span className={`event-category ${event.category.toLowerCase()}`}>{event.category}</span>
                    <span className="event-participants">{event.wishlist_count || 0}</span>
                  </div>
                  <h3 className="event-name">{event.name}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-footer">
                    <span className="event-date">
                      {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button className="btn-view" onClick={() => onNavigate(`event/${event.id}`)}>View Details</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </section>



      {!isAdmin && (
        <section>
          <div className="inter-college-card">
            <h2>Inter-College Opportunities</h2>
            <p>Discover hackathons and competitions happening across the country</p>
            <a href="https://unstop.com" target="_blank" rel="noopener noreferrer" className="btn-unstop">
              Explore on Unstop
            </a>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
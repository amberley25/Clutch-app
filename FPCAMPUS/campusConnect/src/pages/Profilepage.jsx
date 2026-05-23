import { useEffect, useState } from "react";
import { supabase } from "../services/SupabaseClient";

const predefinedSkills = ["JavaScript","React","Node.js","Python","SQL","CSS","HTML"];

const ProfilePage = ({ currentUser, isAdmin, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [gender, setGender] = useState("N/A");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        setEmail(user.email);

        // PROFILE
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;
        setProfile(profileData || {});

        // SKILLS (JOIN)
        const { data: skillsData, error: skillsError } = await supabase
          .from("user_skills")
          .select(`skills(name)`)
          .eq("user_id", user.id);

        if (skillsError) throw skillsError;

        setSkills(skillsData?.map(s => s.skills.name) || []);

        // ACHIEVEMENTS
        const { data: achData, error: achError } = await supabase
          .from("achievements")
          .select("*")
          .eq("user_id", user.id);

        if (achError) throw achError;

        setAchievements(
          achData?.map(a => ({
            value: a.title,
            description: a.description
          })) || []
        );

        // FRIEND COUNT
        const { count: fCount } = await supabase
          .from("friends")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);
        setFriendsCount(fCount || 0);

        // GROUP COUNT
        const { count: gCount } = await supabase
          .from("groups_members")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);
        setGroupsCount(gCount || 0);

      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchData();
  }, []);

  /* ================= PROFILE INPUT ================= */
  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  /* ================= SKILLS ================= */
  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setIsDirty(true);
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
    setIsDirty(true);
  };

  /* ================= ACHIEVEMENTS ================= */
  const addAchievement = () => {
    setAchievements([...achievements, { value: "", description: "" }]);
    setIsDirty(true);
  };

  const updateAchievement = (index, field, value) => {
    const updated = [...achievements];
    updated[index][field] = value;
    setAchievements(updated);
    setIsDirty(true);
  };

  const removeAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  /* ================= SAVE PROFILE ================= */
  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const userId = user.id;

      // UPDATE PROFILE
      await supabase
        .from("profiles")
        .update({
          fullname: profile.fullname,
          DEPT: profile.DEPT,
          year: profile.year,
          age: profile.age,
          avatar: profile.avatar
        })
        .eq("id", userId);


      /* ========== SKILLS (FIXED) ========== */
const { error: deleteError } = await supabase
  .from("user_skills")
  .delete()
  .eq("user_id", userId);

if (deleteError) {
  console.error("Delete skills error:", deleteError);
  return;
}

// insert new
for (const rawSkill of skills) {
  const skillName = rawSkill.trim();

  // check if skill exists
  const { data: existingSkill, error: fetchError } = await supabase
    .from("skills")
    .select("id")
    .ilike("name", skillName);

  if (fetchError) {
    console.error("Fetch skill error:", fetchError);
    continue;
  }

  let skillId;

  // if not found → create
  if (!existingSkill || existingSkill.length === 0) {
    const { data: newSkill, error: insertError } = await supabase
      .from("skills")
      .insert({ name: skillName })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert skill error:", insertError);
      continue;
    }

    skillId = newSkill.id;
  } else {
    skillId = existingSkill[0].id;
  }

  // link skill to user
  const { error: linkError } = await supabase
    .from("user_skills")
    .insert({
      user_id: userId,
      skill_id: skillId
    });

  if (linkError) {
    console.error("Link skill error:", linkError);
  }
}
      /* ========== ACHIEVEMENTS ========== */
      await supabase.from("achievements").delete().eq("user_id", userId);

      if (achievements.length > 0) {
        await supabase.from("achievements").insert(
          achievements.map(a => ({
            user_id: userId,
            title: a.value,
            description: a.description
          }))
        );
      }

      alert("Profile updated");
      setIsDirty(false);
    } catch (err) {
      console.error("Profile save error:", err);
    }
  };

  /* ================= DELETE PROFILE ================= */
  const handleDeleteProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const userId = user.id;

      await supabase.from("user_skills").delete().eq("user_id", userId);
      await supabase.from("achievements").delete().eq("user_id", userId);
      await supabase.from("friends").delete().eq("user_id", userId);
      await supabase.from("groups_members").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("id", userId);

      alert("Profile deleted");
      onLogout();
    } catch (err) {
      console.error("Profile delete error:", err);
    }
  };

  if (!profile) return <p>Loading...</p>;

  const initials = profile?.fullname
    ? profile.fullname.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  const displayAvatar = profile?.avatar ?? initials;

  /* ================= ADMIN VIEW ================= */
  if (isAdmin) {
    return (
      <div className="profile-page">
        <h1>👤 Profile</h1>
        <div className="profile-header-card">
          <div className="profile-user">
            <div className="avatar-section">
              <div className="profile-avatar">{displayAvatar}</div>
            </div>
            <div>
              <div className="profile-name">{profile?.fullname}</div>
              <div className="profile-email">{email}</div>
            </div>
          </div>
        </div>
        <div className="profile-card">
          <h3>Basic Info</h3>
          <p><strong>Full Name:</strong> {profile?.fullname}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Department:</strong> {profile?.DEPT}</p>
        </div>
      </div>
    );
  }

  /* ================= NORMAL UI ================= */
  return (
    <div className="profile-page">
      <h1>👤 Profile</h1>

      <div className="profile-header-card">
        <div className="profile-user">
          <div className="avatar-section">
            <div className="profile-avatar" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
              {displayAvatar}
            </div>
            {showAvatarPicker && (
              <div className="avatar-picker">
                <button className="avatar-option" onClick={() => {
                  handleProfileChange("avatar", null);
                  setShowAvatarPicker(false);
                }}>
                  {initials}
                </button>
                {["A","B","C","D","E","F","G","H","I","J"].map((letter, idx) => (
                  <button key={idx} className="avatar-option" style={{fontSize:'1.2rem', fontWeight:'bold'}} onClick={() => {
                    handleProfileChange("avatar", letter);
                    setShowAvatarPicker(false);
                  }}>{letter}</button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="profile-name">{profile?.fullname}</div>
            <div className="profile-email">{email}</div>
          </div>
        </div>

        <div className="profile-actions-top">
          <button className="btn-save" onClick={handleSaveProfile} disabled={!isDirty}>Save</button>
          <button className="btn-delete" onClick={handleDeleteProfile}>Delete</button>
        </div>
      </div>

      <div className="profile-grid">

        {/* STATS */}
        <div className="profile-card">
          <h3>Stats</h3>
          <p>Friends: {friendsCount}</p>
          <p>Groups: {groupsCount}</p>
        </div>

        {/* BASIC INFO */}
        <div className="profile-card">
          <h3>Basic Info</h3>
          <label>Full Name</label>
          <input value={profile.fullname || ""} onChange={(e) => handleProfileChange("fullname", e.target.value)} />
          <label>Email</label>
          <input value={email} disabled />
          <label>Age</label>
          <input type="number" value={profile.age || ""} onChange={(e) => handleProfileChange("age", Number(e.target.value))} />
          <label>Department</label>
          <input value={profile.DEPT || ""} onChange={(e) => handleProfileChange("DEPT", e.target.value)} />
          <label>Year</label>
          <input value={profile.year || ""} onChange={(e) => handleProfileChange("year", e.target.value)} />
        </div>

        {/* SKILLS */}
        <div className="profile-card">
          <h3>Skills</h3>
          <div className="skills-container">
            {skills.map(skill => (
              <span key={skill} className="skill-chip">
                {skill} <button onClick={() => removeSkill(skill)}>×</button>
              </span>
            ))}
          </div>
          <input placeholder="Add skill" list="skills" onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();   // ⭐ ADD THIS LINE
              addSkill(e.target.value);
              e.target.value = "";
            }
          }} />
          <datalist id="skills">
            {predefinedSkills.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="profile-card">
          <h3>Achievements</h3>
          {achievements.map((a, i) => (
            <div key={i} className="achievement-item">
              <input placeholder="Title" value={a.value} onChange={(e) => updateAchievement(i, "value", e.target.value)} />
              <input placeholder="Description" value={a.description} onChange={(e) => updateAchievement(i, "description", e.target.value)} />
              <button onClick={() => removeAchievement(i)}>Remove</button>
            </div>
          ))}
          <button onClick={addAchievement}>+ Add Achievement</button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
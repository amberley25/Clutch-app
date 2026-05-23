import { useState, useEffect } from "react";
import { supabase } from "../services/SupabaseClient";

function AddToGroupModal({ open, onClose, groups, onAdd, onCreate, selectedUser }) {
  const [groupId, setGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupDetails, setNewGroupDetails] = useState("");
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  return (
    <div className="overlay">
      <div className="modal">
        <h3>Add to Group</h3>
        {!creating ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label>Select a group:</label>
              <select value={groupId} onChange={e => setGroupId(e.target.value)} style={{ width: '100%', marginTop: 6 }}>
                <option value="">-- Select Group --</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.group_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-g" disabled={!groupId} onClick={() => onAdd(groupId)}>Add</button>
              <button className="btn btn-p" onClick={() => setCreating(true)}>+ New Group</button>
              <button className="btn btn-d" onClick={onClose}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label>Group Name:</label>
              <input className="inp" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name" />
              <label>Description:</label>
              <input className="inp" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="Description (optional)" />
            

            <label>Details:</label>

                <textarea
                  className="inp"
                  value={newGroupDetails}
                  onChange={(e) => setNewGroupDetails(e.target.value)}
                  placeholder="Group details"
                />

                </div>
            <div className="modal-actions">

            <button
              className="btn btn-g"
              disabled={!newGroupName}
              onClick={() =>
                onCreate(
                  newGroupName,
                  newGroupDesc,
                  newGroupDetails
                )
              }
            >
              Create
            </button>
              <button className="btn btn-d" onClick={() => setCreating(false)}>Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const FriendsPage = ({ currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // Fetch groups for current user
  useEffect(() => {
    if (currentUserId) fetchGroups();
  }, [currentUserId]);

const fetchGroups = async () => {

  const { data, error } = await supabase
    .from("groups")
    .select("id, group_name, description, details")
    .eq("created_by", currentUserId);

  if (error) {
    console.error("FETCH GROUPS ERROR:", error);
    return;
  }

  console.log("GROUPS:", data);

  setGroups(data || []);
};
  // Add user to group
  const handleAddToGroup = async (groupId) => {
    if (!groupId || !selectedUser) return;
    await supabase.from("groups_members").insert({ group_id: groupId, user_id: selectedUser });
    setShowGroupModal(false);
    setSelectedUser(null);
    // Optionally show a toast/notification
  };

  // Create new group and add user
const handleCreateGroup = async (
  groupName,
  description,
  details
) => {

  const { data, error } = await supabase
    .from("groups")
    .insert({
      group_name: groupName,
      description: description || "",
      details: details || ""
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  await supabase.from("groups_members").insert([
    {
      group_id: data.id,
      user_id: currentUserId
    },
    {
      group_id: data.id,
      user_id: selectedUser
    }
  ]);

  fetchGroups();

  setShowGroupModal(false);
  setSelectedUser(null);
};

  // filters
  const [searchName, setSearchName] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // skills filter
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]); // ✅ dynamic now

  useEffect(() => {
    if (currentUserId) {
      fetchUsers();
      fetchSkills(); // ✅ NEW
    }
  }, [currentUserId]);

    /* =======================================================
     CREATE CONVERSATION IF NOT EXISTS
  ======================================================= */
/*
 const createConversationIfNotExists = async (otherUserId) => {

    try {

      const { data: myConvos, error: convoError } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", currentUserId);

      if (convoError) {
        console.error(convoError);
        return;
      }

      if (!myConvos || myConvos.length === 0) {
        await createNewConversation(otherUserId);
        return;
      }

      const convoIds = myConvos.map(
        c => c.conversation_id
      );

      const { data: shared, error: sharedError } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", convoIds);

      if (sharedError) {
        console.error(sharedError);
        return;
      }

      if (shared && shared.length > 0) {
        return;
      }

      await createNewConversation(otherUserId);

    } catch (err) {
      console.error(err);
    }
  }; */

  /* =======================================================
     CREATE NEW CONVERSATION
  ======================================================= */
/*
  const createNewConversation = async (otherUserId) => {

    try {

      const { data: convo, error } = await supabase
        .from("conversations")
        .insert({
          created_by: currentUserId,
          is_group: false
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        return;
      }

      const { error: memberError } = await supabase
        .from("conversation_members")
        .insert([
          {
            conversation_id: convo.id,
            user_id: currentUserId
          },
          {
            conversation_id: convo.id,
            user_id: otherUserId
          }
        ]);

      if (memberError) {
        console.error(memberError);
      }

    } catch (err) {
      console.error(err);
    }
  };*/

  /* ---------- FETCH SKILLS (FOR DROPDOWN) ---------- */
  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("name")
      .order("name");

    if (error) {
      console.error("Skill fetch error:", error);
      return;
    }

    setSkillOptions(data?.map(s => s.name) || []);
  };

  /* ---------- FETCH USERS ---------- */
  const fetchUsers = async () => {
    setLoading(true);

    const userId = currentUserId;

    /* ---------- PROFILES ---------- */
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, fullname, DEPT, year, role");

    /* ---------- USER SKILLS (JOIN) ---------- */
    const { data: skillLinks } = await supabase
      .from("user_skills")
      .select(`
        user_id,
        skills(name)
        skills!inner(name)
      `);

    console.log("skillLinks:", skillLinks);

    /* ---------- FRIENDS ---------- */
    const { data: friends } = await supabase
      .from("friends")
      .select("user_id, friend_id, status");

    /* ---------- BUILD USER MAP ---------- */
    const userMap = {};

    profiles.forEach(p => {
      if (p.id === userId) return;
      if (p.role === "admin") return;

      userMap[p.id] = {
        ...p,
        skills: [],
        gender: "N/A",
        friendStatus: "none"
      };
    });

    /* ---------- MERGE SKILLS ---------- */
    /*// fetch skills separately
    const { data: skillsTable } = await supabase
      .from("skills")
      .select("id, name");

    const skillMap = {};
    skillsTable?.forEach(s => {
      skillMap[s.id] = s.name;
    });*/

   /* // map user skills
    skillLinks?.forEach(s => {
      const u = userMap[s.user_id];
      if (!u) return;

      const skillName = skillMap[s.skill_id];
      if (skillName) {
        u.skills.push(skillName);
      }
    });*/
  skillLinks?.forEach(s => {
  const u = userMap[s.user_id];
  if (!u) return;

  if (s.skills?.name) {
    u.skills.push(s.skills.name);
  }
});

    /* ---------- FRIEND STATUS ---------- */
    friends?.forEach(f => {
      if (f.user_id === userId && userMap[f.friend_id]) {
        userMap[f.friend_id].friendStatus = f.status;
      }

      if (f.friend_id === userId && userMap[f.user_id]) {
        userMap[f.user_id].friendStatus = f.status;
      }
    });

    setUsers(Object.values(userMap));
    setLoading(false);
  };

  /* ---------- SKILL HANDLERS ---------- */

  const addSkill = (skill) => {
    const clean = skill.trim();

    if (clean && !selectedSkills.includes(clean)) {
      setSelectedSkills([...selectedSkills, clean]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

 /* ---- add friend --- */

 const handleAddFriend = async (friendId) => {
  try {
    const userId = currentUserId;

    // 🔍 check if already exists (both directions)
    const { data: existing, error: checkError } = await supabase
      .from("friends")
      .select("*")
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

    if (checkError) {
      console.error("Check error:", checkError);
      return;
    }

    if (existing && existing.length > 0) {

  const relation = existing[0];

  /* incoming request exists -> accept it */

  if (
    relation.friend_id === userId &&
    relation.status === "pending"
  ) {

    const { error: updateError } = await supabase
      .from("friends")
      .update({
        status: "accepted"
      })
      .eq("id", relation.id);

    if (updateError) {
      console.error(updateError);
      return;
    }

    /* AUTO CREATE CHAT */

   // await createConversationIfNotExists(friendId);

    /* refresh */

    fetchUsers();

    return;
  }

  console.log("Friend request already exists");
  return;
}

    // ✅ insert new request
    const { error: insertError } = await supabase
      .from("friends")
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: "pending"
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return;
    }

    // ⚡ update UI instantly
    setUsers(prev =>
      prev.map(u =>
        u.id === friendId
          ? { ...u, friendStatus: "pending" }
          : u
      )
    );

  } catch (err) {
    console.error("Add friend error:", err);
  }
};

  /* ---------- FILTER USERS ---------- */

  const filteredUsers = users.filter(user => {
    const matchesName =
      user.fullname?.toLowerCase().includes(searchName.toLowerCase());

    const matchesYear =
      selectedYear ? user.year === selectedYear : true;

    const matchesDept =
      selectedDept ? user.DEPT === selectedDept : true;

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some(skill =>
        user.skills?.some(us =>
          us.toLowerCase() === skill.toLowerCase()
        )
      );

    return matchesName && matchesYear && matchesDept && matchesSkills;
  });

  const noFilters =
    !searchName &&
    !selectedYear &&
    !selectedDept &&
    selectedSkills.length === 0;

  const displayedUsers =
    noFilters ? filteredUsers.slice(0, 5) : filteredUsers;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Friends Directory</h2>

      {/* ---------------- FILTER BAR ---------------- */}

      <div className="filter-bar">

        <input
          type="text"
          placeholder="Search by name..."
          className="search-input"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        <select
          className="filter-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">All Years</option>
          <option value="FE">FE</option>
          <option value="SE">SE</option>
          <option value="TE">TE</option>
          <option value="BE">BE</option>
        </select>

        <select
          className="filter-select"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="CMPN">CMPN</option>
          <option value="IT">IT</option>
          <option value="EXTC">EXTC</option>
          <option value="MECH">MECH</option>
        </select>

        {/* ---------- SKILLS FILTER ---------- */}

        <div className="skills-filter">

          <input
            type="text"
            placeholder="Search skill..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
          />

          <select
            onChange={(e) => addSkill(e.target.value)}
          >
            <option value="">Select skill</option>

            {skillOptions.map(skill => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}

          </select>

          <div className="skills-chips">

            {selectedSkills.map(skill => (
              <span key={skill} className="skill-chip">
                {skill}
                <button onClick={() => removeSkill(skill)}>
                  ×
                </button>
              </span>
            ))}

          </div>

        </div>
      </div>

      {/* ---------------- USERS ---------------- */}

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="users-grid">

          {displayedUsers.map(user => (

            <div key={user.id} className="user-card">

              <h4>{user.fullname}</h4>

              <p>
                Dept: {user.DEPT || "N/A"} |
                Year: {user.year || "N/A"}
              </p>

              <p>Gender: {user.gender || "N/A"}</p>

              <p>
                Skills:
                {user.skills.length > 0
                  ? user.skills.join(", ")
                  : " N/A"}
              </p>

              <div className="user-actions">

                {user.friendStatus === "accepted" ? (
                  <button style={{ backgroundColor: "#4CAF50", color: "white" }} disabled>
                    Friends
                  </button>
                ) : user.friendStatus === "pending" ? (
                  <button style={{ backgroundColor: "#FFA500", color: "white" }} disabled>
                    Pending
                  </button>
                ) : (
                  <button
                    style={{ backgroundColor: "#007bff", color: "white" }}
                    onClick={() => handleAddFriend(user.id)}
                  >
                    Add Friend
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedUser(user.id);
                    setShowGroupModal(true);
                  }}
                >
                  Add to Group
                </button>

              </div>

            </div>

          ))}

        </div>
      )}
      <AddToGroupModal
        open={showGroupModal}
        onClose={() => { setShowGroupModal(false); setSelectedUser(null); }}
        groups={groups}
        onAdd={handleAddToGroup}
        onCreate={handleCreateGroup}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default FriendsPage;
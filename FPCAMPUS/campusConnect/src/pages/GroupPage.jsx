import { useEffect, useState } from "react";
import { supabase } from "../services/SupabaseClient";


const GroupPage = ({ currentUserId, onNavigate }) => {
 const [groups, setGroups] = useState([]);
 const [activeGroup, setActiveGroup] = useState(null);


 const [messages, setMessages] = useState([]);
 const [text, setText] = useState("");


 const [showCreate, setShowCreate] = useState(false);


 const [newGroupName, setNewGroupName] = useState("");
 const [newGroupDesc, setNewGroupDesc] = useState("");
 const [newGroupDetails, setNewGroupDetails] = useState("");


 const [members, setMembers] = useState([]);
 const [allUsers, setAllUsers] = useState([]);


 const [showAddMember, setShowAddMember] = useState(false);
 const [selectedUser, setSelectedUser] = useState("");


 // =====================================================
 // FETCH GROUPS
 // =====================================================


 useEffect(() => {
   fetchGroups();
 }, []);

 useEffect(() => {
  fetchAllUsers();
}, []);


 const fetchGroups = async () => {
   const {
     data: { user },
   } = await supabase.auth.getUser();


   if (!user) return;


  const { data: memberLinks, error: memberError } = await supabase
  .from("group_mem_status")
  .select("group_id")
  .eq("user_id", user.id)
  .eq("status", "accepted");   // 🔥 IMPORTANT FIX


   if (memberError) {
     console.error("MEMBER FETCH ERROR:", memberError);
     return;
   }


   const groupIds = memberLinks?.map((g) => g.group_id) || [];


   if (groupIds.length === 0) {
     setGroups([]);
     return;
   }


   const { data: groupList, error: groupError } = await supabase
     .from("groups")
     .select("*")
     .in("id", groupIds);


   if (groupError) {
     console.error("GROUP FETCH ERROR:", groupError);
     return;
   }


   setGroups(groupList || []);
 };

 const fetchAllUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, fullname");

  if (error) {
    console.error("ALL USERS FETCH ERROR:", error);
    return;
  }

  setAllUsers(data || []);
};

 // =====================================================
 // OPEN GROUP
 // =====================================================


 const openGroup = async (group) => {
   //setActiveGroup(group);

   const { data: membership, error: memStatusError } = await supabase
  .from("group_mem_status")
  .select("status")
  .eq("group_id", group.id)
  .eq("user_id", currentUserId)
  .single();

if (memStatusError || !membership) {
  alert("You are not part of this group");
  return;
}

if (membership.status !== "accepted") {
  alert("You must accept the invite before accessing chat");
  return;
}


   // fetch messages
   //const { data: msgs, error: msgError } = await supabase
    // .from("messages") // get message from messages table
    // .select("*")
     //.eq("conversation_id", conversation_members.conversation_id)
     //.order("created_at", { ascending: true });

   /* const { data: convo, error: convoError } = await supabase
  .from("conversations")
  .select("id")
  .eq("group_id", group.id)
  .single();

if (convoError || !convo) {
  console.error("Conversation not found:", convoError);
  setMessages([]);
  return;
}

const { data: msgs, error: msgError } = await supabase
  .from("messages")
  .select("*")
  .eq("conversation_id", convo.id)
  .order("created_at", { ascending: true });

if (msgError) {
  console.error(msgError);
}

setMessages(msgs || []);
   if (msgError) {
     console.error(msgError);
   }


   setMessages(msgs || []);*/

   // STEP 1: get conversation
  const { data: convo, error: convoError } = await supabase
    .from("conversations")
    .select("id")
    .eq("group_id", group.id)
    .single();

  if (convoError || !convo) {
    console.error("Conversation not found:", convoError);
    setMessages([]);
    return;
  }

  // STEP 2: fetch messages using conversation_id
const { data: msgs, error: msgError } = await supabase
  .from("messages")
  .select(`
    *,
    profiles:sender_id (
      fullname
    )
  `)
  .eq("conversation_id", convo.id)
  .order("created_at", { ascending: true });

  if (msgError) {
    console.error("Message fetch error:", msgError);
  }

  setMessages(msgs || []);

  // STEP 3: store conversation on activeGroup (IMPORTANT for realtime later)
  setActiveGroup({
    ...group,
    conversation_id: convo.id
  });


 
 
   // fetch members
   const { data: mems, error: memError } = await supabase
     .from("group_mem_status")
     .select("user_id")
     .eq("group_id", group.id);


   if (memError) {
     console.error(memError);
     return;
   }


   const userIds = mems?.map((m) => m.user_id) || [];


   if (userIds.length > 0) {
     const { data: users, error: usersError } = await supabase
       .from("profiles")
       .select("id, fullname")
       .in("id", userIds);


     if (usersError) {
       console.error(usersError);
     }


     setMembers(users || []);
   } else {
     setMembers([]);
   }


   // fetch all users
   //const { data: allUsersData, error: allUsersError } = await supabase
    // .from("profiles")
    // .select("id, fullname");


   //if (allUsersError) {
    // console.error(allUsersError);  
  // }


  // setAllUsers(allUsersData || []);
 };


 // =====================================================
 // SEND MESSAGE
 // =====================================================

const sendMessage = async () => {
  if (!text.trim() || !activeGroup) return;

  const { data: { user } } = await supabase.auth.getUser();

  // STEP 1: get conversation for this group
  const { data: convo, error: convoError } = await supabase
    .from("conversations")
    .select("id")
    .eq("group_id", activeGroup.id)
    .single();

  if (convoError || !convo) {
    console.error("Conversation not found:", convoError);
    return;
  }

  // STEP 2: insert message into correct table
  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: convo.id,
      sender_id: user.id,
      content: text,
    });

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  // Add message locally
  const message = { conversation_id: convo.id, sender_id: user.id, content: text, created_at: new Date().toISOString() };
  setMessages(prev => [...prev, message]);

  setText("");
};

 // =====================================================
 // REALTIME
 // =====================================================

useEffect(() => {
  if (!activeGroup) return;

  const channel = supabase
    .channel("group-chat-live")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      async (payload) => {

        if (
          payload.new.conversation_id ===
          activeGroup.conversation_id
        ) {

          const { data } = await supabase
            .from("messages")
            .select(`
              *,
              profiles:sender_id (
                fullname
              )
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data]);
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };

}, [activeGroup]);


 // =====================================================
 // CREATE GROUP
 // =====================================================

/*
 const handleCreateGroup = async () => {
   if (!newGroupName.trim()) {
     alert("Group name required");
     return;
   }


   const {
     data: { user },
   } = await supabase.auth.getUser();


   if (!user) {
     alert("User not logged in");
     return;
   }


   // create group
   const { data, error } = await supabase
     .from("groups")
     .insert({
       group_name: newGroupName,
       description: newGroupDesc,
       details: newGroupDetails,
       created_by: user.id,
     })
     .select()
     .single();

     const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .insert({
        group_id: data.id,
        created_by: user.id,
        is_group: true,
      })
  .select()
  .single();

if (convoError) {
  console.error("CONVO ERROR:", convoError);
  return;
}

  //await supabase
  //.from("groups")
  //.update({ conversation_id: convo.id })
  //.eq("id", data.id);

   console.log("GROUP INSERT:", data);
   console.log("GROUP ERROR:", error);




   if (error) {
     alert(error.message);
     return;
   }


   // add creator as member
   const { error: memberError } = await supabase
     .from("group_mem_status")
     .insert({
       group_id: data.id,
       user_id: user.id,
       status: "accepted",
     });

    // await supabase.from("conversation_members").insert({
     ///conversation_id: convo.id,
     //user_id: user.id,
    // });
      const { error: convoMemberError } = await supabase
      .from("conversation_members")
      .insert({
        conversation_id: convo.id,
        user_id: user.id,
      });

    if (convoMemberError) {
      console.error("CONVERSATION MEMBER ERROR:", convoMemberError);
      alert(convoMemberError.message);
      return;
    }

   console.log("MEMBER ERROR:", memberError);


   if (memberError) {
     alert(memberError.message);
     return;
   }


   // reset
   setNewGroupName("");
   setNewGroupDesc("");
   setNewGroupDetails("");


   setShowCreate(false);


   fetchGroups();
 };*/

 const handleCreateGroup = async () => {
  if (!newGroupName.trim()) {
    alert("Group name required");
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("User not logged in");
    return;
  }

  // =========================================
  // CREATE GROUP
  // =========================================

  const { data: groupData, error: groupError } = await supabase
    .from("groups")
    .insert({
      group_name: newGroupName,
      description: newGroupDesc,
      details: newGroupDetails,
      created_by: user.id,
    })
    .select()
    .single();

  if (groupError || !groupData) {
    console.error("GROUP ERROR:", groupError);
    alert(groupError?.message);
    return;
  }

  // =========================================
  // CREATE CONVERSATION
  // =========================================

  /*const { data: convoData, error: convoError } = await supabase
    .from("conversations")
    .insert({
      group_id: groupData.id,
      created_by: user.id,
      is_group: true,
    })
    .select()
    .single();

  if (convoError || !convoData) {
    console.error("CONVO ERROR:", convoError);
    alert(convoError?.message);
    return;
  }*/

    const { data: convoData, error: convoError } = await supabase
  .from("conversations")
  .select("id")
  .eq("group_id", groupData.id)
  .single();

if (convoError || !convoData) {
  console.error("FETCH CONVO ERROR:", convoError);
  alert("Conversation not found");
  return;
}

  // =========================================
  // ADD CREATOR TO GROUP STATUS
  // =========================================

  const { error: memberError } = await supabase
    .from("group_mem_status")
    .insert({
      group_id: groupData.id,
      user_id: user.id,
      status: "accepted",
    });

  if (memberError) {
    console.error("GROUP MEMBER ERROR:", memberError);
    alert(memberError.message);
    return;
  }

  // =========================================
  // ADD CREATOR TO CONVERSATION MEMBERS
  // =========================================

  const { error: convoMemberError } = await supabase
    .from("conversation_members")
    .insert({
      conversation_id: convoData.id,
      user_id: user.id,
    });

  if (convoMemberError) {
    console.error("CONVO MEMBER ERROR:", convoMemberError);
    alert(convoMemberError.message);
    return;
  }

  // =========================================
  // RESET
  // =========================================

  setNewGroupName("");
  setNewGroupDesc("");
  setNewGroupDetails("");

  setShowCreate(false);

  await fetchGroups();

  // auto open newly created group
  openGroup(groupData);
};

 // =====================================================
 // ADD MEMBER
 // =====================================================
const handleAddMember = async () => {
  if (!selectedUser || !activeGroup) return;

  const { error } = await supabase
    .from("group_mem_status")
    .insert({
      group_id: activeGroup.id,
      user_id: selectedUser,
      status: "pending",
    });

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  setShowAddMember(false);
  setSelectedUser("");

  alert("Invite sent");
};


 // =====================================================
 // REMOVE MEMBER
 // =====================================================


 const handleRemoveMember = async (userId) => {
   const { error } = await supabase
     .from("group_mem_status")
     .delete()
     .eq("group_id", activeGroup.id)
     .eq("user_id", userId);


   if (error) {
     console.error(error);
     alert(error.message);
     return;
   }


   openGroup(activeGroup);
 };


 return (
   <div className="chat-page">


     {/* ===================================================== */}
     {/* SIDEBAR */}
     {/* ===================================================== */}


     <div className="chat-sidebar" style={{ position: 'relative' }}>


       <div className="chat-sidebar-header">
         Groups
       </div>


       <button
         className="btn btn-p"
         style={{ margin: "10px" }}
         onClick={() => setShowCreate(true)}
       >
         + Create Group
       </button>


       {groups.map((group) => (
         <div
           key={group.id}
           className={`chat-user ${
             activeGroup?.id === group.id ? "active-chat" : ""
           }`}
           onClick={() => openGroup(group)}
         >
           <div className="chat-user-info">


             <div className="chat-avatar">
               {group.group_name?.charAt(0)}
             </div>


             <div>


               <div className="chat-name">
                 {group.group_name}
               </div>


               <div className="chat-preview">
                 {group.description}
               </div>


             </div>


           </div>
         </div>
       ))}

       {/* Back Button */}
       <div style={{ position: 'absolute', bottom: '20px', left: '10px' }}>
         <button
           className="btn btn-d"
           onClick={() => onNavigate('home')}
           style={{ fontSize: '14px', padding: '8px 12px' }}
         >
           ← Back to Home
         </button>
       </div>


     </div>


     {/* ===================================================== */}
     {/* CHAT WINDOW */}
     {/* ===================================================== */}


     <div className="chat-window">


       {activeGroup ? (
         <>


           <div
             className="chat-header"
             style={{
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
             }}
           >


             <div>


               <h2>
                 {activeGroup.group_name}
               </h2>


               <div>
                 {activeGroup.description}
               </div>


               <div
                 style={{
                   marginTop: "5px",
                   fontSize: "0.9rem",
                   opacity: 0.8,
                 }}
               >
                 {activeGroup.details}
               </div>


             </div>


             <button
               className="btn btn-g btn-xs"
               onClick={() => setShowAddMember(true)}
             >
               + Add Member
             </button>


           </div>


           {/* MEMBERS */}


           <div style={{ marginBottom: "10px" }}>


             <strong>Members:</strong>


             <div
               style={{
                 display: "flex",
                 gap: "8px",
                 flexWrap: "wrap",
                 marginTop: "5px",
               }}
             >


               {members.map((m) => (
                 <span key={m.id} className="chip">


                   {m.fullname}


                   {m.id !== currentUserId && (
                     <button
                       onClick={() => handleRemoveMember(m.id)}
                       style={{
                         marginLeft: "5px",
                         border: "none",
                         background: "none",
                         cursor: "pointer",
                       }}
                     >
                       ×
                     </button>
                   )}


                 </span>
               ))}


             </div>


           </div>


           {/* MESSAGES */}


           <div className="chat-messages">


             {messages.map((m) => (
               <div
                 key={m.id}
                 className={
                   m.sender_id === currentUserId
                     ? "message mine"
                     : "message theirs"
                 }
               >
                <div className="message-bubble">

  {m.sender_id !== currentUserId && (
    <div
      style={{
        fontSize: "0.75rem",
        fontWeight: "bold",
        marginBottom: "4px",
        opacity: 0.8,
      }}
    >
      {m.profiles?.fullname || "Unknown User"}
    </div>
  )}

  {m.content}

</div>
               </div>
             ))}


           </div>


           {/* INPUT */}


           <div className="chat-input-box">


             <input
               type="text"
               className="chat-input"
               placeholder="Type message..."
               value={text}
               onChange={(e) => setText(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === "Enter") {
                   sendMessage();
                 }
               }}
             />


             <button
               className="send-btn"
               onClick={sendMessage}
             >
               Send
             </button>


           </div>


         </>
       ) : (
         <div className="empty-chat">
           Select a group
         </div>
       )}


     </div>


     {/* ===================================================== */}
     {/* CREATE GROUP MODAL */}
     {/* ===================================================== */}


     {showCreate && (
       <div className="overlay">


         <div className="modal">


           <h3>Create Group</h3>


           <input
             className="inp"
             placeholder="Group Name"
             value={newGroupName}
             onChange={(e) =>
               setNewGroupName(e.target.value)
             }
           />


           <input
             className="inp"
             placeholder="Description"
             value={newGroupDesc}
             onChange={(e) =>
               setNewGroupDesc(e.target.value)
             }
           />


           <textarea
             className="inp"
             placeholder="Details"
             rows={4}
             value={newGroupDetails}
             onChange={(e) =>
               setNewGroupDetails(e.target.value)
             }
           />


           <div className="modal-actions">


             <button
               className="btn btn-g"
               onClick={handleCreateGroup}
             >
               Create
             </button>


             <button
               className="btn btn-d"
               onClick={() => setShowCreate(false)}
             >
               Cancel
             </button>


           </div>


         </div>


       </div>
     )}


     {/* ===================================================== */}
     {/* ADD MEMBER MODAL */}
     {/* ===================================================== */}


     {showAddMember && (
       <div className="overlay">


         <div className="modal">


           <h3>Add Member</h3>


           <select
             className="inp"
             value={selectedUser}
             onChange={(e) =>
               setSelectedUser(e.target.value)
             }
           >
             <option value="">
               Select User
             </option>


             {allUsers
               .filter(
                 (u) =>
                   !members?.some((m) => m.id === u.id)
               )
               .map((u) => (
                 <option
                   key={u.id}
                   value={u.id}
                 >
                   {u.fullname}
                 </option>
               ))}


           </select>


           <div className="modal-actions">


             <button
               className="btn btn-g"
               onClick={handleAddMember}
             >
               Add
             </button>


             <button
               className="btn btn-d"
               onClick={() =>
                 setShowAddMember(false)
               }
             >
               Cancel
             </button>


           </div>


         </div>


       </div>
     )}


   </div>
 );
};


export default GroupPage;
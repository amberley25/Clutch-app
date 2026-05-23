import { useEffect, useState } from "react";
import { supabase } from "../services/SupabaseClient";


const NotificationsPage = ({ currentUserId }) => {
 const [friendRequests, setFriendRequests] = useState([]);
 const [groupInvites, setGroupInvites] = useState([]);


 useEffect(() => {
   fetchFriendRequests();
   fetchGroupInvites();
 }, []);


 const fetchFriendRequests = async () => {
   const { data } = await supabase
     .from("friends")
     .select(`
       id,
       user_id,
       status,
       profiles:user_id(fullname)
     `)
     .eq("friend_id", currentUserId)
     .eq("status", "pending");


   setFriendRequests(data || []);
 };


 const fetchGroupInvites = async () => {
   const { data } = await supabase
     .from("group_mem_status")
     .select(`
       id,
       group_id,
       status,
       groups:group_id (group_name),
       profiles:user_id (fullname)
     `)
     .eq("user_id", currentUserId)
     .eq("status", "pending");


   setGroupInvites(data || []);
 };


 useEffect(() => {
 const channel = supabase
   .channel("invite-realtime")
   .on(
     "postgres_changes",
     {
       event: "INSERT",
       schema: "public",
       table: "group_mem_status",
       filter: `user_id=eq.${currentUserId}`,
     },
     (payload) => {
       setGroupInvites((prev) => [payload.new, ...prev]);
     }
   )
   .on(
     "postgres_changes",
     {
       event: "INSERT",
       schema: "public",
       table: "friends",
       filter: `friend_id=eq.${currentUserId}`,
     },
     (payload) => {
       setFriendRequests((prev) => [payload.new, ...prev]);
     }
   )
   .subscribe();


 return () => {
   supabase.removeChannel(channel);
 };
}, [currentUserId]);



const acceptFriendRequest = async (req) => {

  // accept request
  const { error: updateError } = await supabase
    .from("friends")
    .update({ status: "accepted" })
    .eq("id", req.id);

  if (updateError) {
    console.error(updateError);
    return;
  }
   fetchFriendRequests();
};

 const rejectFriendRequest = async (req) => {
   const { error } = await supabase
     .from("friends")
     .delete()
     .eq("id", req.id);


   if (error) {
     console.error(error);
     return;
   }


   fetchFriendRequests();
 };


 const acceptGroupInvite = async (req) => {
   const { error: updateError } = await supabase
     .from("group_mem_status")
     .update({ status: "accepted" })
     .eq("id", req.id);


   if (updateError) {
     console.error(updateError);
     return;
   }



   fetchGroupInvites();
 };


 const rejectGroupInvite = async (req) => {
   const { error } = await supabase
     .from("group_mem_status")
     .update({ status: "rejected" })
     .eq("id", req.id);


   if (error) {
     console.error(error);
     return;
   }


   fetchGroupInvites();
 };


 return (
   <div style={{ padding: 20 }}>
     <h2>🔔 Notifications</h2>


     <h3>👥 Friend Requests</h3>
     {friendRequests.length === 0 ? (
       <p>No friend requests</p>
     ) : (
       friendRequests.map(req => (
         <div
           key={req.id}
           style={{
             padding: 12,
             marginBottom: 10,
             borderRadius: 10,
             background: "#f5f5f5",
             display: "flex",
             justifyContent: "space-between",
             alignItems: "center"
           }}
         >
           <div>
             <b>{req.profiles?.fullname}</b> sent you a friend request
           </div>
           <div style={{ display: "flex", gap: 8 }}>
             <button
               onClick={() => acceptFriendRequest(req)}
               style={{ background: "green", color: "white" }}
             >
               Accept
             </button>
             <button
               onClick={() => rejectFriendRequest(req)}
               style={{ background: "red", color: "white" }}
             >
               Reject
             </button>
           </div>
         </div>
       ))
     )}


     <h3>📩 Group Invites</h3>
     {groupInvites.length === 0 ? (
       <p>No group invites</p>
     ) : (
       groupInvites.map(req => (
         <div
           key={req.id}
           style={{
             padding: 12,
             marginBottom: 10,
             borderRadius: 10,
             background: "#f5f5f5",
             color:"black",
             display: "flex",
             justifyContent: "space-between",
             alignItems: "center"
           }}
         >
           <div>
             <b>{req.groups?.group_name}</b>
             <div style={{ fontSize: 12 }}>
               Group Invite
             </div>
           </div>
           <div style={{ display: "flex", gap: 8 }}>
            <button
            onClick={() => acceptGroupInvite(req)}
            style={{
              background: "#16a34a",
              color: "white",
              padding: "8px 14px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer"
            }}
             >
               Accept
             </button>
             <button
              onClick={() => rejectGroupInvite(req)}
              style={{
                background: "#dc2626",
                color: "white",
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer"
              }}
             >
               Reject
             </button>
           </div>
         </div>
       ))
     )}
   </div>
 );
};


export default NotificationsPage;


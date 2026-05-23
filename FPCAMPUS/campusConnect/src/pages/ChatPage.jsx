import { useEffect, useState } from "react";
import { supabase } from "../services/SupabaseClient";

const ChatPage = ({ currentUserId, onNavigate }) => {

  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
  console.log("ACTIVE CHAT:", activeChat);
}, [activeChat]);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  /* ================= LOAD FRIENDS ================= */

  useEffect(() => {
    if (!currentUserId) return;
    loadFriends();
  }, [currentUserId]);
  
  const loadFriends = async () => {

    const { data, error } = await supabase
      .from("friends")
      .select("user_id, friend_id, status")
      .eq("status", "accepted")
      .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

    if (error) {
      console.error(error);
      return;
    }

    const friendIds = (data || []).map(f =>
      f.user_id === currentUserId ? f.friend_id : f.user_id
    );

   
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, fullname")
      .in("id", friendIds);

      console.log("FRIENDS:", profiles);
    setFriends(profiles || []);
  };

  /* ================= OPEN CHAT (100% RELIABLE) ================= */

/*const openChat = async (friend) => {

  console.log("CLICKED FRIEND:", friend);

  let conversationId = null;

  // check existing conversation
  const { data: existing, error: existingError } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id")
    .in("user_id", [currentUserId, friend.id]);

  console.log("EXISTING:", existing);
  console.log("EXISTING ERROR:", existingError);

  if (existingError) {
    console.error(existingError);
    return;
  }

  if (existing && existing.length >= 2) {

    const grouped = {};

    existing.forEach(row => {
      grouped[row.conversation_id] =
        (grouped[row.conversation_id] || 0) + 1;
    });

    conversationId = Object.keys(grouped)
      .find(id => grouped[id] === 2);
  }

  // create conversation if not found
  if (!conversationId) {

    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .insert({
        is_group: false,
        created_by: currentUserId
      })
      .select()
      .single();

    console.log("NEW CONVO:", convo);
    console.log("CONVO ERROR:", convoError);

    if (convoError) {
      console.error(convoError);
      return;
    }

    conversationId = convo.id;

    const { error: memberError } = await supabase
      .from("conversation_members")
      .insert([
        {
          conversation_id: conversationId,
          user_id: currentUserId
        },
        {
          conversation_id: conversationId,
          user_id: friend.id
        }
      ]);

    if (memberError) {
      console.error(memberError);
      return;
    }
  }

  // IMPORTANT
  const chatObj = {
    conversation_id: conversationId,
    name: friend.fullname,
    user_id: friend.id
  };

  console.log("SETTING ACTIVE CHAT:", chatObj);

  setActiveChat(chatObj);

  await loadMessages(conversationId);
};

const openChat = async (friend) => {

  console.log("CLICKED FRIEND:", friend);

  // get all conversations for current user
  const { data: myConvos, error: myError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", currentUserId);

  if (myError) {
    console.error(myError);
    return;
  }

  const convoIds = myConvos.map(c => c.conversation_id);

  // find shared conversation with friend
  const { data: shared, error: sharedError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", friend.id)
    .in("conversation_id", convoIds);

  if (sharedError) {
    console.error(sharedError);
    return;
  }

  if (!shared || shared.length === 0) {
    console.error("No conversation exists");
    return;
  }

  const conversationId = shared[0].conversation_id;

  const chatObj = {
    conversation_id: conversationId,
    name: friend.fullname,
    user_id: friend.id
  };

  setActiveChat(chatObj);

  loadMessages(conversationId);
};*/
const openChat = async (friend) => {

  // get my conversations
  const { data: myConvos, error: myError } = await supabase
    .from("conversation_members")
    .select(`
      conversation_id,
      conversations (
        id,
        is_group
      )
    `)
    .eq("user_id", currentUserId);

  if (myError) {
    console.error(myError);
    return;
  }

  // ONLY personal conversations
  const personalConvoIds = myConvos
    .filter(c => c.conversations && c.conversations.is_group === false)
    .map(c => c.conversation_id);

  if (personalConvoIds.length === 0) {
    console.error("No personal chats found");
    return;
  }

  // find shared PERSONAL conversation
  const { data: shared, error: sharedError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", friend.id)
    .in("conversation_id", personalConvoIds);

  if (sharedError) {
    console.error(sharedError);
    return;
  }

  if (!shared || shared.length === 0) {
    console.error("No personal conversation exists");
    return;
  }

  const conversationId = shared[0].conversation_id;

  setActiveChat({
    conversation_id: conversationId,
    name: friend.fullname,
    user_id: friend.id
  });

  loadMessages(conversationId);
};
  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async (conversationId) => {

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    /*if (error) {
      console.error(error);
      return;
    }*/

    setMessages(data || []);
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {

    if (!text.trim() || !activeChat) return;

    const msg = {
      conversation_id: activeChat.conversation_id,
      sender_id: currentUserId,
      content: text
    };

    const { error } = await supabase
      .from("messages")
      .insert(msg);

    if (error) {
      console.error(error);
      return;
    }

    setMessages(prev => [...prev, msg]);
    setText("");
  };

  /* ================= REALTIME ================= */

  useEffect(() => {

    const channel = supabase
      .channel("chat-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {

          const msg = payload.new;

          if (msg.conversation_id === activeChat?.conversation_id) {
            setMessages(prev => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);

  }, [activeChat]);

  /* ================= UI ================= */

  return (
    <div className="chat-page">

      {/* LEFT */}
      <div className="chat-sidebar">

        <div className="chat-sidebar-header">
          Chats
        </div>

        {friends.map(friend => (
          <div
            key={friend.id}
            className="chat-user"
            onClick={() => openChat(friend)}
          >
            <div className="chat-avatar">
              {friend.fullname?.charAt(0)}
            </div>

            <div>
              <div className="chat-name">{friend.fullname}</div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "10px" }}>
          <button
            className="btn btn-d"
            onClick={() => onNavigate("home")}
            style={{ width: "100%" }}
          >
            ← Back to Home
          </button>
        </div>

      </div>

      {/* RIGHT */}
      <div className="chat-window">

        {!activeChat ? (
          <div className="empty-chat">
            Select a chat to start messaging
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h2>{activeChat.name}</h2>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.sender_id === currentUserId
                      ? "message mine"
                      : "message theirs"
                  }
                >
                  <div className="message-bubble">
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-box">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="chat-input"
                placeholder="Type a message..."
              />

              <button onClick={sendMessage} className="send-btn">
                Send
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ChatPage;
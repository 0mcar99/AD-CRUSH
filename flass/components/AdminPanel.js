"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./AdminPanel.module.css";

export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("enrolls");
  const [replyText, setReplyText] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const chatEndRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Load all users initially
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Sync details when a user is selected
  useEffect(() => {
    if (!selectedEmail) return;

    const selected = users.find((u) => u.email === selectedEmail);
    setSelectedUser(selected || { email: selectedEmail });

    // Clear stale data immediately on user switch
    setSubmissions([]);
    setMessages([]);
    setLoadingDetail(true);

    // Fetch user's submissions
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/submissions");
        if (res.ok) {
          const data = await res.json();
          const userSubs = (data.submissions || []).filter(
            (s) => (s.email || "").toLowerCase() === selectedEmail.toLowerCase()
          );
          setSubmissions(userSubs);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Fetch user's chats
    const fetchChats = async () => {
      try {
        const res = await fetch(`/api/chats?email=${encodeURIComponent(selectedEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.chats || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchSubmissions();
    fetchChats();

    // Start polling chats for active messaging — depends ONLY on selectedEmail
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmail]); // intentionally omit `users` to prevent duplicate intervals

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendAdminReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedEmail) return;

    const newMsg = { role: "admin", text: replyText, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newMsg]);
    const textToSend = replyText;
    setReplyText("");

    try {
      await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedEmail, text: textToSend }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q)
    );
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" className={styles.shieldIcon}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <h2 className={styles.title}>Admin Control Center</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Dashboard Split Container */}
        <div className={styles.body}>
          
          {/* Sidebar - User Search */}
          <div className={styles.sidebar}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search user email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.userList}>
              {loadingUsers ? (
                <div className={styles.sidebarEmpty}>Loading users...</div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedEmail(u.email)}
                    className={`${styles.userCard} ${selectedEmail === u.email ? styles.activeUserCard : ""}`}
                  >
                    <span className={styles.userInitial}>
                      {(u.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <div className={styles.userMeta}>
                      <span className={styles.userEmail}>{u.email}</span>
                      <span className={styles.userPhone}>{u.phone || "No phone number"}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className={styles.sidebarEmpty}>No users found.</div>
              )}
            </div>
          </div>

          {/* Main Panel - User Details & Actions */}
          <div className={styles.main}>
            {selectedEmail ? (
              <div className={styles.mainContent}>
                
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                  <div className={styles.profileMeta}>
                    <h3 className={styles.profileEmail}>{selectedUser?.email}</h3>
                    <div className={styles.profileSubGrid}>
                      <span><strong>Phone:</strong> {selectedUser?.phone || "—"}</span>
                      <span><strong>Country:</strong> {selectedUser?.countryCode || "—"}</span>
                      <span><strong>Registered:</strong> {selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                  <button
                    className={`${styles.tab} ${activeTab === "enrolls" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("enrolls")}
                  >
                    Enrolls ({submissions.length})
                  </button>
                  <button
                    className={`${styles.tab} ${activeTab === "chat" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("chat")}
                  >
                    Direct Chat
                  </button>
                </div>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                  
                  {activeTab === "enrolls" && (
                    <div className={styles.enrollsList}>
                      {loadingDetail ? (
                        <div className={styles.emptyState}>Loading data...</div>
                      ) : submissions.length > 0 ? (
                        submissions.map((sub) => (
                          <div key={sub.id} className={styles.enrollCard}>
                            <div className={styles.enrollHead}>
                              <h4 className={styles.enrollTitle}>{sub.productName || "Unnamed Campaign"}</h4>
                              <span className={styles.enrollStatus}>{sub.status}</span>
                            </div>
                            <div className={styles.enrollDetails}>
                              <p><strong>Client Name:</strong> {sub.name || "—"}</p>
                              <p><strong>Ad Type:</strong> {sub.adType || "—"}</p>
                              <p><strong>Product Name:</strong> {sub.productName || "—"}</p>
                              <p><strong>Tagline:</strong> {sub.tagline || "—"}</p>
                              <p><strong>Description:</strong> {sub.description || "—"}</p>
                              <p><strong>Category:</strong> {sub.category || "—"}</p>
                              <p><strong>Target Audience:</strong> {sub.audience || "—"}</p>
                              <p><strong>Platforms:</strong> {Array.isArray(sub.platforms) ? sub.platforms.join(", ") : sub.platforms || "—"}</p>
                              <p><strong>Budget Range:</strong> {sub.budget || "—"}</p>
                              <p><strong>Launch Timeline:</strong> {sub.timeline || "—"}</p>
                              <p><strong>Campaign Duration:</strong> {sub.duration || "—"}</p>
                              {sub.website && <p><strong>Website Link:</strong> <a href={sub.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-orange)" }}>{sub.website}</a></p>}
                              {sub.notes && <p><strong>Special Requests:</strong> {sub.notes}</p>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyState}>No campaigns submitted by this user.</div>
                      )}
                    </div>
                  )}

                  {activeTab === "chat" && (
                    <div className={styles.chatWrapper}>
                      <div className={styles.chatMessages}>
                        {messages.map((m, i) => (
                          <div key={i} className={m.role === "admin" ? styles.msgAdmin : m.role === "bot" ? styles.msgBot : styles.msgUser}>
                            <div className={styles.msgBubble}>
                              <p className={styles.msgText}>{m.text}</p>
                              <span className={styles.msgTime}>
                                {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={sendAdminReply} className={styles.chatInputWrap}>
                        <input
                          type="text"
                          placeholder={`Reply to ${selectedUser?.email}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className={styles.chatInput}
                        />
                        <button type="submit" className={styles.chatSend}>
                          Send
                        </button>
                      </form>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className={styles.unselectedState}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="64" height="64" style={{ color: "rgba(255,255,255,0.15)", marginBottom: 16 }}>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                <p>Select a user from the sidebar to inspect details and chat.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

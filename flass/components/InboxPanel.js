"use client";

import { useState, useEffect } from "react";
import styles from "./InboxPanel.module.css";

export default function InboxPanel({ onClose }) {
  const [tab, setTab] = useState("submissions");
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi there! How can we help you with your campaign today?" }
  ]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [additionalReq, setAdditionalReq] = useState("");
  const [reqSent, setReqSent] = useState(false);
  const [user, setUser] = useState(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Fetch session on mount
  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) setUser(d);
      })
      .catch(() => {});
  }, []);

  // Fetch chats and poll for new admin messages
  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      try {
        const res = await fetch("/api/chats");
        if (res.ok) {
          const data = await res.json();
          if (data.chats && data.chats.length > 0) {
            setMessages(data.chats);
          }
        }
      } catch {}
    };

    fetchChats();
    const interval = setInterval(fetchChats, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch submissions from API
  useEffect(() => {
    const fetchSubs = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/submissions");
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (e) {
        // Fallback mock data
        setSubmissions([
          { productName: "Apex GT-1", adType: "Product", status: "Under Review", budget: "$2,000 - $10,000", createdAt: Date.now() },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [user]);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;

    const userMsg = { role: "user", text: chatMsg, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    const textToSend = chatMsg;
    setChatMsg("");

    try {
      await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });
    } catch {}
  };

  const sendRequirement = async (e) => {
    e.preventDefault();
    if (!additionalReq.trim()) return;
    const reqText = `📋 Additional Requirement: ${additionalReq.trim()}`;
    
    // Optimistically update UI
    setMessages((prev) => [...prev, { role: "user", text: reqText, timestamp: new Date().toISOString() }]);
    const textToSend = reqText;
    setAdditionalReq("");

    try {
      await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });
      setReqSent(true);
      setTimeout(() => setReqSent(false), 3000);
    } catch {
      setReqSent(true);
      setTimeout(() => setReqSent(false), 3000);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} style={{ position: 'absolute', inset: 0 }} />
      <div className={styles.panel}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Your Inbox</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === "submissions" ? styles.activeTab : ""}`} onClick={() => setTab("submissions")}>
            Enrolls
          </button>
          <button className={`${styles.tab} ${tab === "chat" ? styles.activeTab : ""}`} onClick={() => setTab("chat")}>
            Chat
          </button>
          <button className={`${styles.tab} ${tab === "gifts" ? styles.activeTab : ""}`} onClick={() => setTab("gifts")}>
            Gifts
          </button>
        </div>

        <div className={styles.content}>
          {tab === "submissions" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ flex: 1, overflowY: "auto", paddingBottom: "16px" }}>
                {loading ? (
                  <div className={styles.emptyState}>Loading enrolls...</div>
                ) : submissions.length > 0 ? (
                  submissions.map((sub, i) => (
                    <div key={i} className={styles.submissionCard}>
                      <h3 className={styles.submissionTitle}>{sub.productName || "Unnamed Campaign"}</h3>
                      <span className={styles.submissionStatus}>{sub.status || "Pending Review"}</span>
                      <p className={styles.submissionDetail}>Type: {sub.adType || "Other"}</p>
                      <p className={styles.submissionDetail}>Budget: {sub.budget || "N/A"}</p>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>No campaigns submitted yet.</div>
                )}
              </div>
              
              <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" }}>
                <h4 style={{ fontSize: "0.9rem", color: "#fff", marginBottom: "8px", fontWeight: "600" }}>Your Additional Requirement</h4>
                {reqSent ? (
                  <div style={{ color: "#4ade80", fontSize: "0.85rem", padding: "8px 0" }}>
                    Requirement submitted successfully! Our team will review it.
                  </div>
                ) : (
                  <form onSubmit={sendRequirement} style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                    <textarea 
                      className={styles.chatInput} 
                      style={{ resize: "none", minHeight: "60px", fontFamily: "inherit" }}
                      placeholder="Enter any additional details or requirements for your campaign..." 
                      value={additionalReq}
                      onChange={(e) => setAdditionalReq(e.target.value)}
                    />
                    <button type="submit" className={styles.chatSend} style={{ width: "auto", padding: "8px 16px" }}>
                      Submit Requirement
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {tab === "chat" && (
            <div className={styles.chatArea}>
              <div className={styles.chatMessages}>
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "bot" || m.role === "admin" ? styles.msgBot : styles.msgUser}>
                    {m.text}
                  </div>
                ))}
              </div>
              <form onSubmit={sendChat} className={styles.chatInputWrap}>
                <input 
                  type="text" 
                  className={styles.chatInput} 
                  placeholder="Type a message..." 
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                />
                <button type="submit" className={styles.chatSend}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            </div>
          )}

          {tab === "gifts" && (
            <div>
              <div className={styles.giftCard}>
                <div className={styles.giftDeco} />
                <p className={styles.giftTitle}>Welcome Bonus</p>
                <h3 className={styles.giftAmount}>$50</h3>
                <div className={styles.giftCode}>CRUSH-50-XJ9</div>
              </div>
              <div style={{ marginTop: 16 }} className={styles.emptyState}>
                Apply this code on your next campaign!
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./admin.module.css";

const STATUS_LABELS = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
};
const STATUS_COLORS = {
  pending: "#F59E0B",
  in_review: "#3B82F6",
  approved: "#22C55E",
  rejected: "#EF4444",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Check session on mount
  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(d.authenticated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions");
      if (!res.ok) return;
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setCounts(data.counts || {});
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (authed) refresh();
  }, [authed, refresh]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (res.ok) {
        setAuthed(true);
        setEmail("");
        setPass("");
      } else {
        setError(data.error || "Login failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    setSubmissions([]);
    setCounts({});
  };

  const changeStatus = async (id, status) => {
    const res = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      refresh();
      if (detail?.id === id) setDetail({ ...detail, status });
    }
  };

  const saveNote = async () => {
    if (!detail) return;
    const res = await fetch(`/api/submissions/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: noteText }),
    });
    if (res.ok) {
      refresh();
      setDetail({ ...detail, adminNotes: noteText });
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    if (res.ok) {
      refresh();
      if (detail?.id === id) setDetail(null);
    }
  };

  const openDetail = (sub) => {
    setDetail(sub);
    setNoteText(sub.adminNotes || "");
  };

  const filtered = submissions.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (s.productName || "").toLowerCase().includes(q) ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ---- Loading ----
  if (loading) {
    return (
      <section className={`${styles.loginPage} bg-mesh noise`}>
        <div className={styles.loginCard} style={{ textAlign: "center", padding: 60 }}>
          <p style={{ color: "var(--text-muted)" }}>Checking session...</p>
        </div>
      </section>
    );
  }

  // ---- Login Screen ----
  if (!authed) {
    return (
      <section className={`${styles.loginPage} bg-mesh noise`}>
        <form onSubmit={handleLogin} className={styles.loginCard}>
          <div className={styles.loginLogo}>
            <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, color: "var(--accent-orange)" }}>
              <path d="M12 3 L21 20 L12 16 L3 20 Z" fill="currentColor" />
            </svg>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>
              ADMIN
            </span>
          </div>
          <h2 className={styles.loginTitle}>Sign in to dashboard</h2>
          {error && <p className={styles.loginError}>{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.loginInput}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className={styles.loginInput}
            required
            autoComplete="current-password"
          />
          <button type="submit" className={styles.loginBtn} disabled={loginLoading}>
            {loginLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    );
  }

  // ---- Dashboard ----
  return (
    <section className={styles.dashboard}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <h1 className={styles.dashTitle}>
          <span className="text-crush">Campaigns</span> Dashboard
        </h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: "Total", value: counts.total || 0, color: "var(--text-primary)" },
          { label: "Pending", value: counts.pending || 0, color: STATUS_COLORS.pending },
          { label: "In Review", value: counts.in_review || 0, color: STATUS_COLORS.in_review },
          { label: "Approved", value: counts.approved || 0, color: STATUS_COLORS.approved },
          { label: "Rejected", value: counts.rejected || 0, color: STATUS_COLORS.rejected },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <p className={styles.statCardValue} style={{ color: s.color }}>{s.value}</p>
            <p className={styles.statCardLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <div className={styles.filterPills}>
          {["all", "pending", "in_review", "approved", "rejected"].map((f) => (
            <button
              key={f}
              className={`${styles.filterPill} ${filter === f ? styles.filterPillActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
                  No submissions yet. Submit one via <a href="/add-yours" className="link-draw" style={{ color: "var(--accent-orange)" }}>Add Yours</a>.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr key={sub.id} onClick={() => openDetail(sub)} className={styles.tableRow}>
                  <td className={styles.campName}>{sub.productName || "—"}</td>
                  <td>{sub.name || "—"}</td>
                  <td>{sub.category || "—"}</td>
                  <td>
                    <span className={styles.statusPill} style={{ borderColor: STATUS_COLORS[sub.status], color: STATUS_COLORS[sub.status] }}>
                      {STATUS_LABELS[sub.status] || sub.status}
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                      {sub.status === "pending" && (
                        <button className={styles.actionBtn} style={{ color: STATUS_COLORS.in_review }} onClick={() => changeStatus(sub.id, "in_review")}>Review</button>
                      )}
                      {(sub.status === "pending" || sub.status === "in_review") && (
                        <button className={styles.actionBtn} style={{ color: STATUS_COLORS.approved }} onClick={() => changeStatus(sub.id, "approved")}>Approve</button>
                      )}
                      {sub.status !== "rejected" && (
                        <button className={styles.actionBtn} style={{ color: STATUS_COLORS.rejected }} onClick={() => changeStatus(sub.id, "rejected")}>Reject</button>
                      )}
                      <button className={styles.actionBtn} style={{ color: "var(--text-muted)" }} onClick={() => handleDelete(sub.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      {detail && (
        <div className={styles.drawerBackdrop} onClick={() => setDetail(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3 className={styles.drawerTitle}>{detail.productName || "Campaign"}</h3>
              <button className={styles.drawerClose} onClick={() => setDetail(null)}>✕</button>
            </div>

            <div className={styles.drawerBody}>
              {/* Status */}
              <div className={styles.drawerField}>
                <span className={styles.drawerLabel}>Status</span>
                <span className={styles.statusPill} style={{ borderColor: STATUS_COLORS[detail.status], color: STATUS_COLORS[detail.status] }}>
                  {STATUS_LABELS[detail.status]}
                </span>
              </div>

              {/* All submission fields */}
              {Object.entries(detail).filter(([k]) => !["id","status","createdAt","updatedAt","adminNotes"].includes(k)).map(([k, v]) => (
                <div key={k} className={styles.drawerField}>
                  <span className={styles.drawerLabel}>{k}</span>
                  <span className={styles.drawerValue}>{Array.isArray(v) ? v.join(", ") : v}</span>
                </div>
              ))}

              {/* Notes */}
              <div className={styles.drawerField}>
                <span className={styles.drawerLabel}>Internal Notes</span>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className={styles.noteArea}
                  placeholder="Add internal notes..."
                />
                <button className={styles.saveNoteBtn} onClick={saveNote}>Save Note</button>
              </div>

              {/* Action buttons */}
              <div className={styles.drawerActions}>
                {detail.status !== "approved" && (
                  <button onClick={() => changeStatus(detail.id, "approved")} className={styles.drawerActionBtn} style={{ background: STATUS_COLORS.approved }}>Approve</button>
                )}
                {detail.status !== "rejected" && (
                  <button onClick={() => changeStatus(detail.id, "rejected")} className={styles.drawerActionBtn} style={{ background: STATUS_COLORS.rejected }}>Reject</button>
                )}
                {detail.status !== "in_review" && (
                  <button onClick={() => changeStatus(detail.id, "in_review")} className={styles.drawerActionBtn} style={{ background: STATUS_COLORS.in_review }}>Move to Review</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

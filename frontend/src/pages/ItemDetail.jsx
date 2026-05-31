import React, { useEffect, useRef, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

export default function ItemDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimText, setClaimText] = useState("");
  const [claimMsg, setClaimMsg] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const claimTextareaRef = useRef(null);

  const isOwner = Boolean(item && user && item.reported_by === user.id);
  const canClaim = Boolean(
    item &&
    user &&
    !isAdmin &&
    !isOwner &&
    !["claimed", "resolved"].includes(item.status),
  );

  useEffect(() => {
    axios
      .get(`/api/items/${id}`)
      .then((r) => setItem(r.data))
      .catch(() => navigate("/items"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (searchParams.get("claim") === "true" && canClaim) {
      const claimSection = document.getElementById("claim-section");
      if (claimSection) {
        claimSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      window.setTimeout(() => {
        claimTextareaRef.current?.focus();
      }, 450);
    }
  }, [searchParams, canClaim]);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!claimText.trim()) return;
    setClaimLoading(true);
    setClaimMsg(null);
    try {
      await axios.post("/api/claims", {
        item_id: item.id,
        description: claimText,
      });
      setClaimMsg({
        type: "success",
        text: "Claim submitted. An admin will review it shortly.",
      });
      setClaimText("");
    } catch (err) {
      setClaimMsg({
        type: "error",
        text: err.response?.data?.error || "Failed to submit claim.",
      });
    } finally {
      setClaimLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/items/${id}`);
      navigate("/items");
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed.");
    }
  };

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  if (!item) return null;

  const dateStr = new Date(item.date_lost_found).toLocaleDateString("en-ZM", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: "1.5rem" }}>
          <Link to="/items" className="btn btn-outline btn-sm">
            <Icon name="arrowLeft" size={14} /> Back to Items
          </Link>
        </div>

        <div className="detail-grid">
          {/* Left: image + description */}
          <div>
            {item.image_url ? (
              <img
                className="detail-img"
                src={`http://localhost:5000${item.image_url}`}
                alt={item.title}
              />
            ) : (
              <div className="detail-placeholder">
                <Icon name="package" />
              </div>
            )}

            <div className="info-panel" style={{ marginTop: "1.5rem" }}>
              <h2
                style={{
                  marginBottom: "0.8rem",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                }}
              >
                Description
              </h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                {item.description}
              </p>
            </div>

            {/* Claim form */}
            {!user && (
              <div
                className="alert alert-success"
                style={{ marginTop: "1.5rem" }}
              >
                <Link to="/login">Login</Link> or{" "}
                <Link to="/register">register</Link> to claim this item.
              </div>
            )}

            {canClaim && (
              <div
                id="claim-section"
                style={{
                  background: "white",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow)",
                  padding: "1.5rem",
                  marginTop: "1.5rem",
                }}
              >
                <h2
                  style={{
                    marginBottom: "0.8rem",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}
                >
                  Submit a Claim
                </h2>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                    marginBottom: "1rem",
                  }}
                >
                  Describe why this item belongs to you (e.g. unique features,
                  when/where you lost it).
                </p>
                {claimMsg && (
                  <div className={`alert alert-${claimMsg.type}`}>
                    {claimMsg.text}
                  </div>
                )}
                <form onSubmit={handleClaim}>
                  <div className="form-group">
                    <textarea
                      ref={claimTextareaRef}
                      className="form-control"
                      rows={4}
                      placeholder="e.g. My laptop has a sticker of the Zambia flag on the lid, and a scratch on the bottom-right corner..."
                      value={claimText}
                      onChange={(e) => setClaimText(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={claimLoading}
                  >
                    {claimLoading ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit Claim <Icon name="upload" size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right: info panel */}
          <div>
            <div className="detail-info-card">
              <div className="detail-meta">
                <span className={`badge badge-${item.status}`}>
                  {item.status}
                </span>
                <span
                  style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                >
                  #{item.id}
                </span>
              </div>
              <h1 className="detail-title">{item.title}</h1>

              <div className="detail-field">
                <label>Category</label>
                <p style={{ textTransform: "capitalize" }}>{item.category}</p>
              </div>
              <div className="detail-field">
                <label>Location</label>
                <p className="detail-line">
                  <Icon name="mapPin" size={16} /> {item.location}
                </p>
              </div>
              <div className="detail-field">
                <label>Date {item.status === "found" ? "Found" : "Lost"}</label>
                <p className="detail-line">
                  <Icon name="calendar" size={16} /> {dateStr}
                </p>
              </div>
              <div className="detail-field">
                <label>Reported By</label>
                <p className="detail-line">
                  <Icon name="user" size={16} /> {item.reporter_name}
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {item.reporter_email}
                </p>
                {item.reporter_phone && (
                  <p
                    className="detail-line"
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    <Icon name="phone" size={15} /> {item.reporter_phone}
                  </p>
                )}
              </div>
              <div className="detail-field">
                <label>Posted On</label>
                <p>
                  {new Date(item.created_at).toLocaleDateString("en-ZM", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Owner / Admin actions */}
              {(isOwner || isAdmin) && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "1.2rem",
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to={`/items/${item.id}/edit`}
                    className="btn btn-outline btn-sm"
                  >
                    <Icon name="edit" size={14} /> Edit
                  </Link>
                  {!deleteConfirm ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteConfirm(true)}
                    >
                      <Icon name="trash" size={14} /> Delete
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={handleDelete}
                      >
                        Confirm Delete
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

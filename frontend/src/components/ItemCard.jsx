import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";

const CATEGORY_ICONS = {
  electronics: "laptop",
  Electronics: "laptop",
  clothing: "shirt",
  Clothing: "shirt",
  accessories: "glasses",
  Accessories: "glasses",
  documents: "file",
  Documents: "file",
  keys: "key",
  Keys: "key",
  bags: "bag",
  Bag: "bag",
  books: "book",
  Book: "book",
  Wallet: "wallet",
  Phone: "phone",
  Laptop: "laptop",
  Jewelry: "glasses",
  Stationery: "file",
  "Personal Items": "package",
  other: "package",
  Other: "package",
};

export default function ItemCard({ item }) {
  const { user, isAdmin } = useAuth();
  const [itemStatus, setItemStatus] = useState(item.status);
  const [resolving, setResolving] = useState(false);
  const icon = CATEGORY_ICONS[item.category] || "package";
  const dateStr = new Date(item.date_lost_found).toLocaleDateString("en-ZM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    setItemStatus(item.status);
  }, [item.status]);

  const isOwner = Boolean(user && item.reported_by === user.id);
  const canClaim = Boolean(
    user &&
    !isAdmin &&
    !isOwner &&
    !["claimed", "resolved"].includes(itemStatus),
  );
  const canResolve = Boolean(isAdmin && itemStatus === "claimed");

  const handleResolve = async () => {
    if (!canResolve || resolving) return;
    setResolving(true);
    try {
      await axios.put(`/api/items/${item.id}/mark-resolved`);
      setItemStatus("resolved");
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="card">
      {item.image_url ? (
        <img
          className="card-img"
          src={`http://localhost:5000${item.image_url}`}
          alt={item.title}
        />
      ) : (
        <div className="card-img-placeholder">
          <Icon name={icon} />
        </div>
      )}
      <div className="card-body">
        <div style={{ marginBottom: "0.5rem" }}>
          <span className={`badge badge-${itemStatus}`}>{itemStatus}</span>
        </div>
        <div className="card-title">{item.title}</div>
        <div className="card-meta">
          <span className="meta-item">
            <Icon name="mapPin" size={14} /> {item.location}
          </span>
          <span className="meta-item">
            <Icon name="calendar" size={14} /> {dateStr}
          </span>
        </div>
        <div className="card-desc">{item.description}</div>
        <div className="card-footer">
          <span className="card-category">
            <Icon name={icon} size={16} /> {item.category}
          </span>
          <div className="card-actions">
            <Link to={`/items/${item.id}`} className="btn btn-outline btn-sm">
              View <Icon name="arrowRight" size={14} />
            </Link>
            {canClaim && (
              <Link
                to={`/items/${item.id}?claim=true`}
                className="btn btn-primary btn-sm"
              >
                Claim <Icon name="upload" size={14} />
              </Link>
            )}
            {canResolve && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleResolve}
                disabled={resolving}
              >
                {resolving ? "Resolving..." : "Resolve"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

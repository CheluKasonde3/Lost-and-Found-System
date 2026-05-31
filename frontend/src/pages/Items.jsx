import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ItemCard from "../components/ItemCard";
import Icon from "../components/Icon";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Documents",
  "Keys",
  "Bags",
  "Books",
  "Wallet",
  "Phone",
  "Laptop",
  "Jewelry",
  "Stationery",
  "Personal Items",
  "Other",
];

export default function Items() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const statusOptions = ["all", "lost", "found", "claimed", "resolved"];

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (status) params.status = status;
    if (category) params.category = category;
    if (search) params.search = search;

    axios
      .get("/api/items", { params })
      .then((r) => {
        setItems(r.data.items);
        setTotal(r.data.total);
        setPages(r.data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, category, search, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
    window.scrollTo(0, 0);
  };

  const setStatusFilter = (nextStatus) => {
    const next = new URLSearchParams(searchParams);
    if (nextStatus === "all") next.delete("status");
    else next.set("status", nextStatus);
    next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>Browse Items</h1>
          <p>
            {total} item{total !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>
      <div className="container">
        {/* Filters */}
        <div className="filters-bar">
          <input
            className="filter-input"
            placeholder="Search by title, description, location..."
            value={search}
            onChange={(e) => setFilter("search", e.target.value)}
          />
          <select
            className="filter-select"
            value={status}
            onChange={(e) => setFilter("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            className="filter-select"
            value={category}
            onChange={(e) => setFilter("category", e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-pills">
          {statusOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-pill ${status === option || (!status && option === "all") ? "active" : ""}`}
              onClick={() => setStatusFilter(option)}
            >
              {option === "all"
                ? "All"
                : option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="search" />
            </div>
            <p>No items match your search. Try changing the filters.</p>
          </div>
        ) : (
          <>
            <div className="items-grid">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

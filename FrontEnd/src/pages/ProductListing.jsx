import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../utils/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import "../styles/ProductListing.css";

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "",
    minPrice: "",
    maxPrice: "",
    size: "",
  });

  const categories = [
    "All",
    "Men's Clothing",
    "Women's Clothing",
    "Kids' Clothing",
    "Perfumes",
    "Watches",
    "Sunglasses",
    "Bags & Wallets",
    "Jewelry",
    "Footwear",
    "Accessories",
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (value && value !== "All") params.append(key, value);
      });

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "All") params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      sort: "",
      minPrice: "",
      maxPrice: "",
      size: "",
    });
    setSearchParams({});
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v && v !== "All",
  ).length;

  return (
    <div className="product-listing">
      <div className="container">
        {/* Page Header */}
        <div className="listing-header">
          <div className="listing-title">
            <h1>{filters.category || "All Products"}</h1>
            <p>{products.length} products found</p>
          </div>
          <button
            className="filter-toggle"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            🎛️ Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

        <div className="listing-content">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${filtersOpen ? "open" : ""}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="clear-filters">
                  Clear All
                </button>
              )}
              <button
                className="close-filters"
                onClick={() => setFiltersOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="filter-group">
              <label>Category</label>
              <div className="category-list">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`category-item ${filters.category === cat || (cat === "All" && !filters.category) ? "active" : ""}`}
                    onClick={() =>
                      handleFilterChange("category", cat === "All" ? "" : cat)
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Size */}
            <div className="filter-group">
              <label>Size</label>
              <div className="size-options">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${filters.size === size ? "active" : ""}`}
                    onClick={() =>
                      handleFilterChange(
                        "size",
                        filters.size === size ? "" : size,
                      )
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="products-main">
            {/* Sort Bar */}
            <div className="sort-bar">
              <span className="results-count">{products.length} Results</span>
              <div className="sort-options">
                <label>Sort by:</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                >
                  <option value="">Relevance</option>
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="discount">Best Discount</option>
                </select>
              </div>
            </div>

            {loading ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className="no-products">
                <span className="no-products-icon">🔍</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {filtersOpen && (
        <div className="filter-overlay" onClick={() => setFiltersOpen(false)} />
      )}
    </div>
  );
};

export default ProductListing;

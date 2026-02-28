import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, formatPrice } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      showToast("Error fetching products", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      showToast("Product deleted successfully", "success");
    } catch (error) {
      showToast("Error deleting product", "error");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="page-header">
          <h1>All Products ({products.length})</h1>
          <Link to="/admin/add-product" className="btn btn-primary">
            <span className="btn-icon">➕</span>
            <span className="btn-text">Add Product</span>
          </Link>
        </div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your search or add new products</p>
          </div>
        ) : (
          <>
            {/* ==================== DESKTOP TABLE ==================== */}
            <div className="table-container products-desktop-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="table-img"
                        />
                      </td>
                      <td>
                        <div className="product-info-cell">
                          <p className="product-name">{product.name}</p>
                          <p className="product-brand">{product.brand}</p>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <div className="price-cell">
                          <span className="current-price">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="original-price">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`stock-badge ${
                            product.stock === 0
                              ? "out"
                              : product.stock <= 10
                                ? "low"
                                : "in"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <span className="rating-cell">
                          ⭐ {product.rating?.toFixed(1) || "0.0"} (
                          {product.numReviews || 0})
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link
                            to={`/admin/edit-product/${product._id}`}
                            className="btn btn-sm btn-secondary"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            className="btn btn-sm btn-danger"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ==================== MOBILE CARDS ==================== */}
            <div className="products-mobile-grid">
              {filteredProducts.map((product) => (
                <div className="product-mobile-card" key={product._id}>
                  <div className="product-mobile-card-header">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="product-mobile-img"
                    />
                    <div className="product-mobile-card-info">
                      <h4 className="product-mobile-name">{product.name}</h4>
                      <p className="product-mobile-brand">{product.brand}</p>
                      <p className="product-mobile-category">
                        {product.category}
                      </p>
                      <div className="product-mobile-price">
                        <span className="current-price">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="original-price">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="product-mobile-card-details">
                    <div className="detail-item">
                      <span className="detail-label">Stock:</span>
                      <span
                        className={`stock-badge ${
                          product.stock === 0
                            ? "out"
                            : product.stock <= 10
                              ? "low"
                              : "in"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Rating:</span>
                      <span className="rating-cell">
                        ⭐ {product.rating?.toFixed(1) || "0.0"} (
                        {product.numReviews || 0})
                      </span>
                    </div>
                  </div>

                  <div className="product-mobile-card-actions">
                    <Link
                      to={`/admin/edit-product/${product._id}`}
                      className="btn btn-edit"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="btn btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Mobile Floating Add Button */}
        <div className="admin-mobile-fab">
          <Link
            to="/admin/add-product"
            className="btn btn-add"
            title="Add Product"
          >
            ➕
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;

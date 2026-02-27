import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    subCategory: "",
    brand: "",
    stock: "",
    sizes: [],
    colors: [],
    tags: "",
    isFeatured: false,
    isNewArrival: false,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [colorInput, setColorInput] = useState({ name: "", code: "#000000" });

  const categories = [
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

  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "Free Size",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const fetchProduct = useCallback(async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || "",
        category: product.category,
        subCategory: product.subCategory || "",
        brand: product.brand || "",
        stock: product.stock,
        sizes: product.sizes || [],
        colors: product.colors || [],
        tags: product.tags?.join(", ") || "",
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
      });
      setExistingImages(product.images);
    } catch (error) {
      showToast("Error loading product", "error");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addColor = () => {
    if (colorInput.name && colorInput.code) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { ...colorInput }],
      }));
      setColorInput({ name: "", code: "#000000" });
    }
  };

  const removeColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      showToast("Maximum 5 images allowed", "error");
      return;
    }
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "sizes" || key === "colors") {
        data.append(key, JSON.stringify(formData[key]));
      } else if (key === "tags") {
        data.append(
          key,
          JSON.stringify(
            formData[key]
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t),
          ),
        );
      } else {
        data.append(key, formData[key]);
      }
    });

    images.forEach((image) => {
      data.append("images", image);
    });

    try {
      await api.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Product updated successfully! 🎉", "success");
      navigate("/admin/products");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error updating product",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="page-header">
          <h1>Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sub Category</label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Pricing & Stock</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Selling Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Original Price (₹)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Variants</h3>

            <div className="form-group">
              <label>Available Sizes</label>
              <div className="size-checkboxes">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-checkbox ${formData.sizes.includes(size) ? "active" : ""}`}
                    onClick={() => handleSizeToggle(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Colors</label>
              <div className="color-input-row">
                <input
                  type="text"
                  placeholder="Color name"
                  value={colorInput.name}
                  onChange={(e) =>
                    setColorInput({ ...colorInput, name: e.target.value })
                  }
                />
                <input
                  type="color"
                  value={colorInput.code}
                  onChange={(e) =>
                    setColorInput({ ...colorInput, code: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="btn btn-secondary btn-sm"
                >
                  Add
                </button>
              </div>
              {formData.colors.length > 0 && (
                <div className="color-tags">
                  {formData.colors.map((color, index) => (
                    <span key={index} className="color-tag">
                      <span
                        className="color-dot"
                        style={{ backgroundColor: color.code }}
                      ></span>
                      {color.name}
                      <button type="button" onClick={() => removeColor(index)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Images</h3>

            <div className="form-group">
              <label>Current Images</label>
              <div className="image-preview">
                {existingImages.map((img, index) => (
                  <div key={index} className="preview-item">
                    <img src={img} alt={`Current ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Upload New Images (replaces existing)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              {images.length > 0 && (
                <div className="image-preview">
                  {images.map((file, index) => (
                    <div key={index} className="preview-item">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                      />
                      <span className="new-badge">New</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Options</h3>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                <span>Featured Product</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={formData.isNewArrival}
                  onChange={handleChange}
                />
                <span>New Arrival</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="btn btn-secondary btn-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

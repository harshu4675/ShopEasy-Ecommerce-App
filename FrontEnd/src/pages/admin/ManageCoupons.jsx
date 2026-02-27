import React, { useState, useEffect } from "react";
import { api, formatPrice } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get("/coupons/all");
      setCoupons(response.data);
    } catch (error) {
      showToast("Error fetching coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      validFrom: "",
      validUntil: "",
      usageLimit: "",
      isActive: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      validFrom: coupon.validFrom.split("T")[0],
      validUntil: coupon.validUntil.split("T")[0],
      usageLimit: coupon.usageLimit || "",
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, formData);
        showToast("Coupon updated successfully! 🎉", "success");
      } else {
        await api.post("/coupons", formData);
        showToast("Coupon created successfully! 🎉", "success");
      }
      resetForm();
      fetchCoupons();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error saving coupon",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(coupons.filter((c) => c._id !== id));
      showToast("Coupon deleted successfully", "success");
    } catch (error) {
      showToast("Error deleting coupon", "error");
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      fetchCoupons();
      showToast(
        `Coupon ${coupon.isActive ? "deactivated" : "activated"}`,
        "success",
      );
    } catch (error) {
      showToast("Error updating coupon", "error");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="page-header">
          <h1>Manage Coupons ({coupons.length})</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            ➕ Add Coupon
          </button>
        </div>

        {/* Coupon Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h2>
                <button onClick={resetForm} className="modal-close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="coupon-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Coupon Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., SAVE20"
                      required
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount Type *</label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      required
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g., Get 20% off on all products"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Value *</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleChange}
                      placeholder="e.g., 20"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Min Order Amount (₹)</label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Discount (₹)</label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleChange}
                      placeholder="e.g., 200"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Valid From *</label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Valid Until *</label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Usage Limit</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleChange}
                      placeholder="Unlimited"
                      min="1"
                    />
                  </div>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCoupon
                        ? "Update Coupon"
                        : "Create Coupon"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🎟️</span>
            <h3>No coupons yet</h3>
            <p>Create your first coupon to offer discounts to customers</p>
          </div>
        ) : (
          <div className="coupons-admin-grid">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className={`coupon-admin-card ${!coupon.isActive ? "inactive" : ""}`}
              >
                <div className="coupon-admin-header">
                  <div className="coupon-code-badge">{coupon.code}</div>
                  <div
                    className={`coupon-status ${coupon.isActive ? "active" : "inactive"}`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="coupon-discount-display">
                  {coupon.discountType === "percentage" ? (
                    <span>{coupon.discountValue}% OFF</span>
                  ) : (
                    <span>{formatPrice(coupon.discountValue)} OFF</span>
                  )}
                </div>

                <p className="coupon-description">{coupon.description}</p>

                <div className="coupon-details">
                  {coupon.minOrderAmount > 0 && (
                    <p>Min Order: {formatPrice(coupon.minOrderAmount)}</p>
                  )}
                  {coupon.maxDiscountAmount && (
                    <p>Max Discount: {formatPrice(coupon.maxDiscountAmount)}</p>
                  )}
                  <p>
                    Valid: {formatDate(coupon.validFrom)} -{" "}
                    {formatDate(coupon.validUntil)}
                  </p>
                  <p>
                    Used: {coupon.usedCount}{" "}
                    {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "times"}
                  </p>
                </div>

                <div className="coupon-admin-actions">
                  <button
                    onClick={() => toggleCouponStatus(coupon)}
                    className={`btn btn-sm ${coupon.isActive ? "btn-secondary" : "btn-success"}`}
                  >
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="btn btn-sm btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCoupon(coupon._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCoupons;

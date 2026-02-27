import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews/all");
      setReviews(response.data);
    } catch (error) {
      showToast("Error fetching reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await api.delete(`/reviews/${id}`);
      setReviews(reviews.filter((r) => r._id !== id));
      showToast("Review deleted successfully", "success");
    } catch (error) {
      showToast("Error deleting review", "error");
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
          <h1>All Reviews ({reviews.length})</h1>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-state">
            <h3>No reviews found</h3>
          </div>
        ) : (
          <div className="reviews-admin-grid">
            {reviews.map((review) => (
              <div key={review._id} className="review-admin-card">
                <div className="review-admin-header">
                  <div className="review-user-info">
                    <div className="user-avatar">
                      {review.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="user-name">
                        {review.user?.name || "Unknown"}
                      </p>
                      <p className="user-email">
                        {review.user?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="review-rating">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                </div>

                <div className="review-product">
                  <strong>Product:</strong> {review.product?.name || "Unknown"}
                </div>

                {review.title && (
                  <h4 className="review-title">{review.title}</h4>
                )}
                <p className="review-comment">{review.comment}</p>

                {review.image && (
                  <div className="review-image">
                    <img src={review.image} alt="Review" />
                  </div>
                )}

                <div className="review-admin-footer">
                  <span className="review-date">
                    {formatDate(review.createdAt)}
                  </span>
                  {review.isVerifiedPurchase && (
                    <span className="verified-badge">✓ Verified</span>
                  )}
                  <button
                    onClick={() => deleteReview(review._id)}
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

export default AllReviews;

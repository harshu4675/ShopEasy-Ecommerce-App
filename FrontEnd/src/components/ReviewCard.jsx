import React from "react";
import "../styles/ReviewCard.css";

const ReviewCard = ({ review, onDelete, isAdmin }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-user">
          <div className="review-avatar">
            {review.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="review-user-info">
            <h4>{review.user.name}</h4>
            {review.isVerifiedPurchase && (
              <span className="verified-badge">✓ Verified Purchase</span>
            )}
          </div>
        </div>
        <div className="review-meta">
          <div className="review-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= review.rating ? "star filled" : "star"}
              >
                ★
              </span>
            ))}
          </div>
          <span className="review-date">{formatDate(review.createdAt)}</span>
        </div>
      </div>

      {review.title && <h5 className="review-title">{review.title}</h5>}
      <p className="review-comment">{review.comment}</p>

      {review.image && (
        <div className="review-image">
          <img src={review.image} alt="Review" />
        </div>
      )}

      {isAdmin && (
        <button
          onClick={() => onDelete(review._id)}
          className="btn btn-danger btn-sm"
        >
          Delete Review
        </button>
      )}
    </div>
  );
};

export default ReviewCard;

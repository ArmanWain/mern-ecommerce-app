import { useEffect, useState } from "react";
import StarRatings from "react-star-ratings";
import { useCanUserReviewQuery, useSubmitReviewMutation } from "../../redux/api/productsApi";
import { toast } from "react-hot-toast";

const NewReview = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasPostedReview, setHasPostedReview] = useState(false);

  const [submitReview, { error, isSuccess }] = useSubmitReviewMutation();

  const { data } = useCanUserReviewQuery(productId);
  const canReview = data?.canReview;

  useEffect(() => {
    if (data) {
      setHasPostedReview(data?.hasPostedReview);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error(error.data?.message);
    }

    if (isSuccess) {
      toast.dismiss();
      toast.success("Review Posted");
    }
  }, [error, isSuccess]);

  const submitHandler = () => {
    if (rating < 1) {
      toast.dismiss();
      toast.error("Rating must be between 1 and 5 stars");
      return;
    }

    const reviewData = { rating, comment, productId };
    submitReview(reviewData);

    if (!hasPostedReview) {
      setHasPostedReview(true);
    }
  };

  return (
    <div>
      {canReview && (
        <button
          id="review_btn"
          type="button"
          className="btn btn-primary mt-4"
          data-bs-toggle="modal"
          data-bs-target="#ratingModal"
        >
          {hasPostedReview ? "Change Your Review" : "Submit Your Review"}
        </button>
      )}

      <div className="row mt-2 mb-5">
        <div className="rating w-50 mt-0">
          <div
            className="modal fade"
            id="ratingModal"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="ratingModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="ratingModalLabel">
                    Submit Review
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <StarRatings
                    rating={rating}
                    starRatedColor="#ffb829"
                    numberOfStars={5}
                    name="rating"
                    changeRating={(rating) => setRating(rating)}
                  />

                  <textarea
                    name="review"
                    id="review"
                    className="form-control mt-4"
                    placeholder="Enter your comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>

                  <button
                    id="new_review_btn"
                    className="btn w-100 my-4 px-4"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    disabled={rating < 1 || !comment}
                    onClick={submitHandler}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewReview;

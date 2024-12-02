import StarRatings from "react-star-ratings";

const ReviewList = ({ reviews }) => {
  return (
    <div className="reviews w-75">
      <h3 className="mt-5">Reviews:</h3>
      <hr />
      {reviews?.map((review) => (
        <div key={review?._id} className="review-card my-3">
          <div className="d-flex">
            <div className="review-avatar-container">
              <img
                src={
                  review?.user?.avatar
                    ? review?.user?.avatar?.url
                    : "/images/default_avatar.jpg"
                }
                alt="User Name"
                width="50"
                height="50"
                className="rounded-circle object-fit-contain"
              />
            </div>
            <div>
              <StarRatings
                rating={review?.rating}
                starRatedColor="#ffb829"
                numberOfStars={5}
                name="rating"
                starDimension="24px"
                starSpacing="1px"
              />
              <p className="review_user">by {review.user?.name}</p>
              <p className="review_comment">{review?.comment}</p>
            </div>
          </div>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default ReviewList;

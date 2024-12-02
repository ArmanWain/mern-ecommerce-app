import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency"
import StarRatings from "react-star-ratings";

const ProductCard = ({ product, columnSize }) => {
  return (
    <div className={`col-sm-12 col-md-6 col-lg-${columnSize} my-3`}>
      <div className="position-relative">
        <Link to={`/products/${product?._id}`} className="top-0 left-0 w-100 h-100 position-absolute z-2" />
        <div className="card p-3 rounded px-0 px-xl-3">
          <img
            className="card-img-top mx-auto"
            src={
              product?.images[0]
                ? product?.images[0]?.url
                : "/images/default_product.png"
            }
            alt={product?.name}
          />
          <div className="card-body ps-3 pb-0 d-flex justify-content-center flex-column">
            <h5 className="card-title">
              <Link
                to={`/products/${product?._id}`}
                className="position-relative z-3"
              >{product?.name}
              </Link>
            </h5>
            <div className="mt-auto d-flex align-items-center">
              <StarRatings
                rating={product?.rating}
                starRatedColor="#ffb829"
                numberOfStars={5}
                name="rating"
                starDimension="22px"
                starSpacing="0px"
              />
              <span id="no_of_reviews" className="pt-1 ps-2">
                ({product?.numOfReviews})
              </span>
            </div>
            <p className="card-text my-2">{formatCurrency(product?.priceCents, { replaceZeros: true })}</p>
            <Link
              to={`/products/${product?._id}`}
              id="view_btn"
              className="btn btn-block position-relative z-3"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

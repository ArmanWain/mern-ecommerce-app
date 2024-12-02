import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productApi, useGetProductDetailsQuery } from "../../redux/api/productsApi";
import { useCanAddToCartMutation } from "../../redux/api/cartApi";
import { toast } from "react-hot-toast";
import Loader from "../layout/Loader";
import StarRatings from "react-star-ratings";
import { useDispatch, useSelector } from "react-redux";
import { setCartItem } from "../../redux/features/cartSlice";
import MetaData from "../layout/MetaData";
import NewReview from "../reviews/NewReview";
import ReviewList from "../reviews/ReviewList";
import NotFound from "../layout/NotFound";
import { formatCurrency } from "../../utils/currency";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);
  const currentItem = cartItems?.find(cartItem => params?.id === cartItem.productId);
  const cartQuantity = currentItem?.quantity ?? 0;

  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const { data, isLoading, isError } = useGetProductDetailsQuery(params?.id);
  const product = data?.product;

  const [canAddToCart, { isLoading: canAddToCartLoading, isSuccess: canAddToCartSuccess, error: canAddToCartError }] = useCanAddToCartMutation();

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    setActiveImg(
      product?.images[0]
        ? product?.images[0]?.url
        : "/images/default_product.png"
    );
  }, [product]);

  useEffect(() => {
    if (canAddToCartSuccess) {
      const cartItem = {
        productId: product?._id,
        quantity: quantity + cartQuantity,
        priceCents: product?.priceCents,
        name: product?.name,
        description: product?.description,
        image: product?.images[0]?.url
      };

      dispatch(setCartItem(cartItem));

      toast.dismiss();
      toast.success("Item added to cart");

      navigate("/cart");
    }
  }, [canAddToCartSuccess])

  useEffect(() => {
    if (canAddToCartError) {
      toast.dismiss();
      toast.error(canAddToCartError?.data?.message);

      // Refetch product data
      dispatch(productApi.util.invalidateTags(["Product"]));
    }
  }, [canAddToCartError]);

  if (data && !canAddToCartSuccess) {
    if (quantity + cartQuantity > product?.stock && quantity !== 1) {
      let maxQuantity = product?.stock - cartQuantity;
      let newQuantity = maxQuantity;
      newQuantity > 0 ? "" : newQuantity = 1;

      if (maxQuantity <= 0) {
        toast.dismiss();
        toast.error("You cannot add this item to your cart")
        setQuantity(newQuantity);
        return;
      }

      toast.dismiss();
      toast.error(`You cannot add more than ${product?.stock - cartQuantity} of this item to your cart`)
      setQuantity(newQuantity);
    }
  }

  const increaseQuantity = () => {
    if (quantity + cartQuantity >= 99) return;

    const qty = quantity + 1;
    setQuantity(qty);
    setIsInputFocused(false);
  };

  const decreaseQuantity = () => {
    if (quantity <= 1) return;

    const qty = quantity - 1;
    setQuantity(qty);
    setIsInputFocused(false);
  };

  const addToCartDisabled = product?.stock < 1 || quantity + cartQuantity > product?.stock || quantity + cartQuantity > 99 || quantity < 1;

  const handleQuantityChange = (e) => {
    const count = document.querySelector(".count");
    if (count.valueAsNumber + cartQuantity > 99 || count.valueAsNumber < 1) return;
    setQuantity(Math.round(Number(e.target.value)))
    setIsInputFocused(true);
  }

  const submitHandler = () => {
    if (addToCartDisabled) return;
    canAddToCart({ id: params?.id, quantity, cartQuantity });
  }

  if (isError) return <NotFound />;

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title={product?.name} />
      <div className="row d-flex justify-content-around">
        <div className="col-12 col-lg-5 img-fluid" id="product_image">
          <div className="p-3">
            <img
              className="d-block w-100 object-fit-contain"
              src={activeImg}
              alt={product?.name}
              height="390"
            />
          </div>
          <div className="row justify-content-start mt-5">
            {product?.images?.map((img) => (
              <div key={img?._id} className="col-2 ms-4 mt-2">
                <Link role="button">
                  <img
                    className={`d-block border rounded p-2 cursor-pointer object-fit-contain ${img?.url === activeImg ? "border-warning" : ""
                      } `}
                    height="100"
                    width="100"
                    src={img?.url}
                    alt={img?.url}
                    onClick={() => setActiveImg(img.url)}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 col-lg-5 mt-5">
          <h3>{product?.name}</h3>
          <p id="product_id">Product # {product?._id}</p>

          <hr />

          <div className="d-flex align-items-center">
            <StarRatings
              rating={product?.rating}
              starRatedColor="#ffb829"
              numberOfStars={5}
              name="rating"
              starDimension="24px"
              starSpacing="1px"
            />
            <span id="no-of-reviews" className="ps-2">
              ({product?.numOfReviews} {product?.numOfReviews === 1 ? "Review" : "Reviews"})
            </span>
          </div>
          <hr />

          <p id="product_price">{formatCurrency(product?.priceCents)}</p>
          <div className="stockCounter d-inline">
            <button type="button" className="minus" onClick={decreaseQuantity} disabled={canAddToCartLoading}>
              -
            </button>
            <input
              type="number"
              min="1"
              max="99"
              className="form-control count d-inline"
              value={quantity}
              onChange={handleQuantityChange}
              disabled={canAddToCartLoading}
              autoFocus={isInputFocused}
            />
            <button type="button" className="plus" onClick={increaseQuantity} disabled={canAddToCartLoading}>
              +
            </button>
          </div>
          <button
            type="button"
            id="cart_btn"
            className="btn btn-primary d-inline ms-4"
            disabled={addToCartDisabled || canAddToCartLoading}
            onClick={submitHandler}
          >
            Add to Cart
          </button>

          <hr />

          <p>
            Status:
            <span
              id="stock_status"
              className={product?.stock > 0 ? "greenColor" : "redColor"}
            >
              {product?.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </p>

          <hr />

          <h4 className="mt-2">Description:</h4>
          <p>{product?.description}</p>
          <hr />
          <p id="product_seller mb-3">
            Sold by: <strong>{product?.seller}</strong>
          </p>

          {isAuthenticated ? (
            <NewReview productId={product?._id} />
          ) :
            ""
          }
        </div>
      </div>
      {product?.reviews?.length > 0 && (
        <ReviewList reviews={product?.reviews} />
      )}
    </>
  );
};

export default ProductDetails;

import { Fragment, useEffect } from "react";
import MetaData from "../layout/MetaData";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCartItem, removeCartItem, replaceCart, replaceCheckoutError } from "../../redux/features/cartSlice";
import { useVerifyCartMutation, useCanProceedWithCheckoutMutation } from "../../redux/api/cartApi";
import { useGetProductStockMutation } from "../../redux/api/productsApi";
import Loader from "../layout/Loader";
import { getCartQuantity } from "../../utils/cart";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-hot-toast";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, checkoutError } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [verifyCart, { isLoading: verifyCartLoading, error: verifyCartError }] = useVerifyCartMutation();

  const [getProductStock, { data: productStockData, isLoading: productStockLoading, error: productStockError }] = useGetProductStockMutation();

  const [canProceedWithCheckout, { isSuccess: canProceedWithCheckoutSuccess, isLoading: canProceedWithCheckoutLoading, error: canProceedWithCheckoutError }] = useCanProceedWithCheckoutMutation();

  const setItemToCart = (item, newQuantity) => {
    const cartItem = {
      productId: item.productId,
      quantity: newQuantity,
      priceCents: item.priceCents,
      name: item.name,
      description: item.description,
      image: item.image,
      errors: item.errors || null
    };

    dispatch(setCartItem(cartItem));
    getProductStock(cartItem.productId);
  };

  useEffect(() => {
    // Don't get updated products for this checkout error because we already have them
    if (checkoutError.itemsChanged) {
      dispatch(replaceCheckoutError({}));

      return;
    }

    // Remove errors from cart items and verify the cart
    const cartItemsCopy = cartItems.map((item) => {
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceCents: item.priceCents,
        name: item.name,
        description: item.description,
        image: item.image,
      }
    })

    verifyCart(cartItemsCopy);
  }, [])

  useEffect(() => {
    if (verifyCartError) {
      const errorData = verifyCartError?.data;
      const errorType = errorData?.type;

      if (errorType?.itemsChanged) {
        dispatch(replaceCart(errorType?.itemsChanged?.updatedItems));
      }

      toast.dismiss();
      toast.error(errorData?.message);
    }
  }, [verifyCartError])

  useEffect(() => {
    if (productStockData) {
      const updatedItem = cartItems?.find((cartItem) => cartItem.productId === productStockData?.productId);
      const updatedItemCopy = JSON.parse(JSON.stringify(updatedItem));

      if (updatedItemCopy?.errors) {
        delete updatedItemCopy?.errors?.noStock;
        delete updatedItemCopy?.errors?.notEnoughStock;

        let numberOfErrors = Object.keys(updatedItemCopy.errors)?.length;

        if (numberOfErrors === 0) {
          delete updatedItemCopy.errors;
        }
      }

      if (updatedItemCopy?.quantity > productStockData?.stock) {
        toast.dismiss();

        productStockData?.stock === 0 ?
          toast.error(`${updatedItemCopy?.name} is out of stock`) :
          toast.error(`You cannot order more than ${productStockData?.stock} "${updatedItemCopy?.name}"`)

        dispatch(setCartItem({ ...updatedItemCopy, quantity: productStockData?.stock }));
      } else {
        dispatch(setCartItem(updatedItemCopy));
      }
    }
  }, [productStockData])

  useEffect(() => {
    if (productStockError?.data?.type?.productNotFound) {
      dispatch(removeCartItem(productStockError.data.type.productNotFound.productId))
    }

    if (productStockError) {
      toast.dismiss();
      toast.error(productStockError?.data?.message);
    }
  }, [productStockError])

  useEffect(() => {
    if (canProceedWithCheckoutSuccess) {
      toast.dismiss();
      navigate("/shipping");
    }
  }, [canProceedWithCheckoutSuccess])

  useEffect(() => {
    if (canProceedWithCheckoutError) {
      const errorData = canProceedWithCheckoutError?.data;
      const errorType = errorData?.type;

      if (errorType?.itemsChanged) {
        dispatch(replaceCart(errorType?.itemsChanged?.updatedItems));
      }

      toast.dismiss();
      toast.error(errorData?.message);
    }
  }, [canProceedWithCheckoutError])

  const cartQuantity = getCartQuantity(cartItems);

  const increaseQuantity = (item) => {
    const newQuantity = item?.quantity + 1;

    if (newQuantity > 99) {
      toast.dismiss();
      toast.error("You cannot order more than 99 of this item");

      return;
    }

    setItemToCart(item, newQuantity);
  };

  const decreaseQuantity = (item) => {
    const newQuantity = item?.quantity - 1;

    if (newQuantity <= 0) return;

    setItemToCart(item, newQuantity);
  };

  const removeCartItemHandler = (id) => {
    dispatch(removeCartItem(id));
  };

  const handleQuantityChange = (e, item, i) => {
    const count = document.querySelector(`.count-${i + 1}`);

    if (count.valueAsNumber > item?.stock) {
      toast.dismiss();
      toast.error(`You cannot order more than ${item.stock} of this item`)
      return
    };

    if (count.valueAsNumber > 99) {
      toast.dismiss();
      toast.error("You cannot order more than 99 of this item");
      return;
    };

    if (e.target.value === '0') {
      setItemToCart(item, 1)
      return;
    };

    setItemToCart(item, Math.round(Number(e.target.value)))
  }

  const getItemsPriceCents = () => {
    let itemsPriceCents = 0;
    cartItems?.forEach((item) => {
      itemsPriceCents += item.priceCents * item.quantity;
    })

    return itemsPriceCents
  };

  const isWarning = Boolean(cartItems?.find((item) => item?.errors));

  const canCheckout = cartQuantity >= 1 && !isWarning && !productStockLoading;

  const checkoutHandler = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const newCart = cartItems.filter(item => item.quantity > 0);

    if (newCart.length !== cartItems.length) {
      dispatch(replaceCart(newCart));
      canProceedWithCheckout(newCart);
      return;
    }

    canProceedWithCheckout(cartItems);
  };

  const confirmNotFound = (item) => {
    dispatch(removeCartItem(item.productId));
  }

  const confirmNewName = (item) => {
    const itemCopy = JSON.parse(JSON.stringify(item));

    let numberOfErrors = Object.keys(itemCopy.errors).length;

    if (numberOfErrors === 1) {
      delete itemCopy.errors;
    } else {
      delete itemCopy.errors.incorrectName;
    }

    dispatch(setCartItem(itemCopy));
  }

  const confirmNewDescription = (item) => {
    const itemCopy = JSON.parse(JSON.stringify(item));

    let numberOfErrors = Object.keys(itemCopy.errors).length;

    if (numberOfErrors === 1) {
      delete itemCopy.errors;
    } else {
      delete itemCopy.errors.incorrectDescription;
    }

    dispatch(setCartItem(itemCopy));
  }

  const confirmNewPrice = (item) => {
    const itemCopy = JSON.parse(JSON.stringify(item));

    let numberOfErrors = Object.keys(itemCopy.errors).length;

    if (numberOfErrors === 1) {
      delete itemCopy.errors;
    } else {
      delete itemCopy.errors.incorrectPriceCents;
    }

    dispatch(setCartItem(itemCopy));
  }

  const confirmNoStock = (item) => {
    dispatch(removeCartItem(item.productId));
  }

  const confirmNotEnoughStock = (item) => {
    const itemCopy = JSON.parse(JSON.stringify(item));

    let numberOfErrors = Object.keys(itemCopy.errors).length;

    if (numberOfErrors === 1) {
      delete itemCopy.errors;
    } else {
      delete itemCopy.errors.notEnoughStock;
    }

    dispatch(setCartItem(itemCopy));
  }

  if (verifyCartLoading || canProceedWithCheckoutLoading) return <Loader />;

  return (
    <>
      <MetaData title={"Your Cart"} />
      {cartItems?.length === 0 ? (
        <h2 className="mt-5">Your Cart is Empty</h2>
      ) : (
        <>
          <h2 className="mt-5">
            Your Cart: <b>{cartQuantity} items</b>
          </h2>

          <div className="row d-flex justify-content-between">
            <div className="col-12 col-lg-8">
              {cartItems?.map((item, i) => (
                <Fragment key={item?.productId}>
                  <hr />
                  <div className="cart-item">
                    <div className="row">
                      <div className="col-4 col-lg-2 pt-2 d-flex justify-content-center">
                        <img
                          src={item?.image}
                          alt="Item Image"
                          height="90"
                        />
                      </div>
                      <div className="col-5 col-lg-4">
                        <Link to={`/products/${item?.productId}`}>
                          {item?.name}
                        </Link>
                      </div>
                      <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                        <p id="card_item_price">{formatCurrency(item?.priceCents)}</p>
                      </div>
                      <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                        <div className="stockCounter d-inline">
                          <button
                            type="button" className="plus"
                            onClick={() => decreaseQuantity(item)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            step="1"
                            className={`form-control count count-${i + 1} d-inline`}
                            value={item?.quantity}
                            onChange={(e) => handleQuantityChange(e, item, i)}
                          />
                          <button
                            type="button" className="plus"
                            onClick={() => increaseQuantity(item)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                        <i
                          id="delete_cart_item"
                          className="fa fa-trash btn btn-danger"
                          onClick={() => removeCartItemHandler(item?.productId)}
                        ></i>
                      </div>
                    </div>
                    {item?.errors &&
                      <div className="row mt-4">
                        <div className="col-lg-2"></div>
                        <div className="col-12 col-lg-10 text-danger d-flex flex-column gap-4">
                          {item?.errors?.productNotFound &&
                            <div className="d-flex gap-2 align-items-center cart-warning-container">
                              <i className="fa fa-triangle-exclamation fs-4"></i>
                              <p>
                                This product no longer exists
                              </p>
                              <button
                                className="confirm-warning ms-2"
                                onClick={() => confirmNotFound(item)}
                              >
                                Confirm
                              </button>
                            </div>
                          }
                          {item?.errors?.incorrectName &&
                            <div className="d-flex gap-2 align-items-center cart-warning-container">
                              <i className="fa fa-triangle-exclamation fs-4"></i>
                              <p>
                                This product&apos;s name has changed
                              </p>
                              <button
                                className="confirm-warning ms-2"
                                onClick={() => confirmNewName(item)}
                              >
                                Confirm
                              </button>
                            </div>
                          }
                          {item?.errors?.incorrectDescription &&
                            <div className="d-flex gap-2 align-items-center cart-warning-container">
                              <i className="fa fa-triangle-exclamation fs-4"></i>
                              <p>
                                This product&apos;s description has changed
                              </p>
                              <button
                                className="confirm-warning ms-2"
                                onClick={() => confirmNewDescription(item)}
                              >
                                Confirm
                              </button>
                            </div>
                          }
                          {item?.errors?.incorrectPriceCents &&
                            <div className="d-flex gap-2 align-items-center cart-warning-container">
                              <i className="fa fa-triangle-exclamation fs-4"></i>
                              <p>
                                This product&apos;s price has changed from {formatCurrency(item?.errors?.incorrectPriceCents)} to {formatCurrency(item?.priceCents)}
                              </p>
                              <button
                                className="confirm-warning ms-2"
                                onClick={() => confirmNewPrice(item)}
                              >
                                Confirm
                              </button>
                            </div>
                          }
                          {item?.errors?.noStock &&
                            <div className="d-flex gap-2 align-items-center cart-warning-container">
                              <i className="fa fa-triangle-exclamation fs-4"></i>
                              <p>
                                This product is out of stock
                              </p>
                              <button
                                className="confirm-warning ms-2"
                                onClick={() => confirmNoStock(item)}
                              >
                                Confirm
                              </button>
                            </div>
                          }
                          {item?.errors?.notEnoughStock &&
                            <div className="d-flex gap-2 align-items-center cart-warning-container">
                              <i className="fa fa-triangle-exclamation fs-4"></i>
                              <p>
                                You cannot order more than {item?.quantity} of this product
                              </p>
                              <button
                                className="confirm-warning ms-2"
                                onClick={() => confirmNotEnoughStock(item)}
                              >
                                Confirm
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                  <hr />
                </Fragment>
              ))}
            </div>

            <div className="col-12 col-lg-4 my-3">
              <div id="order_summary">
                <h4>Order Summary</h4>
                <hr />
                <p>
                  Items ({cartQuantity}):
                  <span className="order-summary-values">
                    {formatCurrency(getItemsPriceCents())}
                  </span>
                </p>
                <p className="small">
                  Taxes and shipping calculated at checkout
                </p>
                <p className="small">
                  Orders of $30 or more are eligible for free shipping
                </p>
                <hr />
                <button
                  id="checkout_btn"
                  className="btn btn-primary w-100"
                  onClick={checkoutHandler}
                  disabled={!canCheckout}
                >
                  Check out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;

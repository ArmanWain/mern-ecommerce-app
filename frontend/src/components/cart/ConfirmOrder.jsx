import { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { savePaymentAmountsCents, saveShippingInfo, replaceCart, replaceCheckoutError, saveDeliveryOptions, deleteDeliveryOptions } from "../../redux/features/cartSlice";
import { useLazyGetCheckoutDetailsQuery, useCanProceedWithCheckoutMutation } from "../../redux/api/cartApi";
import { formatCurrency } from "../../utils/currency";
import { getCartQuantity, getCheckoutPricesCents } from "../../utils/cart";
import { getDeliveryDate } from "../../utils/dates";
import CheckoutSteps from "./CheckoutSteps";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";

const ConfirmOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, shippingInfo, deliveryOptions, paymentAmountsCents } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [deliveryOption, setDeliveryOption] = useState(shippingInfo?.deliveryOption);

  const [getCheckoutDetails, { data: checkoutDetailsData, isLoading: checkoutDetailsLoading, error: checkoutDetailsError }] = useLazyGetCheckoutDetailsQuery();

  const [canProceedWithCheckout, { isLoading: canProceedWithCheckoutLoading, isSuccess: canProceedWithCheckoutSuccess, error: canProceedWithCheckoutError }] = useCanProceedWithCheckoutMutation();

  useEffect(() => {
    const minutesElapsed = (Date.now() - deliveryOptions?.timestamp) / (1000 * 60);

    // Get delivery options and tax percent if we don't have them or more than 30 minutes have elapsed since we got them
    if (!deliveryOptions?.options || minutesElapsed > 30) {
      getCheckoutDetails({ cartItems, shippingInfo });
    }
  }, [])

  useEffect(() => {
    if (checkoutDetailsData) {
      let option;

      if (!deliveryOption) {
        setDeliveryOption(checkoutDetailsData.deliveryOptions[0]);
        option = checkoutDetailsData.deliveryOptions[0];
      } else {
        const isDeliveryOptionValid = Boolean(checkoutDetailsData.deliveryOptions?.find((option) => option.id === deliveryOption.id));

        if (!isDeliveryOptionValid) {
          setDeliveryOption(checkoutDetailsData.deliveryOptions[0]);
          option = checkoutDetailsData.deliveryOptions[0];
        } else {
          option = deliveryOption;
        }
      }

      const checkoutPricesCents = getCheckoutPricesCents(cartItems, option.priceCents, checkoutDetailsData?.percentTax);
      dispatch(savePaymentAmountsCents({ ...checkoutPricesCents }));
      dispatch(saveDeliveryOptions({ options: checkoutDetailsData.deliveryOptions, timestamp: Date.now() }));
      dispatch(saveShippingInfo({ ...shippingInfo, deliveryOption: option }))
    }
  }, [checkoutDetailsData])

  useEffect(() => {
    if (checkoutDetailsError) {
      toast.dismiss();
      toast.error(checkoutDetailsError?.data?.message);

      navigate("/cart");
    }
  }, [checkoutDetailsError])

  useEffect(() => {
    if (canProceedWithCheckoutSuccess) {
      dispatch(saveShippingInfo({ ...shippingInfo, deliveryOption }))
      navigate("/payment_method");
    }
  }, [canProceedWithCheckoutSuccess])

  useEffect(() => {
    if (canProceedWithCheckoutError) {
      const errorData = canProceedWithCheckoutError?.data;
      const errorType = errorData?.type;

      if (errorType?.itemsChanged) {
        dispatch(replaceCart(errorType?.itemsChanged?.updatedItems));
        dispatch(replaceCheckoutError({ itemsChanged: true }));
      }

      toast.dismiss();
      toast.error(errorData?.message);

      navigate("/cart")
    }
  }, [canProceedWithCheckoutError])

  const cartQuantity = getCartQuantity(cartItems);

  const changeDeliveryOption = (option) => {
    setDeliveryOption(option);

    const checkoutPricesCents = getCheckoutPricesCents(cartItems, option.priceCents, paymentAmountsCents?.percentTax);
    dispatch(savePaymentAmountsCents({ ...checkoutPricesCents }));
    dispatch(saveShippingInfo({ ...shippingInfo, deliveryOption: option }))
  };

  const proceedToPayment = () => {
    const minutesElapsed = (Date.now() - deliveryOptions?.timestamp) / (1000 * 60);
    if (minutesElapsed > 30) {
      dispatch(deleteDeliveryOptions());

      toast.dismiss();
      toast.error("Session has expired");

      navigate("/cart")

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

  if (checkoutDetailsLoading || canProceedWithCheckoutLoading) return <Loader />;

  return (
    <>
      <MetaData title={"Confirm Order Info"} />
      <CheckoutSteps shipping confirmOrder />
      <div className="row d-flex justify-content-between">
        <div className="col-12 col-lg-8 mt-5 order-confirm">
          <h4 className="mb-3">Shipping Info</h4>
          <p>
            <b>Name:</b> {user?.name}
          </p>
          <p>
            <b>Phone:</b> {shippingInfo?.phoneNo}
          </p>
          <p className="mb-4">
            <b>Address:</b> {shippingInfo?.address}, {shippingInfo?.city},{" "}
            {shippingInfo?.zipCode}, {shippingInfo?.country}
          </p>

          <hr />
          <h4 className="mt-4 mb-3 delivery-date">Delivery date: {getDeliveryDate(new Date(), deliveryOption?.deliveryDays, shippingInfo?.country)}</h4>

          <div className="row d-flex">
            <div className="col-12 col-lg-8 item-container">
              {cartItems?.map((item) => (
                <div key={item?.productId} className="cart-item mb-4 mt-0">
                  <div className="row">
                    <div className="col-4 col-lg-2 pt-2 d-flex justify-content-center">
                      <img
                        className="object-fit-contain"
                        src={item?.image}
                        alt="Item Image"
                        width="70px"
                        height="70px"
                      />
                    </div>

                    <div className="col-8 col-lg-9">
                      <Link to={`/products/${item?.productId}`}>{item?.name}</Link>
                      <p className="m-0">
                        {item?.quantity} x {formatCurrency(item?.priceCents)} ={" "}
                        <b>{formatCurrency(item?.quantity * item.priceCents)}</b>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-12 col-lg-4 delivery-options mt-3 mt-lg-0">
              <p className="m-0 mb-2"><b>Choose a delivery option:</b></p>
              {deliveryOptions?.options?.map((option, i) =>
                <div key={option?.id} className="delivery-option" onClick={() => changeDeliveryOption(option)}>
                  <input type="radio"
                    className="delivery-option-input"
                    id={`delivery-option-${i + 1}`}
                    name="delivery-options"
                    checked={option?.id === deliveryOption?.id ? true : false}
                    onChange={() => changeDeliveryOption(option)} />
                  <div>
                    <label className="delivery-option-date d-block" htmlFor={`delivery-option-${i + 1}`}>
                      {getDeliveryDate(new Date(), option.deliveryDays, shippingInfo?.country)}
                    </label>
                    <label className="delivery-option-price" htmlFor={`delivery-option-${i + 1}`}>
                      {option.priceCents === 0 ?
                        `FREE ${option.name}`
                        :
                        `${formatCurrency(option.priceCents)} ${option.name}`
                      }
                    </label>
                  </div>
                </div>)}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 my-5">
          <div id="order_summary">
            <h4>Order Summary</h4>
            <hr />
            <p>
              Items ({cartQuantity || 0}):
              <span className="order-summary-values">{formatCurrency(paymentAmountsCents?.itemsPriceCents)}</span>
            </p>
            <p>
              Shipping:
              <span className="order-summary-values">{formatCurrency(paymentAmountsCents?.shippingPriceCents)}</span>
            </p>
            <p>
              Tax: <span className="order-summary-values">{formatCurrency(paymentAmountsCents?.taxPriceCents)}</span>
            </p>
            <hr />
            <p>
              Total: <span className="order-summary-values">{formatCurrency(paymentAmountsCents?.totalPriceCents)}</span>
            </p>

            <hr />
            <button
              to="/payment_method"
              id="checkout_btn"
              className="btn btn-primary w-100"
              onClick={proceedToPayment}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmOrder;

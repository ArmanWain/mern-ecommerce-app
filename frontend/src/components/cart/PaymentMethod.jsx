import { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import { useSelector, useDispatch } from "react-redux";
import CheckoutSteps from "./CheckoutSteps";
import { useCreateNewOrderMutation, useStripeCheckoutSessionMutation } from "../../redux/api/orderApi";
import { deleteDeliveryOptions, replaceCart, replaceCheckoutError } from "../../redux/features/cartSlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PaymentMethod = () => {
  const [method, setMethod] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, shippingInfo, deliveryOptions, paymentAmountsCents } = useSelector((state) => state.cart);

  const [createNewOrder, { error: CODError, isSuccess: isCODSuccess }] = useCreateNewOrderMutation();

  const [stripeCheckoutSession, { data: checkoutData, isSuccess: isStripeSuccess, error: stripeError },] = useStripeCheckoutSessionMutation();

  useEffect(() => {
    if (isCODSuccess) {
      navigate("/me/orders?order_success=true");
    }
  }, [isCODSuccess]);

  useEffect(() => {
    if (isStripeSuccess) {
      window.location.href = checkoutData?.url;
    }
  }, [isStripeSuccess]);

  useEffect(() => {
    if (CODError || stripeError) {
      const errorData = CODError?.data || stripeError?.data;
      const errorType = errorData?.type;

      if (errorType?.CODWrongCountry) {
        toast.dismiss();
        toast.error(errorData?.message);

        return;
      }

      if (errorType?.itemsChanged) {
        dispatch(replaceCart(errorType?.itemsChanged?.updatedItems));
        dispatch(replaceCheckoutError({ itemsChanged: true }));
      } else if (errorType?.incorrectDeliveryOption || errorType?.incorrectPaymentAmount) {
        dispatch(deleteDeliveryOptions());
      }

      toast.dismiss();
      toast.error(errorData?.message);

      navigate("/cart")
    }
  }, [CODError, stripeError]);

  const submitHandler = (e) => {
    e.preventDefault();

    const minutesElapsed = (Date.now() - deliveryOptions?.timestamp) / (1000 * 60);
    if (minutesElapsed > 30) {
      dispatch(deleteDeliveryOptions());

      toast.dismiss();
      toast.error("Session has expired");

      navigate("/cart")

      return;
    }

    if (method === "COD") {
      // Create COD order
      const orderData = {
        shippingInfo,
        orderItems: cartItems,
        paymentInfo: {
          method: "COD",
          amounts: {
            itemsPriceCents: paymentAmountsCents?.itemsPriceCents,
            shippingPriceCents: paymentAmountsCents?.shippingPriceCents,
            taxAmountCents: paymentAmountsCents?.taxPriceCents,
            totalAmountCents: paymentAmountsCents?.totalPriceCents
          },
        },
      };

      createNewOrder(orderData);
    }

    if (method === "Card") {
      // Create Stripe checkout session
      const orderData = {
        shippingInfo,
        orderItems: cartItems,
        paymentInfo: {
          method: "Card",
          amounts: {
            itemsPriceCents: paymentAmountsCents?.itemsPriceCents,
            shippingPriceCents: paymentAmountsCents?.shippingPriceCents,
            taxAmountCents: paymentAmountsCents?.taxPriceCents,
            totalAmountCents: paymentAmountsCents?.totalPriceCents
          }
        }
      };

      stripeCheckoutSession(orderData);
    }
  };

  return (
    <>
      <MetaData title={"Payment Method"} />
      <CheckoutSteps shipping confirmOrder payment />

      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow rounded bg-body" onSubmit={submitHandler}>
            <h2 className="mb-4">Select Payment Method</h2>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="codradio"
                value="COD"
                onChange={() => setMethod("COD")}
              />
              <label className="form-check-label" htmlFor="codradio">
                Cash on Delivery
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="cardradio"
                value="Card"
                onChange={() => setMethod("Card")}
              />
              <label className="form-check-label" htmlFor="cardradio">
                Card - VISA, MasterCard
              </label>
            </div>

            <button
              id="shipping_btn"
              type="submit"
              className="btn py-2 w-100"
            >
              CONTINUE
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;

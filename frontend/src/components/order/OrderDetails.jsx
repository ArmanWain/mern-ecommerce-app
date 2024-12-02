import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";
import { getDeliveryDate } from "../../utils/dates";
import Loader from "../layout/Loader";
import NotFound from "../layout/NotFound";
import MetaData from "../layout/MetaData";
import { useOrderDetailsQuery } from "../../redux/api/orderApi";

const OrderDetails = () => {
  const params = useParams();
  const { data, isLoading, isError } = useOrderDetailsQuery(params?.id);
  const order = data?.order || {};

  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    user,
    orderStatus,
    deliveredAt,
    createdAt
  } = order;

  const isPaid = paymentInfo?.status === "Paid" ? true : false;

  if (isError) return <NotFound />;

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title={"Order Details"} />
      <div className="row d-flex justify-content-center">
        <div className="col-12 col-lg-9 mt-5 order-details d-flex flex-column align-items-center">
          <div>
            <div className="d-flex justify-content-between align-items-center mt-5 mb-4">
              <h3 className="mb-0">Order Details</h3>
              <Link className="btn btn-success" to={`/invoice/order/${order?._id}`}>
                <i className="fa fa-print"></i> Invoice
              </Link>
            </div>
            <table className="table table-striped table-bordered order-details-table">
              <tbody>
                <tr>
                  <th scope="row">ID</th>
                  <td>{order?._id}</td>
                </tr>
                <tr>
                  <th scope="row">Status</th>
                  <td
                    className={
                      String(orderStatus).includes("Delivered")
                        ? "greenColor"
                        : "redColor"
                    }
                  >
                    <b>{orderStatus}</b>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Date</th>
                  <td>{order?.createdAt ? format(new Date(order?.createdAt), 'MMMM d, yyyy') : ""}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="mt-5 mb-4">Shipping Info</h3>
            <table className="table table-striped table-bordered order-details-table">
              <tbody>
                <tr>
                  <th scope="row">Name</th>
                  <td>{user?.name}</td>
                </tr>
                <tr>
                  <th scope="row">Phone No.</th>
                  <td>{shippingInfo?.phoneNo}</td>
                </tr>
                <tr>
                  <th scope="row">Address</th>
                  <td>
                    {shippingInfo?.address}, {shippingInfo?.city}, {shippingInfo?.state}, {""}
                    {shippingInfo?.zipCode}, {shippingInfo?.country}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Delivery Option</th>
                  <td>
                    {shippingInfo?.deliveryOption?.name}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Delivery Date</th>
                  <td>
                    {deliveredAt ?
                      format(deliveredAt, "MMMM d, yyyy") :
                      getDeliveryDate(createdAt, shippingInfo?.deliveryOption?.deliveryDays, shippingInfo?.country, { fullDate: true })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="mt-5 mb-4">Payment Info</h3>
            <table className="table table-striped table-bordered order-details-table">
              <tbody>
                <tr>
                  <th scope="row">Status</th>
                  <td className={isPaid ? "greenColor" : "redColor"}>
                    <b>{paymentInfo?.status}</b>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Method</th>
                  <td>{order?.paymentInfo?.method}</td>
                </tr>
                {paymentInfo?.id ?
                  <tr>
                    <th scope="row">Stripe ID</th>
                    <td>{paymentInfo?.id}</td>
                  </tr>
                  :
                  ""
                }
                <tr>
                  <th scope="row">Amount</th>
                  <td>{formatCurrency(paymentInfo?.amounts?.totalAmountCents)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="order-details-items">
            <h3 className="mt-5 my-4">Order Items:</h3>
            <hr />
            <div className="cart-item my-5 d-flex flex-column gap-5">
              {orderItems?.map((item) => (
                <div key={item?.productId} className="row mx-0">
                  <div className="col-2 col-lg-2 pt-1 px-0">
                    <img
                      src={item?.image}
                      alt={item?.name}
                      className="object-fit-contain"
                      height="70"
                      width="70"
                    />
                  </div>

                  <div className="col-10 col-lg-6 order-item-name">
                    <Link to={`/products/${item?.productId}`}>{item?.name}</Link>
                  </div>

                  <div className="col-2 d-lg-none"></div>

                  <div className="col-3 col-lg-2 mt-4 mt-lg-0 p-lg-0">
                    <p className="mx-0 text-start text-lg-center">{formatCurrency(item?.priceCents)}</p>
                  </div>

                  <div className="col-4 col-lg-2 mt-4 mt-lg-0 px-0">
                    <p className="mx-0 text-start text-lg-end">{item?.quantity} Piece(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <hr />
        </div>
      </div>
    </>
  );
};

export default OrderDetails;

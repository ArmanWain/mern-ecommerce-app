import { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import { format } from "date-fns"
import { formatCurrency } from "../../utils/currency";
import { getDeliveryDate } from "../../utils/dates";
import { Link, useParams } from "react-router-dom";
import MetaData from "../layout/MetaData";
import NotFound from "../layout/NotFound";
import AdminLayout from "../layout/AdminLayout";
import { useOrderDetailsQuery, useUpdateOrderMutation } from "../../redux/api/orderApi";

const AdminOrderDetails = () => {
  const [status, setStatus] = useState("");

  const params = useParams();
  const { data: queryData, isError: isQueryError, isLoading: isQueryLoading } = useOrderDetailsQuery(params?.id);
  const order = queryData?.order || {};

  const [updateOrder, { error: updateOrderError, isSuccess: updateOrderisSuccess }] = useUpdateOrderMutation();

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

  useEffect(() => {
    if (orderStatus) {
      setStatus(orderStatus);
    }
  }, [orderStatus]);

  useEffect(() => {
    if (updateOrderError) {
      toast.dismiss();
      toast.error(updateOrderError.data?.message);
    }

    if (updateOrderisSuccess) {
      toast.dismiss();
      toast.success("Order Updated");
    }
  }, [updateOrderError, updateOrderisSuccess]);

  if (isQueryError) return <NotFound />;

  if (isQueryLoading) return <Loader />;

  const updateOrderHandler = (id) => {
    const data = { status };
    updateOrder({ id, body: data });
  };

  return (
    <AdminLayout>
      <MetaData title={"Order Details"} />
      <div className="row d-flex justify-content-around">
        <div className="col-12 col-lg-8 order-details d-flex flex-column align-items-center">
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0">Order Details</h3>
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

        <div className="col-12 col-lg-3 mt-5">
          <h4 className="mb-4">Status</h4>

          <div className="mb-3">
            <select
              className="form-select"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <button
            className="btn btn-primary w-100"
            onClick={() => updateOrderHandler(order?._id)}
          >
            Update Status
          </button>

          <h4 className="mt-5 mb-3">Order Invoice</h4>
          <Link
            to={`/invoice/order/${order?._id}`}
            className="btn btn-success w-100"
          >
            <i className="fa fa-print"></i> Generate Invoice
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetails;

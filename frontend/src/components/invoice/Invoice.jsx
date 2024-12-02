import "./invoice.css";
import { useParams, Link } from "react-router-dom";
import NotFound from "../layout/NotFound";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useOrderDetailsQuery } from "../../redux/api/orderApi";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format } from "date-fns"
import { formatCurrency } from "../../utils/currency";

const Invoice = () => {
  const params = useParams();
  const { data, isLoading, isError } = useOrderDetailsQuery(params?.id);
  const order = data?.order || {};

  const { shippingInfo, orderItems, paymentInfo, user } = order;

  const handleDownload = async () => {
    const input = document.getElementById("order_invoice");
    const canvas = await html2canvas(input, {
      quality: 3,
      scale: 3
    })
    const imgData = canvas.toDataURL("image/jpeg, 1.0");

    const pdf = new jsPDF('p', 'mm', [850, 1100]);

    pdf.addImage(imgData, 'JPEG', 0, 0, 850, 1100);
    pdf.save(`invoice_${order?._id}.pdf`);
  };

  if (isError) return <NotFound />;

  if (isLoading) return <Loader />;

  return (
    <div className="d-flex justify-content-center">
      <MetaData title="Order Invoice" />
      <div className="order-invoice my-5">
        <div className="row d-flex justify-content-center mb-5">
          <button className="btn btn-success col-md-5" onClick={handleDownload}>
            <i className="fa fa-print"></i> Download Invoice
          </button>
        </div>
        <div id="order_invoice" className="p-4 border border-secondary d-flex flex-column">
          <header className="clearfix">
            <div id="logo">
              <img src="/images/invoice-logo.png" alt="Company Logo" />
            </div>
            <h1>INVOICE # {order?._id}</h1>
            <div id="company" className="clearfix">
              <div>Shopico</div>
              <div>
                120 Bremner Boulevard
                <br />
                Toronto, ON, M5J 0A1
                <br />
                Canada
              </div>
              <div>(416) 309-5300</div>
              <div>
                <Link to="mailto:info@shopico.com">info@shopico.com</Link>
              </div>
            </div>
            <div id="customer">
              <div>
                <span>NAME</span> {user?.name}
              </div>
              <div>
                <span>EMAIL</span> {user?.email}
              </div>
              <div>
                <span>PHONE</span> {shippingInfo?.phoneNo}
              </div>
              <div>
                <span>ADDRESS</span> {" "}
                {shippingInfo?.address}
                <br />
                <span /> {" "}{shippingInfo?.city}, {shippingInfo?.state}, {shippingInfo?.zipCode}
                <br />
                <span /> {" "}{shippingInfo?.country}
              </div>
              <div>
                <span>DATE</span>{" "}
                {order?.createdAt ? format(new Date(order?.createdAt), 'MMMM d, yyyy') : ""}
              </div>
              <div>
                <span>STATUS</span> {paymentInfo?.status}
              </div>
            </div>
          </header>
          <main className="flex-grow-1 d-flex flex-column justify-content-between">
            <table>
              <thead>
                <tr>
                  <th className="th-id">ID</th>
                  <th className="th-name">NAME</th>
                  <th className="th-price">PRICE</th>
                  <th className="th-qty">QTY</th>
                  <th className="th-total">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {orderItems?.map((item) => (
                  <tr key={item?.productId}>
                    <td className="id">{item?.productId}</td>
                    <td className="name">{item?.name}</td>
                    <td className="price">{formatCurrency(item?.priceCents)}</td>
                    <td className="qty">{item?.quantity}</td>
                    <td className="total">{formatCurrency(item?.priceCents * item?.quantity)}</td>
                  </tr>
                ))}

                <tr className="subtotal-row">
                  <td colSpan="4">
                    <b>SUBTOTAL</b>
                  </td>
                  <td className="total">{formatCurrency(order?.paymentInfo?.amounts?.itemsPriceCents)}</td>
                </tr>

                <tr className="shipping-row">
                  <td colSpan="4">
                    <b>SHIPPING</b>
                  </td>
                  <td className="total">{formatCurrency(order?.paymentInfo?.amounts?.shippingPriceCents)}</td>
                </tr>

                <tr className="tax-row">
                  <td colSpan="4">
                    <b>TAX</b>
                  </td>
                  <td className="total">{formatCurrency(order?.paymentInfo?.amounts?.taxAmountCents)}</td>
                </tr>

                <tr className="grand-total-row">
                  <td colSpan="4" className="grand-total total">
                    <b>GRAND TOTAL</b>
                  </td>
                  <td className="grand-total-amount total">
                    <span>{formatCurrency(order?.paymentInfo?.amounts?.totalAmountCents)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div id="notices">
              <div>NOTICE:</div>
              <div className="notice">
                A finance charge of 1.5% will be made on unpaid balances after
                30 days.
              </div>
            </div>
          </main>
          <footer>
            Invoice was created on a computer and is valid without the
            signature.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Invoice;

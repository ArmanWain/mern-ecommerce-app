import { useEffect, useState } from "react";
import { useLazyMyOrdersQuery } from "../../redux/api/orderApi";
import { productApi } from "../../redux/api/productsApi";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import DataTable from 'react-data-table-component';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MetaData from "../layout/MetaData";
import { useDispatch } from "react-redux";
import { format, startOfDay, endOfDay } from "date-fns"
import { clearCart } from "../../redux/features/cartSlice";
import { formatCurrency } from "../../utils/currency";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MyOrders = () => {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState(null);
  const [startDate, setStartDate] = useState(startOfDay(new Date()).setDate(1));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));

  const [getMyOrders, { data, isLoading, error }] = useLazyMyOrdersQuery();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const orderSuccess = searchParams.get("order_success");

  useEffect(() => {
    if (startDate && endDate && !data) {
      getMyOrders({
        startDate: startOfDay(new Date(startDate)).toISOString(),
        endDate: endOfDay(new Date(endDate)).toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    if (data && filter) {
      setOrders(data?.orders?.filter((order) => order._id.toLowerCase().startsWith(filter.toLowerCase())));

      return;
    }

    if (data) {
      setOrders(data?.orders);
    }
  }, [data])

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error(error.data?.message);
    }

    if (orderSuccess) {
      toast.dismiss();
      toast.success("Order Created");

      dispatch(clearCart());
      // Invalidate CanUserReview tag because the user can now review the purchased products
      dispatch(productApi.util.invalidateTags(["CanUserReview"]));

      navigate("/me/orders", { replace: true });
    }
  }, [error, orderSuccess]);

  const orderTable = {
    columns: [
      {
        name: "Order Date",
        selector: row => row.date,
        format: row => format(row.date, 'yyyy-MM-dd'),
        sortable: true,
        width: "140"
      },
      {
        name: "ID",
        selector: row => row.id,
        sortable: true,
        width: "250"
      },
      {
        name: "Amount",
        selector: row => row.amount,
        format: row => formatCurrency(row.amount),
        sortable: true,
        width: "120"
      },
      {
        name: "Payment Status",
        selector: row => row.paymentStatus,
        sortable: true,
        width: "140"
      },
      {
        name: "Order Status",
        selector: row => row.orderStatus,
        sortable: true,
        width: "140"
      },

      {
        name: "Actions",
        selector: row => row.actions,
        width: "130",
      },
    ],
    rows: [],
  };

  const ordersCopy = JSON.parse(JSON.stringify(orders));

  ordersCopy?.sort((a, b) => {
    if (a.createdAt < b.createdAt) {
      return 1;
    } else if (a.createdAt > b.createdAt) {
      return -1
    } else {
      return 0;
    }
  }).forEach((order) => {
    orderTable.rows.push({
      date: order?.createdAt,
      id: order?._id,
      amount: order?.paymentInfo?.amounts?.totalAmountCents,
      paymentStatus: order?.paymentInfo?.status?.toUpperCase(),
      orderStatus: order?.orderStatus,
      actions: (
        <>
          <Link to={`/me/orders/${order?._id}`} className="btn btn-primary">
            <i className="fa fa-eye"></i>
          </Link>
          <Link
            to={`/invoice/order/${order?._id}`}
            className="btn btn-success ms-2"
          >
            <i className="fa fa-print"></i>
          </Link>
        </>
      ),
    });
  });


  const handleFilter = (e) => {
    setFilter(e.target.value);
    setOrders(data?.orders?.filter((order) => order._id.toLowerCase().startsWith(e.target.value.toLowerCase())));
  };

  const getOrders = () => {
    if (startDate > endDate) {
      toast.dismiss();
      toast.error("Please enter a valid date range");
    } else if (Date.parse(new Date(startDate)) && Date.parse(new Date(endDate))) {
      getMyOrders({
        startDate: startOfDay(new Date(startDate)).toISOString(),
        endDate: endOfDay(new Date(endDate)).toISOString(),
      })
    } else {
      toast.dismiss();
      toast.error("Please enter valid dates");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title={"My Orders"} />
      <div className="d-lg-flex justify-content-lg-center">
        <div className="order-list">
          <h1 className="my-5">{orders?.length} {orders?.length === 1 ? "Order" : "Orders"}</h1>
          <div className="row mb-3 align-items-end">
            <div className="col-12 col-xxl-3point72 d-flex mr-0">
              <div className="me-4">
                <label className="form-label d-block">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={Date.now()}
                  dateFormat="yyyy-MM-dd"
                  className="form-control order-date-picker"
                />
              </div>
              <div>
                <label className="form-label d-block">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={Date.now()}
                  dateFormat="yyyy-MM-dd"
                  className="form-control order-date-picker"
                />
              </div>
            </div>
            <div className="col-12 col-xxl-4point27 px-xxl-0 fetch-btn-container">
              <button
                className="btn fetch-btn mt-3 px-5"
                onClick={getOrders}
              >
                Fetch
              </button>
            </div>
            <div className="d-xxl-flex justify-content-xxl-end col-12 col-xxl-4 mt-5 mt-xxl-0">
              <input className="form-control table-filter" type="text" onChange={handleFilter} placeholder="Filter by ID" />
            </div>
          </div>
          {data?.orders?.length ?
            <DataTable
              columns={orderTable.columns}
              data={orderTable.rows}
              highlightOnHover
              pagination
              responsive
              striped
            />
            :
            ""
          }
        </div>
      </div>
    </>
  );
};

export default MyOrders;

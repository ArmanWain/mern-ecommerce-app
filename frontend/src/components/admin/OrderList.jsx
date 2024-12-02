import { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import { useDispatch } from "react-redux";
import { format, startOfDay, endOfDay } from "date-fns"
import { formatCurrency } from "../../utils/currency";
import AdminLayout from "../layout/AdminLayout";
import { useDeleteOrderMutation, useLazyGetAdminOrdersQuery } from "../../redux/api/orderApi";
import { productApi } from "../../redux/api/productsApi";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OrderList = () => {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState(null);
  const [startDate, setStartDate] = useState(startOfDay(new Date()).setDate(1));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));

  const dispatch = useDispatch();

  const [getAdminOrders, { data, isLoading, error }] = useLazyGetAdminOrdersQuery();

  const [deleteOrder, { error: deleteError, isLoading: isDeleteLoading, isSuccess },] = useDeleteOrderMutation();

  useEffect(() => {
    if (startDate && endDate && !data) {
      getAdminOrders({
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
      toast.error(error?.data?.message);
    }

    if (deleteError) {
      toast.dismiss();
      toast.error(deleteError?.data?.message);
    }

    if (isSuccess) {
      toast.dismiss();
      toast.success("Order Deleted");

      // Invalidate CanUserReview tag because the user may no longer be able to review the products
      dispatch(productApi.util.invalidateTags(["CanUserReview"]));
    }
  }, [error, deleteError, isSuccess]);

  const deleteOrderHandler = (id) => {
    deleteOrder(id);
  };

  const orderTable = {
    columns: [
      {
        name: "Order Date",
        selector: row => row.date,
        format: row => format(row.date, 'yyyy-MM-dd'),
        sortable: true,
        width: "110"
      },
      {
        name: "ID",
        selector: row => row.id,
        sortable: true,
        width: "230"
      },
      {
        name: "Amount",
        selector: row => row.amount,
        format: row => formatCurrency(row.amount),
        sortable: true,
        width: "110"
      },
      {
        name: "Payment Status",
        selector: row => row.paymentStatus,
        sortable: true,
        width: "135"
      },
      {
        name: "Order Status",
        selector: row => row.orderStatus,
        sortable: true,
        width: "130"
      },

      {
        name: "Actions",
        selector: row => row.actions,
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
          <Link
            to={`/admin/orders/${order?._id}`}
            className="btn btn-outline-primary"
          >
            <i className="fa fa-pencil"></i>
          </Link>

          <button
            className="btn btn-outline-danger ms-2"
            onClick={() => deleteOrderHandler(order?._id)}
            disabled={isDeleteLoading}
          >
            <i className="fa fa-trash"></i>
          </button>
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
      getAdminOrders({
        startDate: startOfDay(new Date(startDate)).toISOString(),
        endDate: endOfDay(new Date(endDate)).toISOString(),
      });
    } else {
      toast.dismiss();
      toast.error("Please enter valid dates");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={"All Orders"} />
      <h1 className="mb-5">{orders?.length} {orders?.length === 1 ? "Order" : "Orders"}</h1>
      <div className="row mb-3 align-items-end">
        <div className="col-12 col-xxl-4 d-flex">
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
        <div className="col-12 col-xxl-4 px-xxl-1">
          <button
            className="btn fetch-btn mt-3 px-5"
            onClick={getOrders}
          >
            Fetch
          </button>
        </div>
        <div className="d-flex justify-content-xxl-end col-12 col-xxl-4 mt-5 mt-xxl-0">
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
    </AdminLayout>
  );
};

export default OrderList;
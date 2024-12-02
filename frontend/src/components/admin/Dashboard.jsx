import { useEffect, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { formatCurrency } from "../../utils/currency";
import SalesChart from "../charts/SalesChart";
import { useLazyGetDashboardSalesQuery } from "../../redux/api/orderApi";
import { toast } from "react-hot-toast";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { startOfDay, endOfDay } from 'date-fns'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(startOfDay(new Date()).setDate(1));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));

  const [salesData, setSalesData] = useState(null);

  const [getDashboardSales, { error, isLoading, data }] = useLazyGetDashboardSalesQuery();

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error(error.data?.message);
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      let formattedSalesData = JSON.parse(JSON.stringify(data.sales))
      formattedSalesData.forEach((aggregate) => {
        aggregate.sales = Number(aggregate.sales) / 100;
      })
      setSalesData(formattedSalesData);
    }
  }, [data]);

  useEffect(() => {
    if (startDate && endDate && !data) {
      getDashboardSales({
        startDate: startOfDay(new Date(startDate)).toISOString(),
        endDate: endOfDay(new Date(endDate)).toISOString(),
        tzString: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  }, []);

  const getSalesData = () => {
    if (startDate > endDate) {
      toast.dismiss();
      toast.error("Please enter a valid date range");
    } else if (Date.parse(new Date(startDate)) && Date.parse(new Date(endDate))) {
      getDashboardSales({
        startDate: startOfDay(new Date(startDate)).toISOString(),
        endDate: endOfDay(new Date(endDate)).toISOString(),
        tzString: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    } else {
      toast.dismiss();
      toast.error("Please enter valid dates");
    }
  };

  if (isLoading) return <Loader />;
  return (
    <AdminLayout>
      <MetaData title={"Admin Dashboard"} />
      <div className="d-flex justify-content-start align-items-center mt-5 mt-lg-0">
        <div className="mb-3 me-4">
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
        <div className="mb-3">
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
        <button
          className="btn fetch-btn ms-4 mt-3 px-5"
          onClick={getSalesData}
        >
          Fetch
        </button>
      </div>

      <div className="row pr-4 my-3">
        <div className="col-xl-6 col-sm-12 mb-3">
          <div className="card text-white bg-success o-hidden h-100">
            <div className="card-body">
              <div className="text-center card-font-size">
                Sales
                <br />
                <b>{formatCurrency(data?.totalSales)}</b>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-sm-12 mb-3">
          <div className="card text-white bg-danger o-hidden h-100">
            <div className="card-body">
              <div className="text-center card-font-size">
                Orders
                <br />
                <b>{data?.totalNumOrders}</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SalesChart salesData={salesData} />

      <div className="mb-5"></div>
    </AdminLayout>
  );
};

export default Dashboard;

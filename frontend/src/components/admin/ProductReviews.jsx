import { useState, useEffect } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import DataTable from 'react-data-table-component';
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import {
  useDeleteReviewMutation,
  useLazyGetProductReviewsQuery,
} from "../../redux/api/productsApi";
const ProductReviews = () => {
  const [productId, setProductId] = useState("");

  const [getProductReviews, { data, isLoading, error }] = useLazyGetProductReviewsQuery();

  const [deleteReview, { error: deleteError, isLoading: isDeleteLoading, isSuccess }] = useDeleteReviewMutation();

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error(error.data?.message);
    }

    if (deleteError) {
      toast.dismiss();
      toast.error(deleteError.data?.message);
    }

    if (isSuccess) {
      toast.dismiss();
      toast.success("Review Deleted");
    }
  }, [error, deleteError, isSuccess]);

  const submitHandler = (e) => {
    e.preventDefault();
    getProductReviews(productId);
  };

  const deleteReviewHandler = (id) => {
    deleteReview({ productId: data?.productId, id });
  };


  const reviewsTable = {
    columns: [
      {
        name: "Review ID",
        selector: row => row.id,
        sortable: true,
        width: "280"
      },
      {
        name: "Rating",
        selector: row => row.rating,
        sortable: true,
      },
      {
        name: "Comment",
        selector: row => row.comment,
        sortable: true,
      },
      {
        name: "User",
        selector: row => row.user,
        sortable: true,
      },
      {
        name: "Actions",
        selector: row => row.actions,
        width: "100"
      },
    ],
    rows: [],
  };

  if (data) {
    data?.reviews?.forEach((review) => {
      reviewsTable.rows.push({
        id: review?._id,
        rating: review?.rating,
        comment: review?.comment,
        user: review?.user?.name,
        actions: (
          <>
            <button
              className="btn btn-outline-danger"
              onClick={() => deleteReviewHandler(review?._id)}
              disabled={isDeleteLoading}
            >
              <i className="fa fa-trash"></i>
            </button>
          </>
        ),
      });
    });
  }

  const customSort = (rows, selector, direction) => {
    return rows.sort((a, b) => {
      let aField;
      let bField;

      if (typeof selector(a) === "number" && typeof selector(b) === "number") {
        aField = selector(a);
        bField = selector(b);
      } else if (typeof selector(a) === "string" && typeof selector(b) === "string") {
        // Sort strings case insensitively
        aField = selector(a).toLowerCase();
        bField = selector(b).toLowerCase();
      } else {
        return;
      }

      let comparison = 0;

      if (aField > bField) {
        comparison = 1;
      } else if (aField < bField) {
        comparison = -1;
      }

      return direction === 'desc' ? comparison * -1 : comparison;
    });
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={"Reviews"} />
      <div className="row justify-content-center mb-5">
        <div className="col-6">
          <form onSubmit={submitHandler}>
            <div className="mb-3">
              <label htmlFor="productId_field" className="form-label">
                Enter Product ID
              </label>
              <input
                type="text"
                id="productId_field"
                className="form-control"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              />
            </div>

            <button
              id="search_button"
              type="submit"
              className="btn btn-primary w-100 py-2"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {data?.reviews?.length > 0 ? (
        <DataTable
          columns={reviewsTable.columns}
          data={reviewsTable.rows}
          sortFunction={customSort}
          highlightOnHover
          pagination
          responsive
          striped
        />
      ) : (
        <p className="mt-5 text-center">No Reviews</p>
      )}
    </AdminLayout>
  );
};

export default ProductReviews;

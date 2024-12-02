import { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import {
  useDeleteProductMutation,
  useGetAdminProductsQuery,
} from "../../redux/api/productsApi";
import AdminLayout from "../layout/AdminLayout";

const ProductList = () => {
  const { data, isLoading, error } = useGetAdminProductsQuery();

  const [deleteProduct, { isLoading: isDeleteLoading, error: deleteError, isSuccess }] = useDeleteProductMutation();

  const [products, setProducts] = useState(null);

  useEffect(() => {
    if (data) {
      setProducts(data?.products);
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
      toast.success("Product Deleted");
    }
  }, [error, deleteError, isSuccess]);

  let rows = [];

  products?.forEach((product) => {
    rows.push({
      id: product?._id,
      name: product?.name,
      stock: product?.stock,
      actions: (
        <>
          <Link
            to={`/admin/products/${product?._id}`}
            className="btn btn-outline-primary"
          >
            <i className="fa fa-pencil"></i>
          </Link>
          <Link
            to={`/admin/products/${product?._id}/upload_images`}
            className="btn btn-outline-success ms-2"
          >
            <i className="fa fa-image"></i>
          </Link>
          <button
            className="btn btn-outline-danger ms-2"
            onClick={() => deleteProductHandler(product?._id)}
            disabled={isDeleteLoading}
          >
            <i className="fa fa-trash"></i>
          </button>
        </>
      ),
    });
  });

  const productTable = {
    columns: [
      {
        name: "ID",
        selector: row => row.id,
        sortable: true,
      },
      {
        name: "Name",
        selector: row => row.name,
        format: row => {
          const maxLength = 50;
          if (row?.name.length > maxLength) {
            return `${row?.name?.substring(0, maxLength)}...`;
          }
          return row?.name?.substring(0, maxLength);
        },
        sortable: true,
        width: "370"
      },
      {
        name: "Stock",
        selector: row => row.stock,
        format: row => new Intl.NumberFormat("en-US").format(row.stock),
        sortable: true,
        width: "80"
      },
      {
        name: "Actions",
        selector: row => row.actions,
        width: "175"
      },
    ],
    rows
  };

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

  const deleteProductHandler = (id) => {
    deleteProduct(id);
  };

  const handleFilter = (e) => {
    setProducts(data?.products?.filter((product) => product._id.toLowerCase().startsWith(e.target.value.toLowerCase())));
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={"All Products"} />
      <h1 className="mb-5">{products?.length} {products?.length === 1 ? "Product" : "Products"}</h1>
      <input className="form-control mb-3 table-filter" type="text" onChange={handleFilter} placeholder="Filter by ID" />
      <DataTable
        columns={productTable.columns}
        data={productTable.rows}
        sortFunction={customSort}
        highlightOnHover
        pagination
        responsive
        striped
      />
    </AdminLayout>
  );
};

export default ProductList;

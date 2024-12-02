import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../../constants/constants";
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
} from "../../redux/api/productsApi";

const UpdateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: PRODUCT_CATEGORIES[0],
    stock: "",
    seller: "",
  });

  const { name, description, price, category, stock, seller } = product;

  const [updateProduct, { isLoading, error, isSuccess }] =
    useUpdateProductMutation();

  const { data } = useGetProductDetailsQuery(params?.id);

  useEffect(() => {
    if (data?.product) {
      setProduct({
        name: data?.product?.name,
        description: data?.product?.description,
        price: data?.product?.priceCents / 100,
        category: data?.product?.category,
        stock: data?.product?.stock,
        seller: data?.product?.seller,
      });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error(error.data?.message);
    }

    if (isSuccess) {
      toast.dismiss();
      toast.success("Product Updated");
      navigate("/admin/products");
    }
  }, [error, isSuccess]);

  const handlePriceChange = (e) => {
    let newValue = e.target.value;
    // Remove leading zero
    if (Number(newValue[0]) === 0 && (Number(newValue[1]) || Number(newValue[1]) === 0)) {
      newValue = newValue[1]
    }
    // Limit price to two decimal places
    setProduct({ ...product, [e.target.name]: newValue.replace(/^(\d+\.\d{2})\d+$/, "$1") });
    document.getElementById("price_field").value = product.price;
  }

  const handleStockChange = (e) => {
    setProduct({ ...product, [e.target.name]: Math.round(Number(e.target.value)) });
    document.getElementById("stock_field").value = product.stock;
  }

  const onChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    updateProduct({ id: params?.id, body: { ...product, priceCents: Number(price) * 100 } });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Product"} />
      <div className="row wrapper mt-2">
        <div className="col-10 col-lg-10 mt-5 mt-lg-0">
          <form className="shadow rounded bg-body" onSubmit={submitHandler}>
            <h2 className="mb-4">Update Product</h2>
            <div className="mb-3">
              <label htmlFor="name_field" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name_field"
                className="form-control"
                name="name"
                value={name}
                onChange={onChange}
                required
                maxLength="200"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description_field" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description_field"
                rows="6"
                name="description"
                value={description}
                onChange={onChange}
                required
                maxLength="1000"
              ></textarea>
            </div>

            <div className="row">
              <div className="mb-3 col">
                <label htmlFor="price_field" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="9999"
                  id="price_field"
                  className="form-control"
                  name="price"
                  value={price}
                  onChange={handlePriceChange}
                  required
                />
              </div>

              <div className="mb-3 col">
                <label htmlFor="stock_field" className="form-label">
                  Stock
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  id="stock_field"
                  className="form-control"
                  name="stock"
                  value={stock}
                  onChange={handleStockChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="mb-3 col">
                <label htmlFor="category_field" className="form-label">
                  Category
                </label>
                <select
                  className="form-select"
                  id="category_field"
                  name="category"
                  value={category}
                  onChange={onChange}
                >
                  {PRODUCT_CATEGORIES?.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3 col">
                <label htmlFor="seller_field" className="form-label">
                  Seller Name
                </label>
                <input
                  type="text"
                  maxLength="50"
                  id="seller_field"
                  className="form-control"
                  name="seller"
                  value={seller}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn w-100 py-2"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdateProduct;

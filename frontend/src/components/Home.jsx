import { useEffect } from "react";
import MetaData from "./layout/MetaData";
import { useGetProductsQuery } from "../redux/api/productsApi";
import ProductCard from "./product/ProductCard";
import Loader from "./layout/Loader";
import toast from "react-hot-toast";
import CustomPagination from "./layout/CustomPagination";
import { useSearchParams } from "react-router-dom";
import Filters from "./layout/Filters";

const Home = () => {
  let [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const page = searchParams.get("page") || 1;
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const category = searchParams.get("category");
  const rating = searchParams.get("rating");
  const notAvailable = searchParams.get("notAvailable");

  const params = { page, keyword };

  min !== null && (params.minCents = min * 100);
  max !== null && (params.maxCents = max * 100);
  category !== null && (params.category = category);
  rating !== null && (params.rating = rating);
  notAvailable !== null && (params.notAvailable = notAvailable);

  const { data, isLoading, error, isError } = useGetProductsQuery(params);

  useEffect(() => {
    if (isError) {
      toast.dismiss();
      toast.error(error.data?.message);
    }
  }, [isError]);

  const columnSize = keyword ? 4 : 3;

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title={"One Stop Shop"} />
      <div className="row ">
        <div className="col-6 col-md-3 mt-5"></div>
        <h1 id="products_heading" className={keyword ? "col-12 col-md-9 text-secondary" : "col-12 col-md-12 text-secondary text-center text-md-start"}>
          {keyword && data?.products?.length === 1
            ? `1 Product found with keyword: ${keyword}`
            : keyword
              ? `${data?.products?.length} Products found with keyword: ${keyword}`
              : "Latest Products"}
        </h1>
      </div>
      <div className="row d-flex justify-content-center">
        {keyword && (
          <div className="col-6 col-md-3 mt-3">
            <Filters />
          </div>
        )}
        <div className={keyword ? "col-8 col-md-9" : "col-8 col-md-12"}>
          <section id="products" className="mt-5">
            <div className="row">
              {data?.products?.map((product) => (
                <ProductCard key={product?._id} product={product} columnSize={columnSize} />
              ))}
            </div>
          </section>

          <CustomPagination
            resPerPage={data?.resPerPage}
            filteredProductsCount={data?.filteredProductsCount}
          />
        </div>
      </div>
    </>
  );
};

export default Home;

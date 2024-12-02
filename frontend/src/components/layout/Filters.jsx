import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPriceQueryParams } from "../../utils/filters";
import { PRODUCT_CATEGORIES } from "../../constants/constants";
import StarRatings from "react-star-ratings";

const Filters = () => {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  useEffect(() => {
    searchParams.has("min") && setMin(searchParams.get("min"));
    searchParams.has("max") && setMax(searchParams.get("max"));
  }, []);

  // Handle category & rating filter
  const handleClick = (checkbox) => {
    const checkboxes = document.getElementsByName(checkbox.name);

    checkboxes.forEach((item) => {
      if (item !== checkbox) item.checked = false;
    });

    if (checkbox.checked === false) {
      // Delete filter from query
      if (searchParams.has(checkbox.name)) {
        searchParams.delete(checkbox.name);
        const path = window.location.pathname + "?" + searchParams.toString();
        navigate(path);
      }
    } else {
      // Set new filter value if already there
      if (searchParams.has(checkbox.name)) {
        searchParams.set(checkbox.name, checkbox.value);
      } else {
        // Append new filter
        searchParams.append(checkbox.name, checkbox.value);
      }

      const path = window.location.pathname + "?" + searchParams.toString();
      navigate(path);
    }
  };

  // Handle price filter
  const handleButtonClick = (e) => {
    e.preventDefault();

    searchParams = getPriceQueryParams(searchParams, "min", min);
    searchParams = getPriceQueryParams(searchParams, "max", max);

    const path = window.location.pathname + "?" + searchParams.toString();
    navigate(path);
  };

  const defaultCheckHandler = (checkboxType, checkboxValue) => {
    const value = searchParams.get(checkboxType);
    if (checkboxValue === value) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className="border filter mt-5 py-3 px-3 px-md-2 px-lg-3">
      <h3>Filters</h3>
      <hr />
      <h5 className="filter-heading mb-3">Price</h5>
      <form id="filter_form" className="px-2" onSubmit={handleButtonClick}>
        <div className="row">
          <div className="col-12 col-lg-4 px-2 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Min ($)"
              name="min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </div>
          <div className="col-12 col-lg-4 px-2 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Max ($)"
              name="max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
          <div className="col-12 col-lg-4 px-2">
            <button type="submit" className="btn btn-primary">
              GO
            </button>
          </div>
        </div>
      </form>
      <hr />
      <h5 className="mb-3">Category</h5>
      {PRODUCT_CATEGORIES?.map((category, i) => (
        <div key={category} className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="category"
            id={`category${i + 1}`}
            value={category}
            defaultChecked={defaultCheckHandler("category", category)}
            onClick={(e) => handleClick(e.target)}
          />
          <label className="form-check-label" htmlFor={`category${i + 1}`}>
            {category}
          </label>
        </div>
      ))}
      <hr />
      <h5 className="mb-3">Rating</h5>
      {[5, 4, 3, 2, 1].map((rating, i) => (
        <div key={rating} className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="rating"
            id={`rating${i + 1}`}
            value={rating}
            defaultChecked={defaultCheckHandler("rating", rating?.toString())}
            onClick={(e) => handleClick(e.target)}
          />
          <label className="form-check-label" htmlFor={`rating${i + 1}`}>
            <StarRatings
              rating={rating}
              starRatedColor="#ffb829"
              numberOfStars={5}
              name="rating"
              starDimension="21px"
              starSpacing="0px"
            />
          </label>
        </div>
      ))}
      <hr />
      <h5 className="mb-3">Availability</h5>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          name="notAvailable"
          id="availability"
          value="true"
          defaultChecked={defaultCheckHandler("notAvailable", "true")}
          onClick={(e) => handleClick(e.target)}
        />
        <label className="form-check-label" htmlFor="availability">
          Include Out of Stock
        </label>
      </div>
    </div>
  );
};

export default Filters;

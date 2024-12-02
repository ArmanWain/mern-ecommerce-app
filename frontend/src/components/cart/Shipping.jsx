import { useEffect, useState } from "react";
import { countries } from "countries-list";
import { useDispatch, useSelector } from "react-redux";
import { saveShippingInfo, deleteDeliveryOptions } from "../../redux/features/cartSlice";
import { useNavigate } from "react-router-dom";
import MetaData from "../layout/MetaData";
import CheckoutSteps from "./CheckoutSteps";

const Shipping = () => {
  const countriesList = Object.values(countries).sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    } else if (a.name < b.name) {
      return -1
    } else {
      return 0;
    }
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [country, setCountry] = useState("Canada");

  const { shippingInfo } = useSelector((state) => state.cart);

  useEffect(() => {
    if (Object.keys(shippingInfo)?.length) {
      shippingInfo?.address && setAddress(shippingInfo?.address);
      shippingInfo?.city && setCity(shippingInfo?.city);
      shippingInfo?.state && setState(shippingInfo?.state);
      shippingInfo?.zipCode && setZipCode(shippingInfo?.zipCode);
      shippingInfo?.phoneNo && setPhoneNo(shippingInfo?.phoneNo);
      shippingInfo?.country & setCountry(shippingInfo?.country);
    }
  }, [shippingInfo]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (shippingInfo?.address !== address ||
      shippingInfo?.city !== city ||
      shippingInfo?.state !== state ||
      shippingInfo?.phoneNo !== phoneNo ||
      shippingInfo?.zipCode !== zipCode ||
      shippingInfo?.country !== country
    ) {
      dispatch(saveShippingInfo({ address, city, state, phoneNo, zipCode, country }));
      dispatch(deleteDeliveryOptions());
    }

    navigate("/confirm_order");
  };

  return (
    <>
      <MetaData title={"Shipping Info"} />

      <CheckoutSteps shipping />

      <div className="row wrapper my-5">
        <div className="col-10 col-lg-5">
          <form className="shadow rounded bg-body" onSubmit={submitHandler}>
            <h2 className="mb-4">Shipping Info</h2>
            <div className="mb-3">
              <label htmlFor="address_field" className="form-label">
                Address
              </label>
              <input
                type="text"
                id="address_field"
                className="form-control"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="city_field" className="form-label">
                City
              </label>
              <input
                type="text"
                id="city_field"
                className="form-control"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone_field" className="form-label">
                Phone No.
              </label>
              <input
                type="tel"
                id="phone_field"
                className="form-control"
                name="phoneNo"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="state_field" className="form-label">
                State
              </label>
              <input
                id="state_field"
                className="form-control"
                name="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="zip_code_field" className="form-label">
                Zip Code
              </label>
              <input
                id="zip_code_field"
                className="form-control"
                name="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="country_field" className="form-label">
                Country
              </label>
              <select
                id="country_field"
                className="form-select"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                {countriesList?.map((country) => (
                  <option key={country?.name} value={country?.name}>
                    {country?.name}
                  </option>
                ))}
              </select>
            </div>

            <button id="shipping_btn" type="submit" className="btn w-100 py-2">
              Continue
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Shipping;

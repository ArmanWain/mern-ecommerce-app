import { useEffect } from "react";
import Search from "./Search";
import { useGetMeQuery } from "../../redux/api/userApi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useLazyLogoutQuery } from "../../redux/api/authApi";
import { clearCart } from "../../redux/features/cartSlice";
import { getCartQuantity } from "../../utils/cart";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useGetMeQuery();
  const [logout, { isSuccess: logoutSuccess }] = useLazyLogoutQuery();

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    if (logoutSuccess) {
      dispatch(clearCart());
      navigate(0);
    }
  }, [logoutSuccess])

  const cartQuantity = getCartQuantity(cartItems);

  const logoutHandler = () => {
    logout();
  };

  return (
    <nav className="navbar row pt-2 pb-3 py-md-0">
      <div className="col-12 col-md-3 d-flex justify-content-center justify-content-md-start ps-md-5">
        <div className="navbar-brand">
          <Link to="/">
            <img src="/images/shopico_logo.png" alt="Shopico Logo" />
          </Link>
        </div>
      </div>
      <div className="col-12 col-md-6 mt-2 mt-md-0">
        <Search />
      </div>
      <div className="col-12 col-md-3 mt-4 mt-md-0 text-center d-flex align-items-center justify-content-center">
        <Link to="/cart" className="text-decoration-none d-flex align-items-center">
          <span id="cart" className="ms-3">
            Cart
          </span>
          <div className="ms-2" id="cart_quantity_container">
            <span id="cart_quantity_text">
              {cartQuantity}
            </span>
          </div>
        </Link>

        {user ? (
          <div className="ms-4 dropdown">
            <button
              className="btn dropdown-toggle text-white"
              type="button"
              id="dropDownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <figure className="avatar avatar-nav">
                <img
                  src={
                    user?.avatar
                      ? user?.avatar?.url
                      : "/images/default_avatar.jpg"
                  }
                  alt="User Avatar"
                  className="rounded-circle"
                />
              </figure>
              <span>{user?.name}</span>
            </button>
            <div
              className="dropdown-menu w-100"
              aria-labelledby="dropDownMenuButton"
            >
              {user?.role === "admin" && (
                <Link className="dropdown-item" to="/admin/dashboard">
                  Dashboard
                </Link>
              )}

              <Link className="dropdown-item" to="/me/orders">
                Orders
              </Link>

              <Link className="dropdown-item" to="/me/profile">
                Profile
              </Link>

              <Link
                className="dropdown-item text-danger"
                to="/"
                onClick={logoutHandler}
              >
                Logout
              </Link>
            </div>
          </div>
        ) : (
          !isLoading && (
            <Link to="/login" className="btn ms-4" id="login_btn">
              Login
            </Link>
          )
        )}
      </div>
    </nav>
  );
};

export default Header;

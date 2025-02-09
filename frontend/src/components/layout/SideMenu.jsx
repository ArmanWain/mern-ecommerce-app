import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
const SideMenu = ({ menuItems }) => {
  const location = useLocation();

  const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);

  const handleMenuItemClick = (menuItemUrl) => {
    setActiveMenuItem(menuItemUrl);
  };

  return (
    <div className="list-group mt-5 pl-4">
      {menuItems?.map((menuItem, index) => (
        <Link
          key={index}
          to={menuItem.url}
          className={`d-flex align-items-center fw-bold list-group-item list-group-item-action ${activeMenuItem === menuItem.url ? "active" : ""}`}
          onClick={() => handleMenuItemClick(menuItem.url)}
          aria-current={
            activeMenuItem.includes(menuItem.url) ? "true" : "false"
          }
        >
          <i className={`${menuItem.icon} fa-fw pe-4`}></i>
          {menuItem.name}
        </Link>
      ))}
    </div>
  );
};

export default SideMenu;

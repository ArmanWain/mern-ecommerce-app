import SideMenu from "./SideMenu";

const AdminLayout = ({ children }) => {
  const menuItems = [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: "fas fa-tachometer-alt",
    },
    {
      name: "New Product",
      url: "/admin/products/new",
      icon: "fas fa-plus",
    },
    {
      name: "Products",
      url: "/admin/products",
      icon: "fab fa-product-hunt",
    },
    {
      name: "Orders",
      url: "/admin/orders",
      icon: "fas fa-receipt",
    },
    {
      name: "Users",
      url: "/admin/users",
      icon: "fas fa-user",
    },
    {
      name: "Reviews",
      url: "/admin/reviews",
      icon: "fas fa-star",
    },
  ];

  return (
    <div>
      <div className="mt-2 mb-4 py-4 row">
        <div className="col-12 col-lg-2"></div>
        <div className="col-12 col-lg-8">
          <h2 className="text-center fw-bolder">Admin Dashboard</h2>
        </div>
        <div className="col-0 col-lg-2"></div>
      </div>

      <div className="row justify-content-around">
        <div className="col-12 col-lg-2">
          <SideMenu menuItems={menuItems} />
        </div>
        <div className="col-12 col-lg-8 admin-dashboard mt-5">{children}</div>
        <div className="col-0 col-lg-2"></div>
      </div>
    </div>
  );
};

export default AdminLayout;

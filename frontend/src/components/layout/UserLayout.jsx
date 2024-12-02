import SideMenu from "./SideMenu";

const UserLayout = ({ children }) => {
  const menuItems = [
    {
      name: "Profile",
      url: "/me/profile",
      icon: "fas fa-user",
    },
    {
      name: "Update Profile",
      url: "/me/update_profile",
      icon: "fas fa-user",
    },
    {
      name: "Upload Avatar",
      url: "/me/upload_avatar",
      icon: "fas fa-user-circle",
    },
    {
      name: "Update Password",
      url: "/me/update_password",
      icon: "fas fa-lock",
    },
  ];

  return (
    <div>
      <div className="mt-2 mb-4 py-4 row">
        <div className="col-12 col-lg-2"></div>
        <div className="col-12 col-lg-8">
          <h2 className="text-center fw-bolder">User Settings</h2>
        </div>
        <div className="col-0 col-lg-2"></div>
      </div>

      <div className="row justify-content-around">
        <div className="col-12 col-lg-2">
          <SideMenu menuItems={menuItems} />
        </div>
        <div className="col-12 col-lg-8 user-dashboard">{children}</div>
        <div className="col-0 col-lg-2"></div>
      </div>
    </div>
  );
};

export default UserLayout;

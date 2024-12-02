import UserLayout from "../layout/UserLayout";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import { format } from "date-fns"

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <UserLayout>
      <MetaData title={"Your Profile"} />
      <div className="row justify-content-around mt-5 user-info">
        <div className="col-12 col-md-5 d-flex justify-content-md-end">
          <figure className="avatar avatar-profile">
            <img
              className="rounded-circle img-fluid"
              src={
                user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"
              }
              alt={user?.name}
            />
          </figure>
        </div>

        <div className="col-12 col-md-5 ms-md-4">
          <h4>Full Name</h4>
          <p>{user?.name}</p>

          <h4>Email Address</h4>
          <p>{user?.email}</p>

          <h4>Joined On</h4>
          <p>{user?.createdAt ? format(new Date(user?.createdAt), 'yyyy-MM-dd') : ""}</p>
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;

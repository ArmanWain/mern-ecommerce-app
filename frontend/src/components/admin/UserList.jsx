import { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import {
  useDeleteUserMutation,
  useGetAdminUsersQuery,
} from "../../redux/api/userApi";

const UserList = () => {
  const { data, isLoading, error } = useGetAdminUsersQuery();

  const [deleteUser, { error: deleteError, isLoading: isDeleteLoading, isSuccess },] = useDeleteUserMutation();

  const [users, setUsers] = useState(null);

  useEffect(() => {
    if (data) {
      setUsers(data?.users)
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
      toast.success("User Deleted");
    }
  }, [error, deleteError, isSuccess]);

  const deleteUserHandler = (id) => {
    deleteUser(id);
  };

  const usersTable = {
    columns: [
      {
        name: "ID",
        selector: row => row.id,
        sortable: true,
        width: "250"
      },
      {
        name: "Name",
        selector: row => row.name,
        sortable: true,
      },
      {
        name: "Email",
        selector: row => row.email,
        sortable: true,
      },
      {
        name: "Role",
        selector: row => row.role,
        sortable: true,
        width: "130"
      },
      {
        name: "Actions",
        selector: row => row.actions,
        width: "130"
      },
    ],
    rows: [],
  };

  users?.forEach((user) => {
    usersTable.rows.push({
      id: user?._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      actions: (
        <>
          <Link
            to={`/admin/users/${user?._id}`}
            className="btn btn-outline-primary"
          >
            <i className="fa fa-pencil"></i>
          </Link>

          <button
            className="btn btn-outline-danger ms-2"
            onClick={() => deleteUserHandler(user?._id)}
            disabled={isDeleteLoading}
          >
            <i className="fa fa-trash"></i>
          </button>
        </>
      ),
    });
  });

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

  const handleFilter = (e) => {
    setUsers(data?.users?.filter((user) => user._id.toLowerCase().startsWith(e.target.value.toLowerCase())));
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={"All Users"} />
      <h1 className="mb-5">{users?.length} {users?.length === 1 ? "User" : "Users"}</h1>
      <input className="form-control mb-3 table-filter" type="text" onChange={handleFilter} placeholder="Filter by ID" />
      <DataTable
        columns={usersTable.columns}
        data={usersTable.rows}
        sortFunction={customSort}
        highlightOnHover
        pagination
        responsive
        striped
      />
    </AdminLayout>
  );
};

export default UserList;

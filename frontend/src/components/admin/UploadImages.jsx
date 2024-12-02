import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetProductDetailsQuery,
  useDeleteProductImageMutation,
  useUploadProductImagesMutation,
} from "../../redux/api/productsApi";
import NotFound from "../layout/NotFound";

const UploadImages = () => {
  const fileInputRef = useRef(null);
  const params = useParams();
  const navigate = useNavigate();

  const [newImages, setNewImages] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);

  const [uploadProductImages, { isLoading, error, isSuccess }] = useUploadProductImagesMutation();

  const [deleteProductImage, { isLoading: isDeleteLoading, error: deleteError }] = useDeleteProductImageMutation();

  const { data, isError } = useGetProductDetailsQuery(params?.id);

  useEffect(() => {
    if (data?.product) {
      setCurrentImages(data?.product?.images);
    }

    if (error) {
      toast.dismiss();
      toast.error(error.data?.message);
    }

    if (deleteError) {
      toast.dismiss();
      toast.error(deleteError?.data?.message);
    }

    if (isSuccess) {
      setNewImages([]);

      toast.dismiss();
      toast.success("Images Uploaded");

      navigate("/admin/products");
    }
  }, [data, error, isSuccess, deleteError]);

  const onChange = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();

      // Create event listener to update states when reading is complete
      reader.onload = () => {
        if (reader.readyState === 2) {
          setNewImages((oldArray) => [...oldArray, reader.result]);
        }
      };

      // Read the file
      reader.readAsDataURL(file);
    });
  };

  const handleResetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNewImageDelete = (image) => {
    const filteredImages = newImages.filter((img) => img != image);

    setNewImages(filteredImages);
  };

  const submitHandler = (e) => {
    e.preventDefault();

    uploadProductImages({ id: params?.id, body: { newImages } });
  };

  const deleteImage = (imgId) => {
    deleteProductImage({ id: params?.id, body: { imgId } });
  };

  if (isError) return <NotFound />;

  return (
    <AdminLayout>
      <MetaData title={"Upload Product Images"} />
      <div className="row wrapper mt-0">
        <div className="col-10 col-lg-8 mt-5 mt-lg-0">
          <form
            className="shadow rounded bg-body"
            encType="multipart/form-data"
            onSubmit={submitHandler}
          >
            <h2 className="mb-4">Upload Product Images</h2>

            <div className="mb-3">
              <label htmlFor="customFile" className="form-label">
                Choose Images
              </label>

              <div className="custom-file">
                <input
                  ref={fileInputRef}
                  type="file"
                  name="product_images"
                  className="form-control"
                  id="customFile"
                  multiple
                  onChange={onChange}
                  onClick={handleResetFileInput}
                />
              </div>

              {newImages?.length > 0 && (
                <div className="new-images my-4">
                  <p className="text-warning">New Images:</p>
                  <div className="row mt-1">
                    {newImages?.map((img, i) => (
                      <div key={i} className="col-md-3 mt-2">
                        <div className="card">
                          <img
                            src={img}
                            alt="Card"
                            className="card-img-top p-2"
                            style={{ width: "100%", height: "80px" }}
                          />
                          <button
                            style={{
                              backgroundColor: "#dc3545",
                              borderColor: "#dc3545",
                            }}
                            type="button"
                            className="btn btn-block btn-danger cross-button mt-1 py-0"
                            onClick={() => handleNewImageDelete(img)}
                          >
                            <i className="fa fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentImages?.length > 0 && (
                <div className="uploaded-images my-4">
                  <p className="text-success">Current Images:</p>
                  <div className="row mt-1">
                    {currentImages?.map((img) => (
                      <div key={img?._id} className="col-md-3 mt-2">
                        <div className="card">
                          <img
                            src={img?.url}
                            alt="Card"
                            className="card-img-top p-2"
                            style={{ width: "100%", height: "80px" }}
                          />
                          <button
                            style={{
                              backgroundColor: "#dc3545",
                              borderColor: "#dc3545",
                            }}
                            className="btn btn-block btn-danger cross-button mt-1 py-0"
                            type="button"
                            disabled={isLoading || isDeleteLoading}
                            onClick={() => deleteImage(img?.public_id)}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              id="register_button"
              type="submit"
              className="btn w-100 py-2"
              disabled={isLoading || isDeleteLoading || !newImages.length}
            >
              {isLoading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UploadImages;

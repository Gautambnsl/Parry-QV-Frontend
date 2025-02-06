import { ImagePlus } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import axios from "axios";
import { CreateProjectValues } from "../../interface";
import { createProjectOnChain } from "../../utils/integration";

const CreateProject: React.FC = () => {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleUploadImageToIPFS = async (image: File) => {
    const formData = new FormData();

    formData.append("file", image);

    const metadata = JSON.stringify({
      name: "Image",
      keyvalues: {
        description: "Image generated",
      },
    });

    formData.append("pinataMetadata", metadata);

    try {
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

      const response = await axios.post(url, formData, {
        maxBodyLength: Infinity,
        headers: {
          pinata_api_key: "a507741735fbd024ad7d",
          pinata_secret_api_key:
            "be8b3f3e9c96e0290e46e1175e3acb8ff449166f4be464166b5e06fc94ebfed9",
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.status === 200) {
        const body = {
          name: values.name,
          description: values.description,
          ipfsHash: response?.data?.IpfsHash,
          tokensPerUser: values.tokensPerUser,
          tokensPerVerifiedUser: values?.tokensPerVerifiedUser,
          endDate: values.endDate,
        };

        const devil = await createProjectOnChain(body);
        console.log("devil", devil);
      }
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
    }
  };

  const formik = useFormik<CreateProjectValues>({
    initialValues: {
      name: "",
      description: "",
      tokensPerUser: "",
      tokensPerVerifiedUser: "",
      endDate: 1,
      image: null,
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Project Name is required"),

      description: Yup.string().required("Description is required"),

      tokensPerUser: Yup.number()
        .required("Tokens per User is required")
        .min(1, "Must be greater than zero"),

      tokensPerVerifiedUser: Yup.number()
        .required("Tokens per Verified User is required")
        .min(1, "Must be greater than zero"),

      endDate: Yup.number()
        .required("Number of days is required")
        .min(1, "Must be greater than zero"),

      image: Yup.mixed<File>()
        .required("Image is required")
        .test(
          "fileFormat",
          "Unsupported Format. Only PNG, JPG, or WEBP allowed.",
          (value) =>
            value &&
            ["image/png", "image/jpg", "image/jpeg", "image/webp"].includes(
              value.type
            )
        ),
    }),

    onSubmit: async (values, { resetForm }) => {
      handleUploadImageToIPFS(values.image!);

      // resetForm();
      // setImagePreview(null);
    },
  });

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFieldValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      setFieldValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const {
    handleSubmit,
    values,
    setFieldValue,
    handleChange,
    handleBlur,
    touched,
    errors,
  } = formik;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#0E101A] mb-4">
          Create a New Project
        </h1>

        <p className="text-gray-600">Share your project with the community</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
      >
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Project Name
          </label>

          <input
            type="text"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.name}
            className={`w-full px-4 py-3 rounded-lg border ${
              touched.name && errors.name ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-[#FE0421] focus:border-transparent`}
            placeholder="Enter project name"
          />

          {touched.name && errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.description}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border ${
              touched.description && errors.description
                ? "border-red-500"
                : "border-gray-300"
            } focus:ring-2 focus:ring-[#FE0421] focus:border-transparent`}
            placeholder="Describe your project"
          />

          {touched.description && errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="tokensPerUser"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tokens per User
            </label>

            <input
              type="number"
              name="tokensPerUser"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.tokensPerUser}
              min="1"
              className={`w-full px-4 py-3 rounded-lg border ${
                touched.tokensPerUser && errors.tokensPerUser
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:ring-2 focus:ring-[#FE0421] focus:border-transparent`}
              placeholder="Enter token amount"
            />

            {touched.tokensPerUser && errors.tokensPerUser && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tokensPerUser}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="tokensPerVerifiedUser"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tokens per Verified User
            </label>

            <input
              type="number"
              name="tokensPerVerifiedUser"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.tokensPerVerifiedUser}
              min="1"
              className={`w-full px-4 py-3 rounded-lg border ${
                touched.tokensPerVerifiedUser && errors.tokensPerVerifiedUser
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:ring-2 focus:ring-[#FE0421] focus:border-transparent`}
              placeholder="Enter verified user token amount"
            />

            {touched.tokensPerVerifiedUser && errors.tokensPerVerifiedUser && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tokensPerVerifiedUser}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Number of Days
          </label>

          <input
            type="number"
            name="endDate"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.endDate}
            min={1}
            placeholder="Enter number of days"
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
          />

          {touched.endDate && errors.endDate && (
            <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>

        <div
          className={`flex items-center justify-center w-full ${
            dragActive ? "bg-gray-100" : ""
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-[#FAFDFE] hover:bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 object-contain"
                />
              ) : (
                <>
                  <ImagePlus className="w-12 h-12 text-[#FE0421] mb-4" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, or WEBP (MAX. 800x400px)
                  </p>
                </>
              )}
            </div>

            <input
              type="file"
              name="image"
              accept="image/png, image/jpg, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {touched.image && errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image}</p>
        )}

        <button
          type="submit"
          className="w-full bg-[#FE0421] text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Create Project
        </button>
      </form>
    </div>
  );
};

export default CreateProject;

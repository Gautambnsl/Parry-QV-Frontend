import axios from "axios";
import { useFormik } from "formik";
import { ImagePlus } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import { CreatePoolValues } from "../../interface";

const CreatePool = () => {
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
        console.log(response?.data?.IpfsHash);
      }
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
    }
  };

  const formik = useFormik<CreatePoolValues>({
    initialValues: {
      name: "",
      description: "",
      projectId: "",
      image: null,
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Pool Title is required"),

      description: Yup.string().required("Description is required"),

      projectId: Yup.string().required("Project ID is required"),

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

    onSubmit: (values, { resetForm }) => {
      console.log("Form Submitted:", values);
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

  const projectOptions = [
    { id: "1", name: "Project 1" },
    { id: "2", name: "Project 2" },
    { id: "3", name: "Project 3" },
  ];

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
          Create a New Pool
        </h1>

        <p className="text-gray-600">
          Set up a new voting pool for your community
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Pool Title
          </label>

          <input
            id="name"
            type="text"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.name}
            className={`w-full px-4 py-3 rounded-lg border ${
              touched.name && errors.name ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-[#FE0421] focus:border-transparent`}
            placeholder="Enter pool title"
          />

          {touched.name && errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="projectId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>

          <textarea
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
            placeholder="Describe your pool"
          />

          {touched.description && errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="projectId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Project ID
          </label>

          <select
            name="projectId"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.projectId}
            className={`w-full px-4 py-3 rounded-lg border ${
              touched.projectId && errors.projectId
                ? "border-red-500"
                : "border-gray-300"
            } focus:ring-2 focus:ring-[#FE0421] focus:border-transparent`}
          >
            <option value="">Select Project ID</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          {touched.projectId && errors.projectId && (
            <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>
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
          Create Pool
        </button>
      </form>
    </div>
  );
};

export default CreatePool;

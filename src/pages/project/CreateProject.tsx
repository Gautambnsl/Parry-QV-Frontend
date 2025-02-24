/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImagePlus, Info } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import axios from "axios";
import { CreateProjectValues } from "../../interface";
import { getTransactionHash } from "../../utils/integration";
import ErrorModal from "../../components/ErrorModal";

const CreateProject: React.FC = () => {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const handleUploadImageToIPFS = async (image: File) => {
    setLoading(true);
    setError(null);

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
        return response?.data?.IpfsHash;
      } else {
        throw new Error("Failed to upload image to IPFS");
      }
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      setError("Failed to upload image. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<CreateProjectValues>({
    initialValues: {
      name: "",
      description: "",
      tokensPerUser: "",
      tokensPerVerifiedUser: "",
      endDate: 1,
      minScoreToJoin: 0,
      minScoreToVerify: 0,
      image: null,
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Project Name is required"),
      description: Yup.string().required("Description is required"),
      tokensPerUser: Yup.number().required("Tokens per User is required"),
      tokensPerVerifiedUser: Yup.number().required(
        "Tokens per Verified User is required"
      ),
      endDate: Yup.number()
        .required("Number of days is required")
        .min(1, "Must be greater than zero"),
      minScoreToJoin: Yup.number().required("Score is required"),
      minScoreToVerify: Yup.number().required("Score is required"),
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

    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        const ipfsHash = await handleUploadImageToIPFS(values.image!);
        if (!ipfsHash) {
          setError("IPFS upload failed");
          return;
        }

        const body = [
          values.name,
          values.description,
          ipfsHash,
          values.tokensPerUser,
          values.tokensPerVerifiedUser,
          values.minScoreToJoin * 10000,
          values.minScoreToVerify * 10000,
          new Date().getTime() + values.endDate * 24 * 60 * 60 * 1000,
        ];

        const txHash = await getTransactionHash("createProject", body, 1);

        if (txHash?.status) {
          const checkIfWalletIsConnected = async () => {
            try {
              const accounts = await window.ethereum.request({
                method: "eth_accounts",
              });
              if (accounts.length > 0) {
                return accounts[0];
              }
            } catch (error) {
              console.error("Failed to check wallet connection:", error);
            }
          };

          const body = {
            sender: await checkIfWalletIsConnected(),
            txData: txHash?.txData,
          };

          const sendData = axios.post(
            "https://parry-qv-backend.onrender.com/factory-execute-meta-transaction",
            body
          );

          if (sendData.status) {
            setModalOpen(true);
          }
        } else {
          setError(`Transaction failed: ${txHash?.error}`);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
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
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      setFieldValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files?.[0]) {
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
    resetForm,
  } = formik;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#0E101A] mb-4">
          Create a New Project
        </h1>

        <p className="text-gray-600">Share your project with the community</p>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Project Name
            </label>
            <span title="Give your project a unique and descriptive name.">
              <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
            </span>
          </div>

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
          <div className="flex items-center gap-2 mb-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <span title="Briefly describe what your project is about and its objectives.">
              <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
            </span>
          </div>

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
            <div className="flex items-center gap-2 mb-2">
              <label
                htmlFor="tokensPerUser"
                className="block text-sm font-medium text-gray-700"
              >
                Tokens per normal user
              </label>
              <span title="Specify the number of tokens each user will receive for participation.">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
              </span>
            </div>

            <input
              type="number"
              name="tokensPerUser"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.tokensPerUser}
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
            <div className="flex items-center gap-2 mb-2">
              <label
                htmlFor="tokensPerVerifiedUser"
                className="block text-sm font-medium text-gray-700"
              >
                Tokens per verified user
              </label>
              <span title="Enter the tokens for verified users, who may receive a different amount than regular users.">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
              </span>
            </div>

            <input
              type="number"
              name="tokensPerVerifiedUser"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.tokensPerVerifiedUser}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label
                htmlFor="minScoreToJoin"
                className="block text-sm font-medium text-gray-700"
              >
                Minimum Score to Join
              </label>
              <span title="Users must have at least this score to join the project">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
              </span>
            </div>

            <input
              type="number"
              name="minScoreToJoin"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.minScoreToJoin}
              placeholder="Enter minimum score to join"
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
            />

            {touched.minScoreToJoin && errors.minScoreToJoin && (
              <p className="text-red-500 text-sm mt-1">
                {errors.minScoreToJoin}
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label
                htmlFor="minScoreToVerify"
                className="block text-sm font-medium text-gray-700"
              >
                Minimum Score to Verify
              </label>
              <span title="Users must meet this score threshold to be considered verified">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
              </span>
            </div>

            <input
              type="number"
              name="minScoreToVerify"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.minScoreToVerify}
              placeholder="Enter minimum score to verify"
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
            />

            {touched.minScoreToVerify && errors.minScoreToVerify && (
              <p className="text-red-500 text-sm mt-1">
                {errors.minScoreToVerify}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              Number of Days
            </label>
            <span title="Set the duration for how long this project will be active.">
              <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
            </span>
          </div>

          <input
            type="number"
            name="endDate"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.endDate}
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
                  loading="lazy"
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
          disabled={loading}
        >
          {loading ? "Creating Project..." : "Create Project"}
        </button>
      </form>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <p className="text-gray-600 mb-4">Project created successfully!</p>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                  setImagePreview(null);
                }}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <ErrorModal errorMessage={error} onClose={() => setError(null)} />
      )}
    </div>
  );
};

export default CreateProject;

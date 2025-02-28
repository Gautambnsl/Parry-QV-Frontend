/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImagePlus, Info } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import axios from "axios";
import { CreateProjectValues } from "../../interface";
import {
  getAddress,
  getSigner,
  getTransactionHash,
} from "../../utils/integration";
import ErrorModal from "../../components/ErrorModal";
import Loader from "../../components/Loader";
import { ethers } from "ethers";
import factoryABI from "../../utils/factory.json";
import { environment } from "../../utils/environments";

const CreateProject: React.FC = () => {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const [txHash, setTxHash] = useState<string>("");

  const handleUploadImageToIPFS = async (image: File) => {
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
      const response = await axios.post(environment.pinataUrl, formData, {
        maxBodyLength: Infinity,
        headers: {
          pinata_api_key: environment.pinataApiKey,
          pinata_secret_api_key: environment.pinataSecretApiKey,
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
      setError("Failed to upload image. Please try again");
      return null;
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
          "Unsupported Format. Only PNG, JPG, or WEBP allowed",
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
          setLoading(false);
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

        const senderAddress = await getAddress();
        if (!senderAddress) {
          setError("Failed to retrieve sender address");
          setLoading(false);
          return;
        }

        const FACTORY_ADDRESS = environment.factorAddress;
        const signer = await getSigner();
        const contract = new ethers.Contract(
          FACTORY_ADDRESS,
          factoryABI.abi,
          signer
        );

        // Step 1: Static Call to Simulate the Transaction
        try {
          const txSimulation = await contract.callStatic.createProject(
            values.name,
            values.description,
            ipfsHash,
            values.tokensPerUser,
            values.tokensPerVerifiedUser,
            values.minScoreToJoin * 10000,
            values.minScoreToVerify * 10000,
            new Date().getTime() + values.endDate * 24 * 60 * 60 * 1000
          );
          console.log("Static Call Success:", txSimulation);
        } catch (staticError: any) {
          console.error("Static Call Failed:", staticError);
          setError(
            `Transaction simulation failed: ${
              staticError.reason || staticError.message
            }`
          );
          setLoading(false);
          return;
        }

        // Step 2: Proceed with Actual Transaction Execution
        const txHash = await getTransactionHash("createProject", body, 1);
        if (!txHash?.status) {
          setError(`Transaction failed: ${txHash?.error}`);
          setLoading(false);
          return;
        }

        const requestBody = {
          sender: senderAddress,
          txData: txHash?.txData,
        };

        const response = await axios.post(
          environment.factoryBackendUrl,
          requestBody
        );

        if (response.status === 200) {
          setTxHash(response.data.hash);
          setModalOpen(true);
        } else {
          setError("Transaction execution failed");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Something went wrong. Please try again");
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
      <Loader isLoading={loading} />
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
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
              <div
                className="absolute bottom-full hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2"
                style={{ width: "max-content" }}
              >
                Give your project a unique and descriptive name
              </div>
            </div>
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
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
              <div
                className="absolute bottom-full hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2"
                style={{ width: "max-content" }}
              >
                Briefly describe what your project is about and its objectives
              </div>
            </div>
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
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                <div
                  className="absolute bottom-full hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2"
                  style={{ width: "max-content" }}
                >
                  Specify the number of tokens each user will receive for
                  participation
                </div>
              </div>
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
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                <div
                  className="absolute bottom-full hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2"
                  style={{ width: "max-content" }}
                >
                  Enter the tokens for verified users, who may receive a
                  different amount than regular users
                </div>
              </div>
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
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                <div
                  className="absolute bottom-full hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2"
                  style={{ width: "max-content" }}
                >
                  Users must have at least this Gitcoin passport score to join the project
                </div>
              </div>
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
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                <div
                  className="absolute bottom-full hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2"
                  style={{ width: "max-content" }}
                >
                  Users must meet this Gitcoin passport score threshold to be considered verified
                </div>
              </div>
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
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
              <div
                className="absolute bottom-full hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2"
                style={{ width: "max-content" }}
              >
                Set the duration for how long this project will be active
              </div>
            </div>
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
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[30%]">
            <div className="flex flex-col items-center text-center">
              <p className="text-gray-700 text-lg font-medium">
                Project created successfully!
              </p>

              <div className="flex space-x-4 mt-6 w-full">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                    setImagePreview(null);
                  }}
                  className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition border"
                >
                  Close
                </button>

                {/* Redirect Button */}
                <button
                  onClick={() =>
                    window.open(
                      `${environment.transactionUrl}/${txHash}`,
                      "_blank"
                    )
                  }
                  className="flex-1 py-3 rounded-lg bg-[#FE0421] text-white font-medium hover:bg-[#D9021A] transition"
                >
                  View in Explorer
                </button>
              </div>
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

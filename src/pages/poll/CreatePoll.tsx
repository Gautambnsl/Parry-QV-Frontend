/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useFormik } from "formik";
import { ImagePlus, Info } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import { CreatePollValues } from "../../interface";
import {
  getAddress,
  getSigner,
  getTransactionHash,
} from "../../utils/integration";
import ErrorModal from "../../components/ErrorModal";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import qvABI from "../../utils/qv.json";
import Loader from "../../components/Loader";
import { environment } from "../../utils/environments";

const CreatePoll = () => {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [txHash, setTxHash] = useState<string>("");

  const { projectId } = useParams();

  const handleUploadImageToIPFS = async (image: File) => {
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append(
        "pinataMetadata",
        JSON.stringify({
          name: "Image",
          keyvalues: { description: "Image generated" },
        })
      );

      const response = await axios.post(environment.pinataUrl, formData, {
        maxBodyLength: Infinity,
        headers: {
          pinata_api_key: environment.pinataApiKey,
          pinata_secret_api_key: environment.pinataSecretApiKey,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 && response.data.IpfsHash) {
        return response.data.IpfsHash;
      } else {
        setError("Failed to upload image to IPFS");
      }
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      setError("Something went wrong");
      return null;
    }
  };

  const formik = useFormik<CreatePollValues>({
    initialValues: {
      name: "",
      description: "",
      image: null,
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Poll Title is required"),
      description: Yup.string().required("Description is required"),
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

        const body = [values.name, values.description, ipfsHash];

        if (!projectId) return;

        // Get sender address
        const senderAddress = await getAddress();
        if (!senderAddress) {
          setError("Failed to retrieve sender address");
          setLoading(false);
          return;
        }

        const signer = await getSigner();
        const contract = new ethers.Contract(projectId, qvABI.abi, signer);

        // Step 1: Static Call to Simulate the Transaction
        try {
          const txSimulation = await contract.callStatic.createPoll(
            values.name,
            values.description,
            ipfsHash
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
        const txHash = await getTransactionHash("createPoll", body, 2);
        if (!txHash?.status) {
          setError(`Transaction failed: ${txHash?.error}`);
          setLoading(false);
          return;
        }

        // Prepare request body
        const requestBody = {
          sender: senderAddress,
          txData: txHash?.txData,
          contractAddress: projectId,
        };

        // Execute meta transaction
        const response = await axios.post(
          environment.QvBackendUrl,
          requestBody
        );

        if (response.status === 200) {
          setTxHash(response.data.hash);
          setModalOpen(true);
        } else {
          setError("Transaction execution failed");
        }
      } catch (error) {
        console.error("Unexpected Error:", error);
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
          Create a New Proposal
        </h1>

        <p className="text-gray-600">
          Set up a new proposal for your community
        </p>
      </div>

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
              Proposal Title
            </label>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
              <div
                className="absolute bottom-full hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2"
                style={{ width: "max-content" }}
              >
                Give your proposal a unique and descriptive name
              </div>
            </div>
          </div>

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
            placeholder="Enter proposal title"
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
                Briefly describe what your proposal is about and its objectives
              </div>
            </div>
          </div>

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
            placeholder="Describe your proposal"
          />

          {touched.description && errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
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
                  <div className="relative group">
                    <ImagePlus className="w-12 h-12 text-[#FE0421] mb-4 cursor-pointer" />
                    <div
                      className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2"
                      style={{ width: "max-content" }}
                    >
                      Upload an image for your proposal. PNG, JPG, or WEBP only
                    </div>
                  </div>

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
          disabled={loading}
          className="w-full bg-[#FE0421] text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          {loading ? "Creating..." : "Create Proposal"}
        </button>

        {error && (
          <ErrorModal errorMessage={error} onClose={() => setError(null)} />
        )}
      </form>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[30%]">
            <div className="flex flex-col items-center text-center">
              <p className="text-gray-700 text-lg font-medium">
                Proposal created successfully!
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

export default CreatePoll;

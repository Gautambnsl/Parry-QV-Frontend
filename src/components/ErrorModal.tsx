import { X, XCircle } from "lucide-react";

const ErrorModal = ({
  errorMessage,
  onClose,
}: {
  errorMessage: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96 relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </button>

        <div className="flex flex-col items-center">
          <XCircle className="w-12 h-12 text-red-500 mb-3" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 text-center">{errorMessage}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;

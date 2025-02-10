import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { PoolListingPage } from "../../interface";
import { useEffect, useState } from "react";
import { getAllPollsInfo, joinProjectOnChain } from "../../utils/integration";

const PoolListing = () => {
  const [pollData, setPollData] = useState<PoolListingPage[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  const { projectId } = useParams();
  const navigate = useNavigate();

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);

    try {
      const pollData = await getAllPollsInfo(projectId!);
      if (Array.isArray(pollData)) {
        setPollData(pollData);
      } else {
        throw new Error("Unexpected response format from API");
      }
    } catch (err) {
      console.error("Error fetching pools:", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to load pools. Please try again.");
      } else {
        setError("Failed to load pools. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async () => {
    try {
      const response = await joinProjectOnChain(projectId!);
      console.log("Join Project Response:", response);
    } catch (err) {
      console.error("Error joining project:", err);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#0E101A] mb-4">Pools</h1>
          <p className="text-gray-600 mb-6">
            Browse all available voting pools
          </p>
        </div>
        <div className="flex">
          <button
            onClick={handleJoinProject}
            className="inline-block bg-[#FE0421] text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300 flex gap-2 items-center"
          >
            <span>Join Project</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            to="/create-pool"
            className="inline-block bg-[#FE0421] text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300 ml-2"
          >
            Create Pool
          </Link>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center text-[#FE0421] hover:text-red-700 transition-colors"
      >
        <ArrowRight className="w-5 h-5 rotate-180 mr-2" />
        Back to Project
      </button>

      {loading && (
        <div className="text-center text-gray-500 text-xl">
          Loading pools...
        </div>
      )}

      {error && <div className="text-center text-red-500 text-xl">{error}</div>}

      {!loading && !error && pollData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pollData.map((pool, index: number) => (
            <Link
              key={pool.creator}
              to={`pools/${index}`}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48">
                <img
                  src={`https://amaranth-personal-slug-526.mypinata.cloud/ipfs/${pool.ipfsHash}`}
                  alt={pool.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl font-bold text-white">{pool.name}</h2>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {pool.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-[#0E101A]">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Total Participants:</span>
                  </div>
                  <span className="font-medium text-[#FE0421]">
                    {pool.totalParticipants.toString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="font-medium text-[#FE0421]">
                    {pool.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="text-center text-gray-500 text-xl">
            No pools available.
          </div>
        )
      )}
    </div>
  );
};

export default PoolListing;

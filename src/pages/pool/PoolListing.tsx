import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Users } from "lucide-react";
import { PoolListingPage } from "../../interface";

const pools: PoolListingPage[] = [
  {
    id: 101,
    name: "Cricket World Cup",
    description: "Vote for your favorite cricket team",
    tokensPerUser: 100,
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    imageUrl:
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800",
  },
  {
    id: 102,
    name: "Football Championship",
    description: "Vote for the best football club",
    tokensPerUser: 150,
    endTime: Date.now() + 14 * 24 * 60 * 60 * 1000,
    imageUrl:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800",
  },
];

const PoolListing = () => {
  const navigate = useNavigate();

  const handleJoinProject = () => {};

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pools.map((pool) => (
          <Link
            key={pool.id}
            to={`pools/${pool.id}`}
            className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48">
              <img
                src={pool.imageUrl}
                alt={pool.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                  <span>Tokens per User:</span>
                </div>
                <span className="font-medium text-[#FE0421]">
                  {pool.tokensPerUser}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mt-3">
                <div className="flex items-center text-[#0E101A]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Ends in:</span>
                </div>
                <span className="font-medium text-[#FE0421]">
                  {Math.ceil(
                    (pool.endTime - Date.now()) / (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PoolListing;

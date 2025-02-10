import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Vote } from "lucide-react";
import { castVoteOnChain, getPollInfoOnChain } from "../../utils/integration";
import { BigNumber } from "ethers";
import { PoolListingPage } from "../../interface";

function ProjectDetail() {
  const [pollData, setPollData] = useState<PoolListingPage | null>(null);

  const { poolId, projectId } = useParams();

  const [voteAmount, setVoteAmount] = useState<number>(0);

  const [totalVotes, setTotalVotes] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const calculateQuadraticCost = (votes: number) => Math.pow(votes, 2);

  const handleVoteChange = (value: number) => {
    if (value >= 0) setVoteAmount(value);
  };

  const handleVoteSubmit = async () => {
    if (voteAmount > 0 && projectId && poolId) {
      setLoading(true);
      try {
        const response = await castVoteOnChain(
          projectId,
          Number(poolId),
          voteAmount
        );
        if (response.status) {
          setTotalVotes((prev) => prev + voteAmount);
          setVoteAmount(0);
        } else {
          setError(response.error || "Voting failed");
        }
      } catch {
        setError("An unexpected error occurred while voting.");
      }
      setLoading(false);
    }
  };

  const handleGetPoll = async () => {
    if (!projectId || !poolId) return;
    setLoading(true);

    try {
      const pollData = await getPollInfoOnChain(projectId, poolId);

      if (pollData?.status === false) {
        setError(pollData.error || "Failed to fetch poll data.");
        return;
      }

      setPollData({
        name: pollData[0],
        description: pollData[1],
        ipfsHash: pollData[2],
        creator: pollData[3],
        isActive: pollData[4],
        totalVotes: BigNumber.from(pollData[6]).toNumber(),
        totalParticipants: BigNumber.from(pollData[5]).toNumber(),
      });

      setTotalVotes(BigNumber.from(pollData[6]).toNumber());
    } catch {
      console.error("Error fetching poll data.");
    }

    setLoading(false);
  };

  useEffect(() => {
    handleGetPoll();
  }, [poolId]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-96">
          {pollData?.ipfsHash && (
            <img
              src={`https://amaranth-personal-slug-526.mypinata.cloud/ipfs/${pollData.ipfsHash}`}
              alt={pollData?.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              {pollData?.name}
            </h1>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-white">
                  Created by: {pollData?.creator}
                </span>
              </div>

              <div
                className={`px-4 py-2 rounded-lg ${
                  pollData?.isActive ? "bg-[#FE0421]" : "bg-gray-500"
                }`}
              >
                <span className="text-white font-medium">
                  {pollData?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="bg-[#FAFDFE] rounded-xl p-6 flex-1 mr-4">
              <h3 className="text-lg font-semibold text-[#0E101A] mb-4">
                Quadratic Voting
              </h3>

              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => handleVoteChange(Math.max(0, voteAmount - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-[#FE0421] text-[#FE0421] flex items-center justify-center hover:bg-red-50"
                >
                  -
                </button>

                <input
                  type="number"
                  value={voteAmount}
                  onChange={(e) =>
                    handleVoteChange(parseInt(e.target.value) || 0)
                  }
                  className="w-20 text-center px-2 py-1 border-2 border-gray-200 rounded-lg"
                  min="0"
                />

                <button
                  onClick={() => handleVoteChange(voteAmount + 1)}
                  className="w-10 h-10 rounded-lg border-2 border-[#FE0421] text-[#FE0421] flex items-center justify-center hover:bg-red-50"
                >
                  +
                </button>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Cost: {calculateQuadraticCost(voteAmount)} tokens
              </div>

              <button
                onClick={handleVoteSubmit}
                disabled={voteAmount === 0 || loading}
                className="w-full bg-[#FE0421] text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Votes"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#FAFDFE] rounded-xl p-6">
              <div className="flex items-center space-x-3 text-[#0E101A] mb-2">
                <Vote className="w-5 h-5 text-[#FE0421]" />

                <h3 className="font-semibold">Total Votes</h3>
              </div>

              <p className="text-2xl font-bold text-[#FE0421]">{totalVotes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;

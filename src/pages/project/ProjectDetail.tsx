import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Vote, X } from "lucide-react";
import {
  castVoteOnChain,
  getPollInfoOnChain,
  getUserInfoOnChain,
  getVoteInfoOnChain,
} from "../../utils/integration";
import { BigNumber } from "ethers";
import { PollListingPage, UserInfoPage } from "../../interface";
import ErrorModal from "../../components/ErrorModal";

const ProjectDetail = () => {
  const [pollData, setPollData] = useState<PollListingPage | null>(null);

  const { pollId, projectId } = useParams();

  const [voteInfoData, setVoteInfoData] = useState<any>();

  const [voteAmount, setVoteAmount] = useState<number>(
    voteInfoData?.votingPower
  );

  const [totalVotes, setTotalVotes] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [userInfoData, setUserInfoData] = useState<UserInfoPage>();

  const calculateQuadraticCost = (votes: number) => Math.pow(votes, 2);

  const handleVoteChange = (value: number) => {
    if (value >= 0) setVoteAmount(value);
  };

  const handleVoteSubmit = async () => {
    if (voteAmount > 1 && !userInfoData?.isVerified) {
      setError("You are not verified to vote.");
      return;
    }

    if (voteAmount > 0 && projectId && pollId) {
      setLoading(true);
      setModalOpen(false);
      try {
        const txResult: any = await castVoteOnChain(
          projectId,
          Number(pollId),
          voteAmount
        );

        if (txResult?.status) {
          setVoteAmount(0);
        } else if (txResult?.error?.code === "ACTION_REJECTED") {
          setError("User rejected the transaction.");
        } else {
          setError(`Transaction failed: ${txResult?.error?.reason}`);
        }
      } catch (err) {
        console.log("Error:", err);
        setError("An unexpected error occurred while voting.");
      }
      setLoading(false);
    }
  };

  const handleGetPoll = async () => {
    if (!projectId || !pollId) return;
    setLoading(true);

    try {
      const pollData = await getPollInfoOnChain(projectId, pollId);

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

  const userInfoDataFunction = async () => {
    setLoading(true);
    setError(null);

    try {
      const userInfoData = await getUserInfoOnChain(projectId!);

      setUserInfoData({
        isRegistered: userInfoData[0],
        isVerified: userInfoData[1],
        tokensLeft: userInfoData[2].toString(),
        lastScoreCheck: userInfoData[3].toString(),
        passportScore: userInfoData[4].toString(),
        totalVotesCast: userInfoData[5].toString(),
      });
    } catch (err) {
      console.error("Error fetching pols:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const voteInfoDataFunction = async () => {
    const voteInfoData = await getVoteInfoOnChain(projectId!, pollId!);

    setVoteInfoData({
      votingPower: Number(voteInfoData[0].toString()),
      hasVoted: voteInfoData[1],
      isVerified: voteInfoData[2],
      timestamp: voteInfoData[3].toString(),
    });

    setVoteAmount(Number(voteInfoData[0].toString()));
  };

  useEffect(() => {
    handleGetPoll();
  }, [pollId]);

  useEffect(() => {
    userInfoDataFunction();
    voteInfoDataFunction();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
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
                {voteInfoData?.hasVoted ? "RESUBMIT VOTES" : "Submit Votes"}
              </button>
            </div>
          </div>

          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Confirm Your Vote</h2>
                  <button onClick={() => setModalOpen(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">
                  You are about to cast <strong>{voteAmount}</strong> votes.
                </p>
                <p className="text-gray-600 mb-4">
                  Total cost:{" "}
                  <strong className="text-red-500">
                    {calculateQuadraticCost(voteAmount)} tokens
                  </strong>
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleVoteSubmit}
                    className="flex-1 py-2 rounded-lg bg-[#FE0421] text-white font-semibold hover:bg-red-600 transition"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#FAFDFE] rounded-xl p-6">
              <div className="flex items-center space-x-3 text-[#0E101A] mb-2">
                <Vote className="w-5 h-5 text-[#FE0421]" />

                <h3 className="font-semibold">Total Participants</h3>
              </div>

              <p className="text-2xl font-bold text-[#FE0421]">{totalVotes}</p>
            </div>

            <div className="bg-[#FAFDFE] rounded-xl p-6">
              <div className="flex items-center space-x-3 text-[#0E101A] mb-2">
                <Vote className="w-5 h-5 text-[#FE0421]" />

                <h3 className="font-semibold">Your Votes Cast</h3>
              </div>

              <p className="text-2xl font-bold text-[#FE0421]">
                {voteInfoData?.votingPower}
              </p>
            </div>

            <div className="bg-[#FAFDFE] rounded-xl p-6">
              <div className="flex items-center space-x-3 text-[#0E101A] mb-2">
                <Vote className="w-5 h-5 text-[#FE0421]" />

                <h3 className="font-semibold">Token Left</h3>
              </div>

              <p className="text-2xl font-bold text-[#FE0421]">
                {userInfoData?.tokensLeft}
              </p>
            </div>

            <div className="bg-[#FAFDFE] rounded-xl p-6">
              <div className="flex items-center space-x-3 text-[#0E101A] mb-2">
                <Vote className="w-5 h-5 text-[#FE0421]" />

                <h3 className="font-semibold">QV Status</h3>
              </div>

              <p className="text-xl font-bold text-[#FE0421]">
                {userInfoData?.isVerified ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <ErrorModal errorMessage={error} onClose={() => setError(null)} />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;

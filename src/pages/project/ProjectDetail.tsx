import { useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Users, Vote } from "lucide-react";
import { ProjectDetailPage } from "../../interface";

function ProjectDetail() {
  const { id } = useParams();

  const [voteAmount, setVoteAmount] = useState<number>(0);

  const [totalVotes, setTotalVotes] = useState<number>(124);

  const project: ProjectDetailPage = {
    id: 1,
    name: "Cricket World Cup 2024",
    description:
      "Vote for your predictions and favorite moments in the upcoming Cricket World Cup. Your votes will help shape the community's perspective on key matches and players.",
    tokensPerUser: 100,
    tokensPerVerifiedUser: 200,
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    ipfs: "ipfs://...",
    imageUrl:
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200",
    category: "Sports / Cricket",
  };

  const calculateQuadraticCost = (votes: number) => {
    return Math.pow(votes, 2);
  };

  const handleVoteChange = (value: number) => {
    if (value >= 0 && calculateQuadraticCost(value) <= project.tokensPerUser) {
      setVoteAmount(value);
    }
  };

  const handleVoteSubmit = () => {
    if (voteAmount > 0) {
      setTotalVotes((prev) => prev + voteAmount);
      setVoteAmount(0);
      // Implement actual voting logic here
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-96">
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="text-white/80 mb-2">{project.category}</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {project.name}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-white">Project #{id}</span>
              </div>
              <div className="bg-[#FE0421] px-4 py-2 rounded-lg">
                <span className="text-white font-medium">Active</span>
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
                disabled={voteAmount === 0}
                className="w-full bg-[#FE0421] text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Votes
              </button>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-600 text-lg">{project.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#FAFDFE] rounded-xl p-6">
              <div className="flex items-center space-x-3 text-[#0E101A] mb-2">
                <Vote className="w-5 h-5 text-[#FE0421]" />
                <h3 className="font-semibold">Total Votes</h3>
              </div>
              <p className="text-2xl font-bold text-[#FE0421]">{totalVotes}</p>
            </div>

            <div className="bg-[#FAFDFE] rounded-xl p-6">
              <div className="flex items-center space-x-3 text-[#0E101A] mb-2">
                <Users className="w-5 h-5 text-[#FE0421]" />
                <h3 className="font-semibold">Available Tokens</h3>
              </div>
              <p className="text-2xl font-bold text-[#FE0421]">
                {project.tokensPerUser}
              </p>
            </div>

            <div className="bg-[#FAFDFE] rounded-xl p-6">
              <div className="flex items-center space-x-3 text-[#0E101A] mb-2">
                <Calendar className="w-5 h-5 text-[#FE0421]" />
                <h3 className="font-semibold">Time Remaining</h3>
              </div>
              <p className="text-2xl font-bold text-[#FE0421]">
                {Math.ceil(
                  (project.endTime - Date.now()) / (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;

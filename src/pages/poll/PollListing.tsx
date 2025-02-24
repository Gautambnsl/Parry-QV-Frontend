import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import {
  PollListingPage,
  ProjectListingPage,
  UserInfoPage,
} from "../../interface";
import { useEffect, useState } from "react";
import {
  getAllPollsInfo,
  getPassportScoreOnChain,
  getProjectInfo,
  getTransactionHash,
  getUserInfoOnChain,
  joinProjectOnChain,
} from "../../utils/integration";
import ErrorModal from "../../components/ErrorModal";
import axios from "axios";

const PollListing = () => {
  const [projectsData, setProjectsData] = useState<ProjectListingPage>();

  const [passportScore, setPassportScore] = useState<string>("");

  const [pollData, setPollData] = useState<PollListingPage[]>([]);

  const [userInfoData, setUserInfoData] = useState<UserInfoPage>();

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { projectId } = useParams();
  const navigate = useNavigate();

  const fetchPollData = async () => {
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
      console.error("Error fetching polls:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
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
      console.error("Error fetching polls:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPassportScore = async () => {
    const score = await getPassportScoreOnChain();

    console.log("score", score);

    if (score?.status) {
      setPassportScore(
        (Number(score?.passportScore?.toString()) / 10000).toFixed(2)
      );
    }
  };

  const handleJoinProject = async () => {
    try {
      if (!passportScore) {
        setError("You are not registered on the gitcoin passport.");
        return;
      }

      const txHash = await getTransactionHash("joinProject", [], 2);

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
          contractAddress: projectId,
        };

        const sendData = axios.post(
          "https://parry-qv-backend.onrender.com/QV-execute-meta-transaction",
          body
        );

        if (sendData.status) {
          setModalOpen(true);
        }
      } else {
        setError(`Transaction failed: ${txHash?.error}`);
      }
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);

    try {
      const projectData = await getProjectInfo();

      if (Array.isArray(projectData)) {
        const project = projectData.find((project) => project.id === projectId);
        setProjectsData(project);
      } else {
        throw new Error("Unexpected response format from API");
      }
    } catch (err) {
      console.error("Error fetching project data:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassportScore();
    fetchPollData();
    userInfoDataFunction();
    fetchProjectData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#0E101A] mb-4">Polls</h1>
          <p className="text-gray-600 mb-6">
            Browse all available voting polls. Minimum score to join project{" "}
            {(Number(projectsData?.minScoreToJoin) / 10000).toFixed(2)} and
            minimum score to be considered verified{" "}
            {(Number(projectsData?.minScoreToVerify) / 10000).toFixed(2)}
          </p>
        </div>
        <div className="flex">
          {!userInfoData?.isRegistered ? (
            <button
              onClick={handleJoinProject}
              className="inline-block bg-[#FE0421] text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300 flex gap-2 items-center ml-2"
            >
              <span>Join Project</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleJoinProject}
              className="inline-block bg-[#FE0421] text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300"
            >
              <span>Token Balance: {userInfoData?.tokensLeft}</span>
            </button>
          )}
          <Link
            to={`/projects/${projectId}/create-poll`}
            className="inline-block bg-[#FE0421] text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300 ml-2"
          >
            Create Poll
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
          Loading polls...
        </div>
      )}

      {error && <div className="text-center text-red-500 text-xl">{error}</div>}

      {!loading && !error && pollData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pollData.map((poll, index: number) => (
            <Link
              key={poll.creator}
              to={`polls/${index}`}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48">
                <img
                  src={`https://amaranth-personal-slug-526.mypinata.cloud/ipfs/${poll.ipfsHash}`}
                  alt={poll.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl font-bold text-white">{poll.name}</h2>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {poll.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-[#0E101A]">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Total Participants:</span>
                  </div>
                  <span className="font-medium text-[#FE0421]">
                    {poll.totalParticipants.toString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="font-medium text-[#FE0421]">
                    {poll.isActive ? "Active" : "Inactive"}
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
            No polls available.
          </div>
        )
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <p className="text-gray-600 mb-4">
              You have successfully joined the project.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setModalOpen(false);
                  window.location.reload();
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

export default PollListing;

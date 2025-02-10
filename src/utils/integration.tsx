import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import factoryABI from "../utils/factory.json";
import qvABI from "../utils/qv.json";
import {
  CreatePoolValues,
  CreateProjectValues,
  ProjectListingPage,
} from "../interface";

const FACTORY_ADDRESS = "0x77159cB39d163Ed13915265cb7BcB07e122E682f";
const RPC_URL =
  "https://opt-sepolia.g.alchemy.com/v2/swE9yoWrnP9EzbOKdPsJD2Hk0yb3-kDr";

export async function getNetwork() {
  return Number(await window.ethereum.request({ method: "eth_chainId" }));
}

export async function getSigner() {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

export async function getProvider() {
  return new ethers.providers.JsonRpcProvider(RPC_URL);
}

export async function getAddress() {
  const provider = await detectEthereumProvider();
  if (!provider) return null;
  return provider?.selectedAddress || null;
}

export async function getFactoryProjects() {
  try {
    const provider = await getProvider();
    const contract = new ethers.Contract(
      FACTORY_ADDRESS,
      factoryABI.abi,
      provider
    );
    const data = await contract.getProjects();

    if (!data || data.length === 0) throw new Error("No projects found");

    return data;
  } catch (err) {
    console.error("Error fetching factory projects:", err);
    return [];
  }
}

export async function getProjectInfo() {
  try {
    const projects = await getFactoryProjects();
    const provider = await getProvider();

    const projectData: ProjectListingPage[] = await Promise.all(
      projects.map(async (projectAddress: string) => {
        const contract = new ethers.Contract(
          projectAddress,
          qvABI.abi,
          provider
        );
        const projectInfo = await contract.getProjectInfo();

        return {
          id: projectAddress,
          name: projectInfo.name,
          description: projectInfo.description,
          ipfsHash: `https://amaranth-personal-slug-526.mypinata.cloud/ipfs/${projectInfo.ipfsHash}`,
          tokensPerUser: projectInfo.tokensPerUser.toNumber(),
          tokensPerVerifiedUser: projectInfo.tokensPerVerifiedUser.toNumber(),
          minScoreToJoin: projectInfo.minScoreToJoin.toNumber(),
          minScoreToVerify: projectInfo.minScoreToVerify.toNumber(),
          endTime: projectInfo.endTime.toString(),
        };
      })
    );

    return projectData;
  } catch (err) {
    return { status: false, err };
  }
}

export async function getAllPollsInfo(projectId: string) {
  try {
    const provider = await getProvider();
    const contract = new ethers.Contract(projectId, qvABI.abi, provider);

    const pollInfo = await contract.getAllPolls();
    return pollInfo;
  } catch (err) {
    console.error("Error fetching polls:", err);
    return {
      status: false,
      error: err instanceof Error ? err.message : "Failed to fetch polls",
    };
  }
}

export async function createProjectOnChain(projectData: CreateProjectValues) {
  try {
    const signer = await getSigner();
    const contract = new ethers.Contract(
      FACTORY_ADDRESS,
      factoryABI.abi,
      signer
    );

    const block = await signer.provider?.getBlock("latest");
    const currentTimestamp = block?.timestamp || 0;

    const tx = await contract.createProject(
      projectData.name,
      projectData.description,
      projectData.ipfsHash,
      projectData.tokensPerUser,
      projectData.tokensPerVerifiedUser,
      0,
      0,
      currentTimestamp + projectData.endDate * 24 * 60 * 60
    );

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    return { status: true, receipt };
  } catch (error) {
    console.error("Error creating project on chain:", error);
    return { status: false, error: (error as Error).message };
  }
}

export async function createPollOnChain(body: CreatePoolValues) {
  try {
    const signer = await getSigner();
    const contract = new ethers.Contract(body.projectId, qvABI.abi, signer);

    const tx = await contract.createPoll(
      body.name,
      body.description,
      body.ipfsHash
    );
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("Transaction Confirmed");
    return { status: true, txHash: tx.hash };
  } catch (error) {
    console.error("Error creating poll on blockchain:", error);
    return { status: false, error: (error as Error).message };
  }
}

export async function joinProjectOnChain(projectId: string) {
  try {
    const signer = await getSigner();
    const contract = new ethers.Contract(projectId, qvABI.abi, signer);

    const tx = await contract.joinProject();
    console.log("Transaction Hash:", tx.hash);

    await tx.wait();
    console.log("Transaction Confirmed");
    return { status: true, txHash: tx.hash };
  } catch (err) {
    console.error("Error joining project:", err);
    return {
      status: false,
      error: err instanceof Error ? err.message : "Failed to join project",
    };
  }
}

export async function castVoteOnChain(
  projectId: string,
  poolId: number,
  votingPower: number
) {
  try {
    const signer = await getSigner();
    const contract = new ethers.Contract(projectId, qvABI.abi, signer);

    const tx = await contract.castVote(poolId, votingPower);
    console.log("Transaction Sent:", tx.hash);

    await tx.wait();
    console.log("Transaction Confirmed:", tx.hash);

    return { status: true, txHash: tx.hash };
  } catch (err) {
    console.error("Error casting vote:", err);
    return {
      status: false,
      error: err instanceof Error ? err.message : "Failed to cast vote",
    };
  }
}

export async function getPollInfoOnChain(projectId: string, poolId: string) {
  try {
    const signer = await getSigner();
    const contract = new ethers.Contract(projectId, qvABI.abi, signer);

    const pollData = await contract.getPollInfo(poolId);
    console.log("Fetched Poll Info:", pollData);

    return pollData;
  } catch (err) {
    console.error("Error fetching poll info:", err);
    return {
      status: false,
      error: err instanceof Error ? err.message : "Failed to fetch poll info",
    };
  }
}

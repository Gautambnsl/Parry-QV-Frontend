import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import factoryABI from "../utils/factory.json";
import qvABI from "../utils/qv.json";
import {
  CreatePoolValues,
  CreateProjectValues,
  PoolListingPage,
  ProjectListingPage,
} from "../interface";

export async function getNetwork() {
  const chainId = Number(
    await window.ethereum.request({ method: "eth_chainId" })
  );
  return chainId;
}

export async function getRPC() {
  return "https://opt-sepolia.g.alchemy.com/v2/swE9yoWrnP9EzbOKdPsJD2Hk0yb3-kDr";
}

export async function getAddress() {
  const provider = await detectEthereumProvider();
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  await delay(500);
  if (provider?.selectedAddress) {
    return provider?.selectedAddress;
  } else {
    return;
  }
}

export async function getSigner() {
  const address = await getAddress();

  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  if (provider && address) {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    return signer;
  } else {
    return;
  }
}

export async function getProvider() {
  const rpc = await getRPC();
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  return provider;
}

export async function getFactoryProjects() {
  try {
    const rpc = await getRPC();
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const contractAddress = "0x77159cB39d163Ed13915265cb7BcB07e122E682f";
    const contract = new ethers.Contract(
      contractAddress,
      factoryABI.abi,
      provider
    );

    const data = await contract.getProjects();

    return data;
  } catch (err) {
    return { status: false, err };
  }
}

export async function getProjectInfo() {
  try {
    const rpc = await getRPC();
    const projects = await getFactoryProjects();
    const provider = new ethers.providers.JsonRpcProvider(rpc);

    const projectData = [];

    for (const projectAddress of projects) {
      const contract = new ethers.Contract(projectAddress, qvABI.abi, provider);

      const projectInfo = await contract.getProjectInfo();

      const project: ProjectListingPage = {
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

      projectData.push(project);
    }

    return projectData;
  } catch (err) {
    return { status: false, err };
  }
}

export async function getAllPollsInfo() {
  try {
    const rpc = await getRPC();
    const projects = await getFactoryProjects();
    const provider = new ethers.providers.JsonRpcProvider(rpc);

    const pollData = [];

    for (const projectAddress of projects) {
      const contract = new ethers.Contract(projectAddress, qvABI.abi, provider);

      const pollInfo = await contract.getAllPolls();

      console.log("pollInfo", pollInfo);

      const project: PoolListingPage = {
        id: projectAddress,
        name: pollInfo.name,
        description: pollInfo.description,
        ipfsHash: `https://amaranth-personal-slug-526.mypinata.cloud/ipfs/${pollInfo.ipfsHash}`,
        tokensPerUser: pollInfo.tokensPerUser.toNumber(),
        tokensPerVerifiedUser: pollInfo.tokensPerVerifiedUser.toNumber(),
        minScoreToJoin: pollInfo.minScoreToJoin.toNumber(),
        minScoreToVerify: pollInfo.minScoreToVerify.toNumber(),
        endTime: pollInfo.endTime.toString(),
      };

      pollData.push(project);
    }

    return pollData;
  } catch (err) {
    return { status: false, err };
  }
}

export async function createProjectOnChain(projectData: CreateProjectValues) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    const contractAddress = "0x77159cB39d163Ed13915265cb7BcB07e122E682f";

    const contract = new ethers.Contract(
      contractAddress,
      factoryABI.abi,
      signer
    );

    const block = await provider.getBlock("latest");

    const currentTimestamp = block.timestamp;

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
    alert("Project created successfully!");
  } catch (err) {
    return { status: false, err };
  }
}

export async function createPollOnChain(body: CreatePoolValues) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    const contractAddress = body.projectId;

    const contract = new ethers.Contract(contractAddress, qvABI.abi, signer);

    const tx = await contract.createPoll(
      body.name,
      body.description,
      body.ipfsHash
    );

    console.log("tx", tx);

    console.log("Transaction Hash:", tx.hash);
    await tx.wait();
    console.log("Transaction Confirmed");
  } catch (error) {
    console.error("Error creating poll on blockchain:", error);
  }
}

export async function joinProjectOnChain(projectId: string) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    const contractAddress = "0x040657751595F95C1B6e7F108859EfB11E012298";

    const contract = new ethers.Contract(contractAddress, qvABI.abi, signer);

    console.log("contract", contract);

    const data = await contract.joinProject();

    console.log("data joinProjectOnChain", data);
    return data;
  } catch (err) {
    return { status: false, err };
  }
}

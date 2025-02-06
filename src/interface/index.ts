export interface CreateProjectValues {
  name: string;
  description: string;
  ipfsHash?: string;
  tokensPerUser: number | "";
  tokensPerVerifiedUser: number | "";
  endDate: number;
  image?: File | null;
}

export interface CreatePoolValues {
  name: string;
  description: string;
  projectId: string;
  image?: File | null;
  ipfsHash?: string;
}

export interface PoolListingPage {
  id: number;
  name: string;
  description: string;
  tokensPerUser: number;
  endTime: number;
  ipfsHash: string;
}

export interface ProjectDetailPage {
  id: number;
  name: string;
  description: string;
  tokensPerUser: number;
  tokensPerVerifiedUser: number;
  endTime: number;
  ipfs: string;
  imageUrl: string;
  category: string;
}

export interface ProjectListingPage {
  id: string;
  name: string;
  description: string;
  ipfsHash: string;
  tokensPerUser: number;
  tokensPerVerifiedUser: number;
  minScoreToJoin: number;
  minScoreToVerify: number;
  endTime: string;
}

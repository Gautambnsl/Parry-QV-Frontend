export interface CreateProjectValues {
  name: string;
  description: string;
  tokensPerUser: number | "";
  tokensPerVerifiedUser: number | "";
  endTime: string;
  image: File | null;
}

export interface CreatePoolValues {
  name: string;
  description: string;
  projectId: string;
  image: File | null;
}

export interface PoolListingPage {
  id: number;
  name: string;
  description: string;
  tokensPerUser: number;
  endTime: number;
  imageUrl: string;
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
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

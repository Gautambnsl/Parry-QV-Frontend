export interface CreateProjectValues {
  name: string;
  description: string;
  ipfsHash?: string;
  tokensPerUser: number | "";
  tokensPerVerifiedUser: number | "";
  endDate: number;
  minScoreToJoin: number;
  minScoreToVerify: number;
  image?: File | null;
}

export interface CreatePollValues {
  name: string;
  description: string;
  projectId?: string;
  image?: File | null;
  ipfsHash?: string;
}

export interface PollListingPage {
  name: string;
  description: string;
  ipfsHash: string;
  creator: string;
  isActive: boolean;
  totalVotes: number;
  totalParticipants: number;
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

export interface UserInfoPage {
  isRegistered: boolean;
  isVerified: boolean;
  lastScoreCheck: number;
  passportScore: number;
  tokensLeft: number;
  totalVotesCast: number;
}

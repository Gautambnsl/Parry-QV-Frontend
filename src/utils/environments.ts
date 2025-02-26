export const environment = {
  factorAddress: import.meta.env.VITE_FACTORY_ADDRESS,
  rpcUrl: import.meta.env.VITE_RPC_URL,
  passportAddress: import.meta.env.VITE_PASSPORT_ADDRESS,
  factoryBackendUrl: `${import.meta.env.VITE_BACKEND_URL}/factory-execute-meta-transaction`,
  QvBackendUrl: `${import.meta.env.VITE_BACKEND_URL}/QV-execute-meta-transaction`,
  pinataUrl: import.meta.env.VITE_PINATA_URL,
  pinataApiKey: import.meta.env.VITE_PINATA_API_KEY,
  pinataSecretApiKey: import.meta.env.VITE_PINATA_SECRET_API_KEY,
  ipfsUrl: import.meta.env.VITE_IPFS_URL,
  transactionUrl: import.meta.env.VITE_TRANSACTION_URL
};

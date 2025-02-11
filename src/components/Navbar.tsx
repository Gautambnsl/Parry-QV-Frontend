import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Vote, Rocket, Home, Wallet, X, Menu } from "lucide-react";
import { getPassportScoreOnChain } from "../utils/integration";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Navbar = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [walletAddress, setWalletAddress] = useState<string>("");

  const [passportScore, setPassportScore] = useState<string>("");

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error: any) {
        console.error("Wallet connection failed:", error);
        if (error.code === 4001) {
          alert("Connection request rejected by the user.");
        }
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to continue.");
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setWalletAddress("");
    } else {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to check wallet connection:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      checkIfWalletIsConnected();
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const fetchPassportScore = async () => {
    const score = await getPassportScoreOnChain();
    if (score.status !== false) {
      setPassportScore(score.toString());
    }
  };

  useEffect(() => {
    if (isConnected) fetchPassportScore();
  }, [isConnected]);

  const NavLinks = () => (
    <>
      <Link
        to="/projects"
        onClick={() => setIsMenuOpen(false)}
        className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
          isActive("/projects")
            ? "bg-[#FE0421] text-white"
            : "hover:bg-red-50 text-[#0E101A]"
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Project</span>
      </Link>
      <Link
        to="/create-project"
        onClick={() => setIsMenuOpen(false)}
        className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
          isActive("/create-project")
            ? "bg-[#FE0421] text-white"
            : "hover:bg-red-50 text-[#0E101A]"
        }`}
      >
        <Rocket className="w-5 h-5" />
        <span>Create Project</span>
      </Link>

      <button
        onClick={() => {
          handleConnectWallet();
          setIsMenuOpen(false);
        }}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          isConnected
            ? "bg-green-50 text-green-600 hover:bg-green-100"
            : "bg-[#FE0421] text-white hover:bg-red-600"
        }`}
      >
        <Wallet className="w-5 h-5" />
        <span>
          {isConnected ? formatAddress(walletAddress) : "Connect Wallet"}
        </span>
      </button>

      {passportScore !== "" && (
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            isConnected
              ? "bg-green-50 text-green-600 hover:bg-green-100"
              : "bg-[#FE0421] text-white hover:bg-red-600"
          }`}
        >
          <span>Passport Score: {passportScore}</span>
        </button>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Vote className="w-8 h-8 text-[#FE0421]" />
              <span className="text-xl font-bold text-[#0E101A]">
                Parry Vote
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-[#0E101A]" />
              ) : (
                <Menu className="w-6 h-6 text-[#0E101A]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <NavLinks />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

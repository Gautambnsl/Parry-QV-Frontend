import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import ProjectListing from "./pages/project/ProjectListing";
import PoolListing from "./pages/pool/PoolListing";
import ProjectDetail from "./pages/project/ProjectDetail";
import CreatePool from "./pages/pool/CreatePool";
import CreateProject from "./pages/project/CreateProject";

const App = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#FAFDFE] flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectListing />} />
          <Route path="/projects/:projectId" element={<PoolListing />} />
          <Route
            path="/projects/:projectId/pools/:poolId"
            element={<ProjectDetail />}
          />
          <Route path="/create-pool" element={<CreatePool />} />
          <Route path="/create-project" element={<CreateProject />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;

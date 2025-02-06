import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProjectListingPage } from "../../interface";
import { getProjectInfo } from "../../utils/integration";

const ProjectListing = () => {
  const [projectsData, setProjectsData] = useState<ProjectListingPage[]>([]);

  const fetchProjectData = async () => {
    try {
      const projectData = await getProjectInfo();
      if (Array.isArray(projectData)) {
        setProjectsData(projectData);
      } else {
        console.log("Unexpected data format", projectData);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-[#0E101A] mb-4">Projects</h1>
      <p className="text-gray-600 mb-6">
        Explore and vote in different projects
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projectsData.length > 0 &&
          projectsData.map((project: ProjectListingPage) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-48">
                <img
                  src={project.ipfsHash}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white">
                    {project.name}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ProjectListing;

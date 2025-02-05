import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { ProjectListingPage } from "../../interface";

const categories: ProjectListingPage[] = [
  {
    id: 1,
    name: "Best Hot Dog in Gujarat",
    description: "Vote on your favorite sports and athletes",
    imageUrl:
      "https://images.unsplash.com/photo-1440427810006-0e4109fd4abe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMDk1MTB8MHwxfHNlYXJjaHw5fHxzdHJlZXQlMjBmb29kfGVufDB8fHx8MTczODY5NjUxMXww&ixlib=rb-4.0.3&q=80&w=1080",
  },
  {
    id: 2,
    name: "Best Pizza in New York",
    description: "Rank the best pizza spots in NYC",
    imageUrl:
      "https://images.unsplash.com/photo-1706086414608-1fdabdbd264a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMDk1MTB8MHwxfHNlYXJjaHw2fHxzdHJlZXQlMjBwaXp6YXxlbnwwfHx8fDE3Mzg2OTczODZ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  },
];

function ProjectListing() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-[#0E101A] mb-4">Projects</h1>
      <p className="text-gray-600 mb-6">
        Explore and vote in different projects
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/projects/${category.id}`}
            className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative h-48">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Joined</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white">
                  {category.name}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectListing;

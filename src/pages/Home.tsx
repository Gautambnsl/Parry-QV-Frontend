import { Link } from "react-router-dom";
import { ArrowRight, Globe2, Compass, Map, Vote, Heart } from "lucide-react";

function Home() {
  const destinations = [
    {
      id: 1,
      title: "Swiss Alps Retreat",
      rating: 4.8,
      trending: true,
      imageUrl:
        "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=800",
    },
    {
      id: 2,
      title: "Maldives Paradise",
      rating: 4.9,
      trending: true,
      imageUrl:
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800",
    },
    {
      id: 3,
      title: "Tokyo Nights",
      rating: 4.7,
      trending: false,
      imageUrl:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800",
    },
    {
      id: 4,
      title: "Yosemite Valley",
      rating: 4.6,
      trending: true,
      imageUrl:
        "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?auto=format&fit=crop&w=800",
    },
  ];

  return (
    <div className="relative">
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-500">
          <div className="absolute inset-0 bg-[#7b1212e6]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full">
                <Vote className="w-5 h-5 text-[#FE0421]" />
                <span className="text-white font-medium">
                  Welcome to VoteHub
                </span>
              </div>

              <h1 className="text-8xl font-bold text-white space-y-4">
                <span className="block transform hover:translate-x-4 transition-transform duration-300">
                  Discover
                </span>
                <span className="block text-[#FE0421] transform hover:-translate-x-4 transition-transform duration-300">
                  Vote
                </span>
                <span className="block transform hover:translate-x-4 transition-transform duration-300">
                  Explore
                </span>
              </h1>

              <p className="text-xl text-gray-200 max-w-lg">
                Join our vibrant community in shaping the future of travel. Your
                vote has the power to unveil the world's hidden gems.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/create-project"
                  className="group relative px-8 py-4 bg-[#FE0421] text-white rounded-xl font-semibold overflow-hidden"
                >
                  <span className="relative z-10">Submit Destination</span>
                  <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  <span className="absolute inset-0 flex items-center justify-center text-[#FE0421] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Submit Destination
                  </span>
                </Link>

                <Link
                  to="/create-pool"
                  className="group px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Start Voting
                  <ArrowRight className="inline-block ml-2 w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FE0421]/20 to-transparent rounded-3xl transform rotate-6" />
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Globe2, label: "Countries", value: "150+" },
                    { icon: Compass, label: "Destinations", value: "10K+" },
                    { icon: Heart, label: "Happy Voters", value: "100K+" },
                    { icon: Map, label: "Monthly Votes", value: "50K+" },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="group bg-white/5 backdrop-blur-lg p-6 rounded-2xl hover:bg-white/10 transition-colors"
                    >
                      <stat.icon className="w-8 h-8 text-[#FE0421] mb-4 transform group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-5xl font-bold text-[#0E101A] mb-4">
                Trending Project
              </h2>
              <p className="text-gray-600">
                Vote for your favorite places and help them reach the top
              </p>
            </div>
            <Link
              to="/projects"
              className="group inline-flex items-center space-x-2 text-[#FE0421] font-semibold hover:text-red-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((item) => (
              <Link
                to={`/project/${item.id}`}
                key={item.id}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden transform transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {item.trending && (
                  <div className="absolute top-4 left-4 bg-[#FE0421] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Trending
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#0E101A] px-3 py-1 rounded-full text-sm font-medium">
                  ★ {item.rating}
                </div>

                <div className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between">
                  <h3 className="text-lg font-semibold text-[#0E101A]">
                    {item.title}
                  </h3>
                  <span className="text-[#FE0421]">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

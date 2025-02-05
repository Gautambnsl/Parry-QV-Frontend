import {
  Vote,
  Twitter,
  Instagram,
  Facebook,
  Github,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <Vote className="w-8 h-8 text-[#FE0421]" />
              <span className="text-xl font-bold text-[#0E101A]">VoteHub</span>
            </Link>
            <p className="text-gray-600">
              Empowering communities to discover and vote for the world's most
              amazing destinations.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 hover:text-[#FE0421] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#FE0421] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#FE0421] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#FE0421] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div></div>

          <div></div>

          <div>
            <h4 className="font-semibold text-[#0E101A] mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-5 h-5 text-[#FE0421]" />
                <span>123 Voting Street, NY 10001</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-5 h-5 text-[#FE0421]" />
                <span>contact@votehub.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5 text-[#FE0421]" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-600">
              © {new Date().getFullYear()} VoteHub. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link
                to="#"
                className="text-gray-600 hover:text-[#FE0421] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-gray-600 hover:text-[#FE0421] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="#"
                className="text-gray-600 hover:text-[#FE0421] transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-black text-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition">
        The Hippie Scientist
      </Link>
      <nav className="flex space-x-6">
        <Link to="/" className="hover:text-purple-300 transition">Home</Link>
        <Link to="/herb-index" className="hover:text-purple-300 transition">Herb Index</Link>
        <Link to="/store" className="hover:text-purple-300 transition">Store</Link>
        <Link to="/blog" className="hover:text-purple-300 transition">Blog</Link>
      </nav>
    </header>
  );
};

export default Header;

import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-black text-white shadow-md">
      <Link to="/" className="text-3xl font-bold tracking-wide">
        The Hippie Scientist
      </Link>
      <nav className="space-x-6 text-lg font-medium">
        <Link to="/" className="hover:text-purple-300 transition">Home</Link>
        <Link to="/herb-index" className="hover:text-purple-300 transition">Herb Index</Link>
      </nav>
    </header>
  );
};

export default Header;

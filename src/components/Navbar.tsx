import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/database">Database</Link></li>
        <li><Link to="/favorites">Favorites</Link></li>
        <li><Link to="/about">About</Link></li>
        {/* Add more navigation links as needed */}
      </ul>
    </nav>
  );
}

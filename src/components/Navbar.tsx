import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/herbs">Database</Link></li>
        <li><Link to="/compounds">Compounds</Link></li>
        <li><Link to="/blend">Build a Blend</Link></li>
        <li><Link to="/favorites">Favorites</Link></li>
        <li><Link to="/about">About</Link></li>
        {import.meta.env.MODE !== 'production' && (
          <>
            <li>
              <Link to="/data-report" className='opacity-80 hover:underline'>
                Data Report
              </Link>
            </li>
            <li>
              <Link to="/data-fix" className='opacity-80 hover:underline'>
                Data Fix
              </Link>
            </li>
          </>
        )}
        {/* Add more navigation links as needed */}
      </ul>
    </nav>
  );
}

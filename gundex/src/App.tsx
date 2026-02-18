import { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function App() {
  const [dark, setDark] = useState(false);
  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
        <button
          className="mb-4 px-3 py-1 border rounded"
          onClick={() => setDark(d => !d)}
        >
          Toggle {dark ? 'Light' : 'Dark'} Mode
        </button>
        <h1 className="text-2xl font-bold mb-4">Welcome to Gundex</h1>
        <Link className="text-blue-600 underline" to="/firearms">Go to Firearms Index</Link>
      </div>
    </div>
  );
}

export default App;

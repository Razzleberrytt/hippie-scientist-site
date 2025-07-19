import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center space-y-6">
      <h1 className="text-5xl font-bold">Welcome to Gundex</h1>
      <p className="text-gray-400">Explore firearms from around the world</p>
      <Link
        to="/guns"
        className="px-6 py-3 bg-red-600 text-white rounded shadow hover:shadow-red-500/50 transition"
      >
        View Firearm Index
      </Link>
    </div>
  );
}

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import HerbIndex from "./components/HerbIndex";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/herb-index" element={<HerbIndex />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;

import React from 'react';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';

const App: React.FC = () => {
  return (
    <div style={styles.container}>
      <Header />
      <Hero />
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Orbitron', sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #7F00FF, #E100FF)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
  },
} as const;

export default App;

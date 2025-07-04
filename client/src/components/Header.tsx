import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>🌿 The Hippie Scientist 🌿</h1>
      <p style={styles.tagline}>Exploring Psychoactive Herbs & Legal Highs</p>
    </header>
  );
};

const styles = {
  header: {
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderBottom: '2px solid #39ff14',
  },
  title: {
    fontSize: '2.8rem',
    marginBottom: '0.5rem',
  },
  tagline: {
    fontSize: '1.2rem',
    color: '#ccc',
  },
} as const;

export default Header;

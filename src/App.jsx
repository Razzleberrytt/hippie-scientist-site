import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import mock data
import { products as mockProducts, blogPosts as mockBlogPosts, substances as mockSubstances } from './data/mockData.js';

// Theme Context
const ThemeContext = React.createContext();

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('psychedelic-theme') || 'dark';
    setTheme(savedTheme);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('psychedelic-theme', theme);
    }
  }, [theme, isLoading]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Navigation Component
const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Store', path: '/store' },
    { label: 'Blog', path: '/blog' },
    { label: 'Psychoactive Index', path: '/psychoactive-index' },
  ];

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="nav-brand">
          <a href="/" className="brand-text">PsycheCo</a>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navItems.map((item) => (
            <a key={item.path} href={item.path} className="nav-link">
              {item.label}
            </a>
          ))}
        </div>

        {/* Controls */}
        <div className="nav-controls">
          <button className="cart-button">
            🛒 <span className="cart-count">0</span>
          </button>
          
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <a 
                key={item.path} 
                href={item.path} 
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

// Particle System Component
const ParticleSystem = ({ particleCount = 50 }) => {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff00ff', '#00ffff', '#8b5cf6', '#00ff88'];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 100,
        maxLife: 100
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life += 1;

        if (particle.life > particle.maxLife) {
          particle.life = 0;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        const alpha = 1 - (particle.life / particle.maxLife);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = particle.color;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: 'screen'
      }}
    />
  );
};

// Home Page Component
const HomePage = () => {
  return (
    <div className="page">
      <ParticleSystem particleCount={30} />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            PSYCHE
          </h1>
          <p className="hero-subtitle">
            Explore consciousness through premium psychedelic experiences.
            <br />
            <span className="hero-accent">
              Scientifically curated. Responsibly sourced. Safely delivered.
            </span>
          </p>
          
          <div className="hero-buttons">
            <a href="/store" className="btn btn-primary">
              Explore Store →
            </a>
            <a href="/psychoactive-index" className="btn btn-secondary">
              🔬 Psychoactive Index
            </a>
          </div>
        </div>

        {/* Floating shapes */}
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-content">
          <h2 className="section-title">Why Choose PsycheCo?</h2>
          <p className="section-subtitle">
            We're committed to providing safe, educational, and transformative experiences
            through carefully curated psychedelic products and comprehensive resources.
          </p>
          
          <div className="features-grid">
            {[
              {
                title: "Lab Tested",
                description: "Every product undergoes rigorous testing for purity and potency",
                icon: "⚡"
              },
              {
                title: "Safe & Legal",
                description: "Compliant with local regulations and safety standards",
                icon: "❤️"
              },
              {
                title: "Educational",
                description: "Comprehensive guides and dosage information included",
                icon: "👁️"
              },
              {
                title: "Premium Quality",
                description: "Sourced from trusted suppliers with rigorous quality control",
                icon: "🌟"
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Store Page Component
const StorePage = () => {
  const [products] = useState(mockProducts.slice(0, 6)); // Show first 6 products
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['all', 'Psilocybin', 'DMT', 'Mescaline', 'Edibles'];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="page">
      <ParticleSystem particleCount={20} />
      
      <div className="page-header">
        <h1 className="page-title">Psychedelic Store</h1>
        <p className="page-subtitle">
          Explore our carefully curated collection of consciousness-expanding products
        </p>
      </div>

      <div className="store-content">
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <div className="product-overlay">
                  <button className="btn btn-small">👁️ View</button>
                  <button className="btn btn-small">🛒 Add</button>
                </div>
              </div>
              
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">${product.price}</div>
                
                <button 
                  className={`btn ${product.inStock ? 'btn-primary' : 'btn-disabled'}`}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Blog Page Component
const BlogPage = () => {
  const [posts] = useState(mockBlogPosts);

  return (
    <div className="page">
      <ParticleSystem particleCount={15} />
      
      <div className="page-header">
        <h1 className="page-title">Psychedelic Research & Insights</h1>
        <p className="page-subtitle">
          Stay informed with the latest research, guides, and perspectives on consciousness exploration
        </p>
      </div>

      <div className="blog-content">
        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-image">
                <img src={post.image} alt={post.title} />
              </div>
              
              <div className="post-content">
                <div className="post-meta">
                  <span>📅 {new Date(post.date).toLocaleDateString()}</span>
                  <span>👤 {post.author}</span>
                  <span>⏱️ {post.readTime} min read</span>
                </div>
                
                <h2 className="post-title">{post.title}</h2>
                <p className="post-excerpt">{post.excerpt}</p>
                
                <button className="btn btn-secondary">
                  Read More →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

// Psychoactive Index Page Component
const PsychoactiveIndexPage = () => {
  const [substances] = useState(mockSubstances);

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      case 'high': return 'risk-high';
      default: return 'risk-medium';
    }
  };

  return (
    <div className="page">
      <ParticleSystem particleCount={25} />
      
      <div className="page-header">
        <h1 className="page-title">Psychoactive Index</h1>
        <p className="page-subtitle">
          Comprehensive database of psychoactive substances with dosage, duration, 
          effects, and safety information for harm reduction and education.
        </p>
      </div>

      <div className="index-content">
        <div className="substances-grid">
          {substances.map((substance) => (
            <div key={substance.id} className="substance-card">
              <div className="substance-image">
                <img src={substance.image} alt={substance.name} />
                <div className={`risk-badge ${getRiskColor(substance.riskLevel)}`}>
                  {substance.riskLevel.toUpperCase()} RISK
                </div>
              </div>
              
              <div className="substance-content">
                <div className="substance-category">{substance.category}</div>
                <h3 className="substance-name">{substance.name}</h3>
                <p className="substance-description">{substance.description}</p>
                
                <div className="substance-info">
                  <div className="info-item">
                    <span className="info-label">Duration:</span>
                    <span>{substance.duration?.total || substance.duration}</span>
                  </div>
                </div>
                
                <div className="effects-list">
                  {substance.effects.slice(0, 3).map((effect, index) => (
                    <span key={index} className="effect-tag">
                      {effect}
                    </span>
                  ))}
                </div>
                
                <button className="btn btn-secondary">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="disclaimer">
          <h3>Educational Purpose Only</h3>
          <p>
            This information is provided for educational and harm reduction purposes only. 
            It is not intended to encourage illegal drug use. Always follow local laws and 
            consult healthcare professionals before using any psychoactive substances.
          </p>
        </div>
      </div>
    </div>
  );
};

// 404 Not Found Component
const NotFoundPage = () => (
  <div className="page">
    <div className="not-found">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-text">Page not found</p>
      <a href="/" className="btn btn-primary">Return Home</a>
    </div>
  </div>
);

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/psychoactive-index" element={<PsychoactiveIndexPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
# PsycheCo - Psychedelic Experience Platform

A modern React-based psychedelic e-commerce platform featuring interactive effects, comprehensive product catalog, educational content, and a psychoactive substance index.

## 🚀 Features

### Core Functionality
- **Multi-page React Application** with React Router DOM
- **Responsive Design** optimized for desktop and mobile
- **Dark/Light Theme Toggle** with localStorage persistence
- **Interactive Particle System** for immersive visual effects
- **Glass Morphism Design** with psychedelic color schemes
- **Smooth Animations** powered by CSS transitions and keyframes

### Pages & Components
- **Home Page** - Hero section with floating shapes and feature highlights
- **Store Page** - Product catalog with cards, categories, and cart functionality
- **Blog Page** - Educational articles and research insights
- **Psychoactive Index** - Comprehensive substance database with safety information
- **Navigation** - Responsive navbar with mobile menu support

### Design System
- **Vaporwave/Psychedelic Aesthetic** inspired by consciousness exploration
- **Professional UI Components** with hover effects and transitions
- **Accessible Design** with proper focus states and contrast ratios
- **Modular CSS** organized with custom properties and responsive breakpoints

## 🛠️ Technical Stack

- **React 18** with functional components and hooks
- **React Router DOM** for client-side routing
- **Modern CSS** with custom properties and grid layouts
- **Vanilla JavaScript** with ES6+ features
- **Vite** for fast development and optimized builds

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd psycheco-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Configuration
1. Copy `.env.example` to `.env`
2. Update the configuration values as needed:
   ```bash
   VITE_API_URL=http://localhost:3001
   VITE_ENABLE_ANIMATIONS=true
   VITE_ENABLE_PARTICLES=true
   ```

## 🎨 Design Philosophy

### Visual Language
- **Psychedelic Color Palette**: Purple, pink, cyan, and neon accents
- **Glass Morphism**: Translucent elements with backdrop blur
- **Gradient Backgrounds**: Multi-color gradients for depth and movement
- **Particle Effects**: Animated particles for ambient atmosphere

### User Experience
- **Intuitive Navigation**: Clear menu structure with visual feedback
- **Responsive Layout**: Optimized for all screen sizes
- **Fast Loading**: Optimized assets and efficient rendering
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🔧 Project Structure

```
src/
├── App.jsx           # Main application component
├── App.css           # Global styles and theme variables
├── main.jsx          # React DOM entry point
└── assets/           # Static assets (images, icons)

public/
├── index.html        # HTML template
├── vite.svg          # Favicon
└── favicon.png       # Alternative favicon

config/
├── tsconfig.json     # TypeScript configuration
├── tsconfig.node.json # Node.js TypeScript config
├── .env.example      # Environment variables template
└── README.md         # This file
```

## 🎯 Component Architecture

### Core Components
- **App**: Main application wrapper with routing
- **ThemeProvider**: Context provider for theme management
- **Navigation**: Responsive navbar with mobile menu
- **ParticleSystem**: Canvas-based particle animation system

### Page Components
- **HomePage**: Hero section with features grid
- **StorePage**: Product catalog with filtering
- **BlogPage**: Article listing with meta information
- **PsychoactiveIndexPage**: Substance database with safety info

### Utility Functions
- **Theme Management**: Dark/light mode with localStorage
- **Responsive Design**: Mobile-first approach with breakpoints
- **Animation System**: CSS-based transitions and keyframes

## 🎨 Styling Guide

### CSS Custom Properties
```css
/* Primary colors */
--primary-purple: #8b5cf6;
--primary-pink: #ec4899;
--primary-cyan: #06b6d4;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
--gradient-psychedelic: linear-gradient(135deg, #ff00ff 0%, #00ffff 25%, #ffff00 50%);

/* Glass morphism */
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
```

### Responsive Breakpoints
- **Mobile**: 480px and below
- **Tablet**: 768px and below  
- **Desktop**: 1024px and above

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Deployment Options
- **Vercel**: Connect GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Upload build files to S3 bucket with CloudFront
- **GitHub Pages**: Use GitHub Actions for automated deployment

## 🧪 Development Notes

### Code Quality
- **ESLint**: Configured for React best practices
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Type safety for better development experience

### Performance Optimizations
- **Lazy Loading**: Dynamic imports for code splitting
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: Service worker for offline functionality

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions or support, please create an issue in the GitHub repository or contact the development team.

---

**Disclaimer**: This platform is for educational and harm reduction purposes only. All content is provided for informational purposes and should not be considered medical advice. Please consult healthcare professionals and follow local laws and regulations.
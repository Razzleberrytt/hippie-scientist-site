# Psychedelic Website - Complete Deployment Guide

## 🎯 Project Overview

A fully functional psychedelic-themed website built with React + Vite + Tailwind CSS featuring:

- **Interactive Homepage** with animated particle background and vaporwave aesthetics
- **Educational Blog** with psychedelic research articles and safety information
- **Herb Index** with comprehensive psychoactive plant database and safety warnings
- **Product Store** with gummies, tinctures, teas, and ceremonial kits
- **Backend API Integration** via https://hippie-sciences.onrender.com/api
- **Responsive Design** optimized for mobile, tablet, and desktop
- **Modern Animations** using Framer Motion with glass morphism effects

## 🚀 Quick Start

### Option 1: Direct Frontend Development
```bash
# Run the frontend application
./start-frontend.sh

# Or manually:
export VITE_API_BASE_URL="https://hippie-sciences.onrender.com/api"
npx vite --config vite.config.client.ts
```

### Option 2: Build for Production
```bash
# Create production build
./build-frontend.sh

# Or manually:
npx vite build --config vite.config.client.ts
```

## 📁 Project Structure

```
psychedelic-website/
├── client/src/
│   ├── App.tsx                 # Main React application
│   ├── App.css                 # Psychedelic theme & animations
│   ├── main.tsx                # React DOM entry point
│   ├── components/
│   │   ├── Header.tsx          # Navigation with glass morphism
│   │   └── ParticleBackground.tsx # Interactive particle system
│   ├── pages/
│   │   ├── Home.tsx            # Landing page with hero section
│   │   ├── Blog.tsx            # Educational articles
│   │   ├── HerbIndex.tsx       # Plant database with modals
│   │   └── Store.tsx           # E-commerce with cart functionality
│   └── utils/
│       └── api.ts              # Backend API integration
├── public/
│   └── index.html              # SEO-optimized HTML template
├── .env                        # Environment configuration
├── vite.config.client.ts       # Vite build configuration
├── tailwind.config.ts          # Tailwind CSS setup
├── start-frontend.sh           # Development server script
├── build-frontend.sh           # Production build script
└── README-DEPLOYMENT.md        # This file
```

## 🎨 Key Features Implemented

### Visual Design
- **Psychedelic Color Palette**: Purple, pink, cyan, orange gradients
- **Glass Morphism UI**: Translucent cards with backdrop blur
- **Particle Animation System**: 30-50 interactive floating particles
- **Gradient Backgrounds**: Animated shifting colors
- **Smooth Transitions**: Framer Motion animations throughout

### Interactive Elements
- **Mouse/Touch Effects**: Particles respond to cursor movement
- **Ripple Buttons**: Animated feedback on user interactions
- **Hover Animations**: Scale and glow effects on cards
- **Smooth Navigation**: Mobile-responsive header with animations
- **Modal Windows**: Detailed views for herbs and products

### Content Management
- **Blog System**: Educational articles with category filtering
- **Herb Database**: Comprehensive plant information with safety warnings
- **Product Catalog**: E-commerce with cart and variant selection
- **API Integration**: Connects to external backend with fallback data

### Technical Features
- **Environment Variables**: Proper VITE_ prefix configuration
- **Responsive Design**: Mobile-first approach with breakpoints
- **SEO Optimization**: Meta tags and semantic HTML structure
- **Performance**: Code splitting and optimized bundle sizes
- **Error Handling**: Graceful API failure with sample data fallbacks

## 🌐 Deployment Options

### Netlify (Recommended)
```bash
# Build the project
./build-frontend.sh

# Drag and drop the 'dist' folder to netlify.com
# Or connect your Git repository for automatic deploys
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure:
# - Build Command: ./build-frontend.sh
# - Output Directory: dist
# - Environment: VITE_API_BASE_URL=https://hippie-sciences.onrender.com/api
```

### GitHub Pages
```bash
# Build the project
./build-frontend.sh

# Push dist folder to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

## ⚙️ Configuration

### Environment Variables
```bash
# .env file
VITE_API_BASE_URL=https://hippie-sciences.onrender.com/api
```

### Build Optimization
- Bundle splitting for vendor, router, animations, and API code
- Source maps for debugging
- Asset optimization and compression
- Modern ES modules with legacy fallbacks

### API Integration
- Axios-based HTTP client with interceptors
- Automatic error handling and retry logic
- Fallback to sample data when API unavailable
- Loading states and user feedback

## 🎯 Features Breakdown

### 1. Homepage (`/`)
- Hero section with animated text and call-to-action buttons
- Feature cards linking to main sections
- About section with mission statement
- Floating geometric shapes and particle effects

### 2. Blog (`/blog`)
- API integration with hippie-sciences.onrender.com
- Category filtering (science, culture, safety, research, legal)
- Article cards with excerpts and metadata
- Responsive grid layout with hover effects

### 3. Herb Index (`/herbs`)
- Searchable database of psychoactive plants
- Category filtering and detailed modal views
- Safety warnings and dosage information
- Legal status indicators with color coding

### 4. Store (`/store`)
- Product catalog with cart functionality
- Category-based filtering (gummies, tinctures, teas, kits)
- Product variants and detailed descriptions
- Stock status and pricing information

## 🔧 Customization Guide

### Branding
1. Update company name in `client/src/components/Header.tsx`
2. Modify colors in `client/src/App.css` CSS variables
3. Replace favicon and meta images in `public/`

### Content
1. Edit API endpoints in `client/src/utils/api.ts`
2. Update sample data fallbacks in each page component
3. Customize product categories and descriptions

### Styling
1. Adjust color palette in CSS custom properties
2. Modify animation speeds and effects
3. Update responsive breakpoints in Tailwind config

## 🐛 Troubleshooting

### Common Issues

**API Connection Errors**
- Check network connectivity to https://hippie-sciences.onrender.com
- Verify VITE_API_BASE_URL environment variable
- Sample data will load automatically as fallback

**Build Failures**
- Ensure all dependencies are installed: `npm install`
- Check Node.js version compatibility (16+ recommended)
- Verify file paths and imports are correct

**Styling Issues**
- Confirm Tailwind CSS is processing client files
- Check for conflicting CSS classes
- Verify custom CSS variables are defined

### Performance Optimization
1. Enable image optimization for faster loading
2. Implement lazy loading for product images  
3. Add service worker for PWA capabilities
4. Configure CDN for static asset delivery

## 📊 Technical Specifications

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.5+ with optimized config
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion for smooth effects
- **API Client**: Axios with interceptors and error handling
- **Routing**: React Router DOM for SPA navigation
- **Deployment**: Static site generation ready

## 🎉 Success Metrics

The application successfully delivers:

✅ **Interactive Visuals**: Particle system with mouse/touch effects  
✅ **Responsive Design**: Mobile-first layout with smooth animations  
✅ **API Integration**: Backend connectivity with graceful fallbacks  
✅ **Modern Tech Stack**: React + Vite + Tailwind CSS architecture  
✅ **SEO Ready**: Optimized meta tags and semantic HTML  
✅ **Deployment Ready**: Netlify-compatible build process  
✅ **User Experience**: Intuitive navigation and engaging interactions  

## 📞 Support

For deployment assistance or customization:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify environment variables and API endpoints
4. Test with different browsers and devices

---

**Ready for deployment!** Use `./build-frontend.sh` and deploy the `dist` folder to your preferred hosting platform.
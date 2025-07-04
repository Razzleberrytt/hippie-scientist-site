# PsycheCo Frontend Deployment Guide

## 📁 Project Structure Summary

This is a complete standalone React application with the following key files:

```
psycheco-frontend/
├── public/
│   ├── index.html          # Main HTML template
│   └── vite.svg           # Favicon
├── src/
│   ├── App.jsx            # Main React application
│   ├── App.css            # Complete styling and theme system
│   ├── main.jsx           # React DOM entry point
│   └── data/
│       └── mockData.js    # Sample products, blog posts, substances
├── package-frontend.json   # Frontend-only dependencies
├── vite-frontend.config.js # Vite configuration
├── run-frontend.sh        # Quick start script
├── README.md              # Comprehensive documentation
└── DEPLOYMENT.md          # This file
```

## 🚀 Quick Start (Recommended)

### Option 1: Auto-Setup Script
```bash
# Make the script executable and run
chmod +x run-frontend.sh
./run-frontend.sh
```

### Option 2: Manual Setup
```bash
# 1. Copy the frontend package.json
cp package-frontend.json package.json

# 2. Copy the frontend vite config
cp vite-frontend.config.js vite.config.js

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

## 🌐 Deployment Options

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Follow prompts, build command: npm run build
# Output directory: dist
```

### 2. Netlify
```bash
# Build the project
npm run build

# Drag and drop the 'dist' folder to netlify.com
# Or connect your GitHub repository
```

### 3. GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

### 4. AWS S3 + CloudFront
```bash
# Build the project
npm run build

# Upload dist folder to S3 bucket
# Enable static website hosting
# Configure CloudFront distribution
```

## 🛠️ Build Configuration

### Environment Variables (Optional)
Create `.env` file for customization:
```bash
VITE_BRAND_NAME=PsycheCo
VITE_ENABLE_PARTICLES=true
VITE_ENABLE_ANIMATIONS=true
VITE_API_URL=https://your-backend-api.com
```

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📋 Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Application builds successfully (`npm run build`)
- [ ] All pages load correctly in browser
- [ ] Navigation works between all routes
- [ ] Responsive design tested on mobile
- [ ] Theme toggle functionality verified
- [ ] Particle effects and animations working
- [ ] Mock data displays properly

## 🔧 Customization Guide

### Branding
1. Update `src/App.jsx` - Change "PsycheCo" to your brand name
2. Modify `src/App.css` - Update color variables in `:root`
3. Replace `public/vite.svg` with your logo
4. Update `public/index.html` meta tags

### Content
1. Edit `src/data/mockData.js` to add your products/content
2. Update product images, descriptions, and pricing
3. Modify blog posts and substance database entries
4. Customize FAQ and testimonials

### Styling
1. Colors: Modify CSS custom properties in `src/App.css`
2. Fonts: Add font imports to `public/index.html`
3. Layout: Adjust grid systems and spacing variables
4. Animations: Enable/disable in CSS or via environment variables

## 🐛 Troubleshooting

### Common Issues

**Build fails with "React is not defined"**
- Ensure `@vitejs/plugin-react` is installed
- Check that `vite.config.js` includes the React plugin

**Routing doesn't work on production**
- Configure your hosting provider for SPA routing
- Ensure all routes redirect to `index.html`

**Images not loading**
- Verify image URLs are accessible
- Check console for 404 errors
- Consider using relative paths for local images

**Styles not applying**
- Ensure `App.css` is imported in `App.jsx`
- Check for CSS syntax errors
- Verify CSS custom properties are defined

### Performance Optimization

1. **Image Optimization**
   - Use WebP format with JPEG fallbacks
   - Implement lazy loading for product images
   - Optimize image sizes (400x400 for products, 600x400 for blog)

2. **Code Splitting**
   - Add React.lazy() for page components
   - Implement Suspense boundaries
   - Use dynamic imports for large dependencies

3. **Bundle Analysis**
   ```bash
   npm install --save-dev vite-bundle-analyzer
   npx vite-bundle-analyzer
   ```

## 📊 Analytics & Monitoring

### Google Analytics Setup
1. Add GA tracking ID to environment variables
2. Install Google Analytics package: `npm install gtag`
3. Add tracking code to `src/main.jsx`

### Error Monitoring
1. Install Sentry: `npm install @sentry/react`
2. Configure error boundary in `src/App.jsx`
3. Add performance monitoring

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use `.env.local` for local development
   - Prefix public variables with `VITE_`

2. **Content Security Policy**
   - Add CSP headers in hosting configuration
   - Whitelist external image domains (Unsplash)

3. **Legal Compliance**
   - Update privacy policy and terms of service
   - Ensure age verification where required
   - Add proper disclaimers for educational content

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main README.md file
3. Open an issue in the project repository
4. Contact the development team

---

**Note**: This is a demonstration/educational project. Ensure compliance with local laws and regulations before deploying for commercial use.
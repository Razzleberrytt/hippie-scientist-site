# replit.md

## Overview

This is a psychedelic-themed website featuring React + Vite + Tailwind CSS with animated interactive visuals, educational content, and e-commerce functionality. The application includes a homepage with particle effects, blog posts section, psychoactive herb index, and storefront with premium products. Built for consciousness exploration with modern web technologies and responsive design.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with structured error handling
- **Session Management**: Express sessions with PostgreSQL storage

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend server
- `shared/` - Shared TypeScript schemas and types
- `components.json` - shadcn/ui configuration
- `drizzle.config.ts` - Database configuration

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Migration Strategy**: Database push for schema updates
- **Connection**: Neon Database serverless connection

### API Layer
- **Products**: CRUD operations for product catalog
- **Reviews**: Customer review system
- **FAQ**: Frequently asked questions
- **Newsletter**: Email subscription system
- **Contact**: Customer contact form

### Frontend Components
- **Product Showcase**: Dynamic product grid with category filtering
- **Customer Reviews**: Review display with ratings
- **FAQ Section**: Collapsible accordion interface
- **Newsletter Signup**: Email subscription form
- **Contact Form**: Customer inquiry form
- **Navigation**: Responsive navigation with mobile menu

### Storage Layer
- **Implementation**: In-memory storage for development
- **Interface**: `IStorage` interface for data operations
- **Data Types**: Products, Reviews, FAQ, Newsletter, Contact

## Data Flow

1. **Client Request**: React components make API calls using TanStack Query
2. **API Processing**: Express routes handle requests and validate data
3. **Data Layer**: Storage interface abstracts database operations
4. **Response**: JSON responses with proper error handling
5. **State Updates**: TanStack Query manages cache and UI updates

## External Dependencies

### Core Framework Dependencies
- React 18 with TypeScript
- Express.js with middleware support
- Drizzle ORM with Neon Database driver
- Vite for build tooling

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Custom CSS variables for theming
- Lucide icons for iconography

### Form and Validation
- React Hook Form for form management
- Zod for schema validation
- Hookform resolvers for integration

### Development Tools
- TypeScript for type safety
- ESLint and Prettier for code quality
- Vite dev server with HMR
- Replit-specific development plugins

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Asset Handling**: Static assets served from build directory

### Environment Configuration
- **Development**: `NODE_ENV=development` with Vite dev server
- **Production**: `NODE_ENV=production` with built assets
- **Database**: `DATABASE_URL` environment variable required

### Server Configuration
- **Port**: Configurable via environment or default
- **Static Files**: Served from build directory in production
- **API Routes**: Prefixed with `/api`
- **Error Handling**: Centralized error middleware

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
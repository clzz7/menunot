# Delivery Platform - Individual Restaurant Solution

## Overview

This is a full-stack delivery platform designed for individual restaurants to have their own branded delivery system without competing with other establishments. The platform features an intelligent WhatsApp-based customer recognition system, real-time order tracking, and a comprehensive admin panel.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React Query (TanStack Query) for server state, custom hooks for client state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API**: RESTful endpoints with WebSocket support for real-time updates
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: In-memory sessions with PostgreSQL store option

### Key Components

#### Customer Experience
- **Intelligent Login System**: WhatsApp-based customer recognition that auto-fills customer data on return visits
- **Shopping Cart**: Real-time cart management with local state persistence
- **Checkout Flow**: Multi-step checkout with address validation and payment method selection
- **Order Tracking**: Real-time order status updates via WebSocket connection

#### Admin Panel
- **Dashboard**: Real-time order monitoring with notifications
- **Order Management**: Status updates, order details, and customer communication
- **Product Management**: CRUD operations for menu items and categories
- **Customer Management**: Customer database with order history
- **Settings**: Restaurant configuration, payment methods, and business hours

#### Real-time Features
- **WebSocket Integration**: Real-time order notifications for admin
- **Order Status Updates**: Live tracking for customers
- **Admin Notifications**: New order alerts with browser notifications

## Data Flow

### Customer Journey
1. Customer browses menu without authentication
2. Adds items to cart (stored in local state)
3. Initiates checkout and enters WhatsApp number
4. System automatically recognizes returning customers and pre-fills data
5. Customer confirms order details and payment method
6. Order is created and real-time notifications are sent
7. Customer receives order tracking interface

### Admin Workflow
1. Admin receives real-time notifications for new orders
2. Order details are displayed with customer information
3. Admin can update order status through the management interface
4. Status updates are broadcast to customers via WebSocket
5. Order history and analytics are maintained

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection Pooling**: Configured for serverless environments

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Replit Integration**: Development environment optimizations
- **Vite Plugins**: Runtime error handling and development enhancements

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Static Assets**: Served from `dist/public` directory

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Development**: Runs with hot module replacement and error overlays
- **Production**: Serves static files with Express.js

### Database Schema
- **Establishments**: Restaurant configuration and branding
- **Customers**: WhatsApp-based customer profiles
- **Products/Categories**: Menu management
- **Orders**: Order tracking with status workflow
- **Coupons**: Discount code system

The architecture prioritizes simplicity, real-time functionality, and a seamless customer experience while providing restaurant owners with complete control over their delivery platform.

## Database Configuration

### Current Setup
- **Database**: PostgreSQL (Replit managed)
- **Connection**: Neon serverless with connection pooling
- **ORM**: Drizzle ORM with pg-core
- **Schema**: Located in `shared/schema.ts`

### Migration Completed
The application has been successfully migrated to PostgreSQL:
- ✅ PostgreSQL database provisioned in Replit
- ✅ Schema updated to use pg-core instead of sqlite-core
- ✅ Database connection configured with Neon serverless
- ✅ Tables created and seeded with initial data
- ✅ All API endpoints working with PostgreSQL

## Changelog
```
Changelog:
- July 11, 2025: ✅ Added "Mais Pedidos Hoje" featured section with horizontal carousel before categories
- July 11, 2025: ✅ Implemented popular items cards with 80x80px images, prices, and "Mais Pedido" badges
- July 11, 2025: ✅ Created visual badges system: "NOVIDADE" (red), "PROMOÇÃO" (green), "VEGETARIANO" (light green)
- July 11, 2025: ✅ Added personalized icons for badges: Sparkles, Tag, and Leaf respectively
- July 11, 2025: ✅ Implemented comprehensive micro-interactions with scale(1.02) hover effects
- July 11, 2025: ✅ Added skeleton loading animation with gradient background for loading states
- July 11, 2025: ✅ Created smooth transitions (0.3s ease) for all interactive elements
- July 11, 2025: ✅ Implemented badge pulse animation every 2 seconds for featured items
- July 11, 2025: ✅ Added scroll-hide functionality for horizontal carousels
- July 11, 2025: ✅ Enhanced product cards with hover effects and badges overlay system
- July 11, 2025: ✅ Implemented rating system with 5 golden stars (#FFD700), 4.8 rating, and 324 reviews count
- July 11, 2025: ✅ Added category information display after bullet point in rating section
- July 11, 2025: ✅ Enhanced category navigation with 48px height buttons and personalized icons
- July 11, 2025: ✅ Added Grid icon for "Todos", Sandwich icon for "Hambúrgueres", and Beef icon for "Batatas"
- July 11, 2025: ✅ Implemented smooth transitions and hover effects for category buttons
- July 11, 2025: ✅ Redesigned search bar with 44px height, #F8F9FA background, and #E0E0E0 border
- July 11, 2025: ✅ Added enhanced placeholder text and focus micro-interactions with colored border
- July 11, 2025: ✅ Implemented CSS animations for button states and search input transitions
- July 11, 2025: ✅ Added box-shadow effects for active category buttons with primary color
- July 11, 2025: ✅ Improved layout and spacing with max-width: 400px container and centered design
- July 11, 2025: ✅ Added subtle background gradient from white to #F8F9FA for better visual hierarchy
- July 11, 2025: ✅ Increased padding from 16px to 24px for better mobile experience
- July 11, 2025: ✅ Updated section spacing from 16px to 32px for cleaner visual separation
- July 11, 2025: ✅ Redesigned essential information cards with 2x2 grid layout and colored icons
- July 11, 2025: ✅ Added delivery time (25-30 min), fee (R$ 4,99), distance (2.5km), and minimum order (R$ 25,00) cards
- July 11, 2025: ✅ Implemented #F5F5F5 background with 12px border-radius for information cards
- July 11, 2025: ✅ Added hover effects and micro-animations to information cards
- July 11, 2025: ✅ Enhanced typography with professional color scheme for card labels and values
- July 11, 2025: ✅ Implemented modern typography with Montserrat and Roboto fonts for better readability
- July 11, 2025: ✅ Redesigned title with gradient styling (orange #FF6B35 to #FF8C42) and improved letter spacing
- July 11, 2025: ✅ Redesigned status button with gradient green background, rounded corners, and micro-animation
- July 11, 2025: ✅ Added check/cross icons to status button for better visual feedback
- July 11, 2025: ✅ Implemented subtle pulsing animation for status button every 3 seconds
- July 11, 2025: ✅ Enhanced typography hierarchy with improved line-height and color contrast
- July 11, 2025: ✅ Redesigned hero header with professional banner layout inspired by modern restaurant designs
- July 11, 2025: ✅ Implemented hero image with food photography and content area with cream background 
- July 11, 2025: ✅ Added "PEDIDOS ONLINE" title in green-800, order type selector (Retirada/Delivery)
- July 11, 2025: ✅ Created custom color palette with cream-50, green-800, and green-500 variables
- July 11, 2025: ✅ Added order information section with time and address details
- July 11, 2025: ✅ Unified color scheme with warm orange/amber tones replacing random blue/green/purple colors
- July 11, 2025: ✅ Updated status icons and customer info cards to use consistent color palette
- July 11, 2025: ✅ Corrected Hot Dog product image (was showing pizza, now shows proper hot dog)
- July 11, 2025: ✅ Removed progress bar from toast notifications for cleaner design
- July 11, 2025: ✅ Simplified toast system using native Radix UI duration instead of custom progress bar
- July 11, 2025: ✅ Redesigned menu cards with professional layout following specific design requirements
- July 11, 2025: ✅ Implemented two-column layout (40% image, 60% text) with rounded corners and shadow effects
- July 11, 2025: ✅ Added custom color palette with professional typography hierarchy
- July 11, 2025: ✅ Removed allergen icons and optimized button positioning for cleaner design  
- July 11, 2025: ✅ Implemented minimalist card design with separator lines instead of borders and shadows
- July 11, 2025: ✅ Added professional product images for all menu items using Unsplash API
- July 11, 2025: ✅ Updated all 10 products with appropriate high-quality photos matching their descriptions
- July 11, 2025: ✅ Applied consistent spacing and visual hierarchy for product information
- July 11, 2025: ✅ Enhanced product card aesthetics with glassmorphism shadow effects
- July 10, 2025: ✅ Fixed "Meus Pedidos" page layout issues - repositioned "Trocar Usuário" button and improved customer info display
- July 10, 2025: ✅ Redesigned customer information section with organized card layout and colored icons
- July 10, 2025: ✅ Created responsive grid layout for customer stats (phone, orders, total spent)
- July 10, 2025: ✅ Updated menu card design with horizontal layout - image on left, details on right
- July 10, 2025: ✅ Added product code display and improved typography for better readability
- July 10, 2025: ✅ Enhanced responsive design for mobile and desktop menu viewing
- July 10, 2025: ✅ Project migration from Replit Agent to Replit environment completed successfully
- July 8, 2025: ✅ Fixed PIX payment authorization error with fallback to MercadoPago preferences
- July 8, 2025: ✅ Added better error handling and CPF identification for PIX payments
- July 8, 2025: ✅ Implemented redirect fallback when direct PIX API fails
- July 8, 2025: ✅ Toast system redesigned with minimalista design and smooth animations
- July 8, 2025: ✅ Toast moved to bottom of screen with progress bar and glassmorphism effect
- July 8, 2025: ✅ Added icons and improved typography for better visual feedback
- July 8, 2025: ✅ Migration from Replit Agent to Replit completed successfully
- July 8, 2025: ✅ .env file configured with PostgreSQL database and MercadoPago credentials
- July 8, 2025: ✅ Database connection switched from SQLite to PostgreSQL
- July 8, 2025: ✅ All API endpoints verified working with proper data
- July 8, 2025: ✅ MercadoPago webhook configured with proper URL endpoint
- July 8, 2025: ✅ Complete project migration and configuration verified
- July 6, 2025: Database recreated with lanchonete (burger place) theme
- July 6, 2025: UI improvements: removed orange CTA card, fixed cart button alignment
- July 6, 2025: Enhanced order history with detailed item breakdown
- July 5, 2025: Migration from Replit Agent to Replit completed
- July 5, 2025: PostgreSQL database migrated and configured successfully
- July 5, 2025: Database preparation for PostgreSQL migration
- June 27, 2025: Initial setup
```

## User Preferences

Preferred communication style: Simple, everyday language.
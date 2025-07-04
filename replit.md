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
- July 5, 2025: Migration from Replit Agent to Replit completed
- July 5, 2025: PostgreSQL database migrated and configured successfully
- July 5, 2025: Database preparation for PostgreSQL migration
- June 27, 2025: Initial setup
```

## User Preferences

Preferred communication style: Simple, everyday language.
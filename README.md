# Overview

LinkVault is a privacy-first "Link in Bio" application that allows users to create personal pages for sharing links, profile information, and bios. The application emphasizes minimal data collection and maximum user privacy by requiring only a username and password for registration, with an innovative recovery key system replacing traditional email-based authentication.

The platform provides a clean, customizable interface where users can manage their public profiles accessible via unique URLs (app.com/u/username), add and organize links with various icons, and maintain complete control over their data without mandatory email collection.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and build tooling
- **Routing**: Wouter for client-side routing with protected route handling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with Local Strategy and session-based authentication
- **Security**: Scrypt for password hashing, custom recovery key generation and validation
- **Session Management**: Express sessions stored in PostgreSQL using connect-pg-simple

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Two primary entities - users and links with proper foreign key relationships
- **Users Table**: Stores username, hashed password, optional profile data, and recovery key hash
- **Links Table**: Stores user links with title, URL, icon, and ordering information
- **Migrations**: Drizzle Kit for schema migrations and database management

## Authentication System
- **Registration**: Username and password only with generated recovery key
- **Recovery Mechanism**: Custom recovery key system replacing email-based password reset
- **Password Security**: Scrypt hashing with salt for password storage
- **Session Security**: PostgreSQL-backed sessions with proper cleanup and expiration

## API Structure
- **Public Endpoints**: Profile viewing by username without authentication
- **Protected Endpoints**: Dashboard operations requiring session authentication
- **RESTful Design**: CRUD operations for user profile and link management
- **Error Handling**: Centralized error handling with proper HTTP status codes

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Connection**: WebSocket-based connection for serverless compatibility

## UI Framework
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom theming
- **Lucide Icons**: Icon system for consistent visual elements

## Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **PostCSS**: CSS processing with Tailwind integration

## Authentication & Security
- **Passport.js**: Authentication middleware with Local Strategy
- **Argon2/bcrypt**: Password hashing libraries for security
- **Express Session**: Session management with PostgreSQL storage

## Form Handling
- **React Hook Form**: Performance-optimized form library
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## State Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Query DevTools**: Development debugging for query states
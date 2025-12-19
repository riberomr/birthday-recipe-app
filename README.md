# Birthday Recipe App

A production-ready recipe sharing platform built with Next.js 16, featuring user authentication, recipe management, community interactions, and comprehensive testing coverage.

## Project Overview

This application provides a full-featured recipe platform where users can:

- Browse and search recipes with advanced filtering
- Create, edit, and share recipes with images
- Rate and comment on recipes
- Save favorites and view personalized collections
- Follow step-by-step cooking mode with wake lock support

The application uses a modern serverless architecture with Firebase Authentication and Supabase for data persistence, deployed on Vercel with automated CI/CD pipelines.

## Tech Stack

### Core Framework
- Next.js 16.0.10 (App Router)
- React 19.2.3
- TypeScript 5

### Authentication & Database
- Firebase 12.6.0 (Authentication)
- Firebase Admin 13.6.0 (Server-side auth)
- Supabase 2.45.0 (PostgreSQL database)

### UI & Styling
- Tailwind CSS 3.4.13
- Radix UI (Avatar, Dropdown Menu, Select)
- Framer Motion 11.5.6
- Lucide React (Icons)
- next-themes 0.4.6 (Dark mode)
- Swiper 12.0.3 (Carousels)

### Testing
- Jest 30.2.0
- React Testing Library 16.3.1
- jest-environment-jsdom 30.2.0
- @testing-library/user-event 14.6.1

### Build & Deployment
- Vercel (CI/CD)
- PostCSS 8.4.47
- Autoprefixer 10.4.20

### Utilities
- browser-image-compression 2.0.2
- clsx 2.1.1
- class-variance-authority 0.7.0
- tailwind-merge 2.5.2

## Project Structure

```
birthday-recipe-app/
├── app/                      # Next.js App Router pages and API routes
│   ├── api/                  # Server-side API endpoints
│   ├── recipes/              # Recipe-related pages
│   ├── favorites/            # User favorites page
│   ├── fotos/                # Community photos page
│   └── __tests__/            # App-level tests
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   └── __tests__/            # Component tests
├── features/                 # Feature-specific modules
│   └── auth/                 # Authentication feature
├── hooks/                    # Custom React hooks
├── lib/                      # Shared utilities and configurations
│   ├── api/                  # API client functions
│   ├── auth/                 # Authentication utilities
│   ├── contexts/             # React contexts
│   ├── firebase/             # Firebase configuration
│   └── supabase/             # Supabase configuration
├── public/                   # Static assets
├── supabase/                 # Supabase migrations and config
├── types/                    # TypeScript type definitions
└── coverage/                 # Test coverage reports
```

### Key Directories

- **app/**: Contains all Next.js pages and API routes using the App Router pattern
- **components/**: Reusable React components with co-located tests
- **lib/**: Shared utilities, API clients, and third-party service configurations
- **features/**: Feature-based modules (authentication, etc.)
- **hooks/**: Custom React hooks for shared logic

## Testing & Coverage

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run CI tests with coverage threshold
npm run test:coverage:ci
```

### Coverage Requirements

This project enforces strict test coverage requirements:

- **Minimum Coverage Threshold**: 90% for all metrics
  - Branches: 90%
  - Functions: 90%
  - Lines: 90%
  - Statements: 90%

- **Development Target**: 100% coverage (enforced in jest.config.js)
- **CI Threshold**: 90% minimum (enforced in build:ci script)

### Coverage Enforcement

- **Local Development**: Tests run with 100% coverage target
- **CI/CD Pipeline**: Build fails if coverage drops below 90%
- **Build Process**: `npm run build:ci` runs tests before building
- **Excluded Files**: Configuration files, type definitions, and third-party client libraries are excluded from coverage

### Test Configuration

Tests are configured to use React's development build to ensure `React.act` is available in all environments (local and CI). This is critical for async testing with React Testing Library.

## Development Workflow

### Branch Protection

Direct pushes to the `main` branch are **not allowed**. All changes must go through a Pull Request.

### Pull Request Requirements

Every PR must:

1. **Pass all tests** - No failing tests allowed
2. **Meet coverage requirements** - Minimum 90% coverage threshold
3. **Be reviewed** - At least one approval required before merging
4. **Pass CI checks** - Vercel deployment preview must succeed

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Check coverage
npm run test:coverage
```

The development server runs on [http://localhost:3000](http://localhost:3000).

## Branch Naming Convention

Use the following prefixes for branch names:

- **feature/xxx** - New features or enhancements
  - Example: `feature/recipe-sharing`
  
- **refactor/xxx** - Code refactoring without changing functionality
  - Example: `refactor/api-client-structure`
  
- **bugfix/xxx** - Bug fixes for non-critical issues
  - Example: `bugfix/comment-submission-error`
  
- **hotfix/xxx** - Critical bug fixes that need immediate deployment
  - Example: `hotfix/authentication-failure`

## Commit & PR Guidelines

### Commit Messages

- Write clear, concise commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issue numbers when applicable

### Pull Requests

- **Keep PRs focused** - One feature or fix per PR
- **Small, reviewable changes** - Avoid massive PRs
- **Avoid mixing concerns** - Don't combine refactors with features unless necessary
- **Update tests** - Include tests for new functionality
- **Maintain coverage** - Ensure coverage doesn't drop

### Code Review

- Address all review comments before merging
- Request re-review after making changes
- Ensure CI passes before requesting review

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Deployment

The application is deployed on Vercel with automatic deployments:

- **Production**: Deploys from `main` branch
- **Preview**: Deploys from all PRs
- **Build Command**: `npm run build:ci` (includes test coverage check)

### Build Process

1. Run test suite with coverage
2. Verify coverage meets 90% threshold
3. Build Next.js application
4. Deploy to Vercel

If tests fail or coverage is below threshold, the build will fail and deployment will not proceed.

## License

Private project - All rights reserved.

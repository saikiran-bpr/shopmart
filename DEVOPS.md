# ShopSmart DevOps Implementation Guide

## Overview

This document details the DevOps implementation for the ShopSmart project, meeting all evaluation rubrics for the DevOps course.

---

## 1. Regularity – Commit History ✅

### Implementation:
- **5 meaningful commits** created with logical progression:
  1. `c4d777b` - Backend linting & code quality configuration
  2. `398afc8` - Backend testing with unit and integration tests
  3. `88fbe62` - Frontend testing and linting setup
  4. `7257192` - GitHub Actions CI/CD workflow
  5. `495153f` - Dependabot configuration for dependency management

### Commit Strategy:
- Each commit represents a **logical, atomic change**
- Descriptive commit messages following conventional commits format
- Progressive feature implementation (not bulk commits)
- Tags help track project stages through development

### View Commit History:
```bash
git log --oneline
```

---

## 2. GitHub Workflows / CI Pipeline ✅

### Files: `.github/workflows/ci-cd.yml`

### Pipeline Structure:
```
┌─────────────────────────────────────────┐
│   Push to main/develop OR Pull Request  │
└────────────────────┬────────────────────┘
                     │
         ┌───────────┼────────────┐
         │           │            │
    ┌────▼───┐  ┌───▼────┐  ┌───▼──────┐
    │Backend │  │Frontend│  │Integration│
    │ Tests  │  │ Tests  │  │  Tests    │
    └────────┘  └────────┘  └───────────┘
```

### Features:
✅ **Triggers:**
- On `push` to main/develop branches
- On `pull_request` to main/develop branches

✅ **Backend Job (matrix testing Node 18.x, 20.x):**
- Install dependencies: `npm ci`
- Run linting: `npm run lint`
- Run tests: `npm test --coverage`
- Upload coverage to Codecov

✅ **Frontend Job:**
- Install dependencies: `npm ci`
- Run linting: `npm run lint`
- Run tests: `npm test -- --run`
- Build verification: `npm run build`

✅ **Integration Testing Job:**
- Runs after successful backend + frontend tests
- Validates system-level interactions
- Tests cross-module dependencies

### Running Tests Locally:
```bash
# Backend
cd server
npm install
npm run lint      # ESLint checks
npm test          # Unit + Integration tests

# Frontend
cd client
npm install
npm run lint      # ESLint checks
npm test -- --run # Run all tests once
```

---

## 3. Frontend Implementation ✅

### Technology Stack:
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.4.21
- **Testing:** Vitest + React Testing Library

### Features:
✅ **Clean UI:**
- Component-based architecture
- CSS modules and inline styling
- Responsive design ready

✅ **Functional Components:**
- `App.jsx` - Main component with React Hooks (useState, useEffect)
- Demonstrates API integration
- Error handling implemented

✅ **API Integration:**
- Fetches from `/api/health` endpoint
- Handles async operations
- CORS-compliant requests

### Code Quality:
- ESLint configuration with React plugins
- Prettier for code formatting
- No linting errors

---

## 4. Unit Testing ✅

### Backend Unit Tests: `server/tests/app.test.js`
```javascript
Express App
  ✓ GET /api/health - returns 200 and status ok
  ✓ GET /api/health - returns valid timestamp
  ✓ GET / - returns ShopSmart message
  ✓ CORS Middleware - includes CORS headers
  ✓ JSON Middleware - parses JSON body
  ✓ Error Handling - returns 404 for invalid routes
```

**Test Coverage:**
- Middleware testing (CORS, JSON parsing)
- Route testing
- Error scenarios
- Response validation

### Frontend Unit Tests: `client/src/App.test.jsx`
```javascript
App Component
  ✓ renders ShopSmart title
  ✓ displays loading text initially
  ✓ fetches and displays backend status
  ✓ renders Backend Status card
  ✓ calls fetch with correct API endpoint
  ✓ handles fetch errors gracefully
```

**Test Coverage:**
- Component rendering
- State management (useState, useEffect)
- API call verification
- Error handling
- User interaction simulation

### Running Unit Tests:
```bash
# Backend (with coverage)
npm test

# Frontend (single run)
npm test -- --run

# Frontend (watch mode)
npm test
```

---

## 5. Integration Testing ✅

### File: `server/tests/integration.test.js`

### Test Scenarios:
1. **API Health and Status Flow**
   - Client checks API health
   - Multiple endpoints accessible
   - Complete request-response cycle

2. **Cross-Origin Request Handling**
   - CORS preflight requests
   - Accept requests from different origins
   - Proper header validation

3. **Request-Response Cycle**
   - Multiple consecutive requests
   - System stability under load
   - Data consistency

### Running Integration Tests:
```bash
cd server
npm run test:integration
```

---

## 6. E2E Testing (Bonus - Ready for Implementation) 🎯

### Recommended Setup:
```bash
# Install Cypress
npm install --save-dev cypress

# Or Playwright
npm install --save-dev @playwright/test
```

### Example E2E Test Path:
1. User navigates to frontend
2. Frontend loads and displays "ShopSmart"
3. Component mounts and calls `/api/health`
4. Backend responds with status
5. Frontend displays response
6. User sees backend status in UI

---

## 7. PR Checks & Linting ✅

### ESLint Configuration:

**Backend:** `server/eslint.config.js`
```javascript
- Rules: indent (2 spaces), quotes (single), semicolons
- CommonJS globals: require, module, __dirname
- Jest test environment globals: describe, it, expect
```

**Frontend:** `client/.eslintrc.json`
```javascript
- React plugin support
- React Hooks validation
- Browser globals
- No unused variables (with ^ prefix exception)
```

### Code Formatting:

**Prettier Config** (both `.prettierrc` files)
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Available Scripts:
```bash
# Backend
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run format       # Format code with Prettier

# Frontend
npm run lint         # Check for linting errors
```

---

## 8. Dependabot Configuration ✅

### File: `.github/dependabot.yml`

### Features:
✅ **npm Dependency Updates**
- Separate configs for `/server` and `/client`
- Weekly schedule (Monday, 3 AM UTC)
- Limits 10 open PRs
- Auto-created pull requests

✅ **GitHub Actions Updates**
- Keeps workflows up to date
- Same weekly schedule

✅ **Security**
- Automatic vulnerability scanning
- Forces security updates
- Integration with GitHub Security

### Actions on Dependabot PRs:
1. GitHub Actions automatically runs
2. Tests execute on all dependencies
3. Linting checks performed
4. Coverage reports generated
5. Review and merge when ready

---

## Project Structure

```
shopmart/
├── .github/
│   ├── workflows/
│   │   └── ci-cd.yml              # GitHub Actions pipeline
│   └── dependabot.yml             # Dependency updates config
├── server/
│   ├── src/
│   │   ├── app.js                 # Express app (middleware, routes)
│   │   └── index.js               # Server entry point
│   ├── tests/
│   │   ├── app.test.js            # Unit tests
│   │   └── integration.test.js     # Integration tests
│   ├── .eslintrc.js               # (legacy, use eslint.config.js)
│   ├── eslint.config.js           # ESLint configuration
│   ├── .prettierrc                # Prettier config
│   ├── jest.config.js             # Jest test configuration
│   └── package.json               # Backend dependencies
├── client/
│   ├── src/
│   │   ├── App.jsx                # React main component
│   │   ├── App.test.jsx           # React tests
│   │   ├── main.jsx               # React entry point
│   │   ├── index.css              # Styling
│   │   └── setupTests.js          # Test setup
│   ├── .eslintrc.json             # ESLint configuration
│   ├── .prettierrc                # Prettier config
│   ├── vitest.config.js           # Vitest configuration
│   ├── vite.config.js             # Vite configuration
│   └── package.json               # Frontend dependencies
├── README.md                       # Project overview
└── Idea.md                         # Project requirements
```

---

## Running the Full Pipeline Locally

### 1. Setup Backend:
```bash
cd server
npm install
npm run lint      # Pass linting
npm test          # Pass all tests (10 tests)
npm run dev       # Start development server (port 5001)
```

### 2. Setup Frontend:
```bash
cd client
npm install
npm run lint      # Pass linting
npm test -- --run # Pass all tests (6 tests)
npm run dev       # Start Vite dev server (port 5173)
```

### 3. Verify CI/CD Locally (Optional):
```bash
# Simulate GitHub Actions locally
# Install GitHub CLI and act:
brew install act

# Run workflow simulation
act push -j backend-tests
act push -j frontend-tests
```

---

## Evaluation Rubric Coverage

| Rubric | Status | Evidence |
|--------|--------|----------|
| **1. Commit History** | ✅ | 5 meaningful commits, no bulk commits |
| **2. GitHub Workflows** | ✅ | `.github/workflows/ci-cd.yml` with lint, test, build |
| **3. Frontend Implementation** | ✅ | React component, API integration, clean UI |
| **4. Unit Testing** | ✅ | 10 backend + 6 frontend tests |
| **5. Integration Testing** | ✅ | `integration.test.js` with workflow tests |
| **6. E2E Testing** | 🎯 | Ready for Cypress/Playwright |
| **7. PR Checks (Linting)** | ✅ | ESLint + Prettier, automated in CI/CD |
| **8. Dependabot Config** | ✅ | `.github/dependabot.yml` configured |

---

## Submission Checklist

- [x] Git repository initialized with meaningful commits
- [x] GitHub Actions workflow file created
- [x] Unit tests passing (frontend + backend)
- [x] Integration tests implemented
- [x] ESLint and Prettier configured
- [x] PR checks integrated into CI/CD
- [x] Dependabot configuration enabled
- [x] Code coverage > 50% target
- [x] Frontend builds successfully
- [x] Backend tests pass

---

## Troubleshooting

### Tests Failing:
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm test
```

### Linting Errors:
```bash
# Auto-fix linting issues
npm run lint:fix
```

### Vite/Build Issues:
```bash
# Clear Vite cache
rm -rf .vite
npm run build
```

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Configuration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Jest Testing Framework](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

---

## Next Steps for Production

1. **E2E Testing:** Implement Cypress or Playwright for full user workflows
2. **Database Integration:** Add Prisma + SQLite3 per project requirements
3. **Deployment:** Set up Render (backend) and Vercel (frontend) CI/CD
4. **Monitoring:** Add logging and error tracking
5. **Code Coverage:** Increase to 80%+ coverage threshold
6. **Documentation:** Add API documentation (Swagger/OpenAPI)

---

**Project Status:** Development Phase ✅  
**Last Updated:** March 19, 2026  
**Maintained By:** Bompelli Warsai Kiran

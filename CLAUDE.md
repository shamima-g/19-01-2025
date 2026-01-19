# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Claude should follow all guidelines in this document when generating, modifying, or reviewing code.

## Project Overview

This is a **template repository** for building frontend applications using:

- Next.js 16 with the App Router
- React 19 (client + server components)
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- Shadcn UI components (installed via the MCP server)
- A production-ready API client built around OpenAPI-defined REST endpoints (e.g., built with Linx or other platforms)
- Vitest + React Testing Library for integration

The project uses a **Next.js 16 + React 19 + Tailwind CSS 4** frontend with first-class support for **Shadcn UI** via an MCP server.

This is a template repository for building Next.js frontend applications that connect to external REST APIs (e.g., built with Linx or other platforms). The project uses modern web technologies and is optimized for AI-assisted development.
Users clone this template and then use Claude Code to generate all feature screens, components, forms, and integration logic.

**Repository Type**: Template repository for rapid frontend + API development

## Repository Structure

```
project-root/
├── .claude/          # Claude Code configuration and logs (TRACKED - see note below)
├── web/              # Next.js 16 frontend (TypeScript + React 19 + Tailwind CSS 4 + Shadcn UI)
├── api/              # Backend API specification (OpenAPI 3.0+ YAML)
├── db/               # Database layer (placeholder)
├── documentation/    # Project specs and sample datasets
└── tasks/            # Task tracking (placeholder)
```

### Session Logs (IMPORTANT - Must Be Committed)

**The `.claude/logs/` directory contains session logs that MUST be committed to Git.**

This is intentional for this template repository - session logs provide traceability of Claude's actions during the trial/testing period. When making commits:

```bash
# Always include .claude/logs/*.md in your commits
git add .claude/logs/
git commit -m "your message"
```

The `.gitignore` is configured to:

- **Track**: `.claude/logs/*.md` (session log files)
- **Ignore**: `.claude/logs/.agent-cache*`, `.claude/logs/.active-session-*` (temporary files)

**Do NOT add `.claude/logs/` to `.gitignore`** - these files are intentionally tracked.

## Development Commands

All commands are run from the `/web` directory:

```bash
# Navigate to web directory first
cd web

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server (requires build first)
npm start

# Linting
npm run lint

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

## Tech Stack

**Frontend (`/web`)**

- Next.js 16.0.1 with App Router (NOT Pages Router)
- React 19.2.0 with JSX transform
- TypeScript 5.x (strict mode enabled)
- Tailwind CSS 4.x via PostCSS
- Shadcn UI
- ESLint 9.x with Next.js config
- Vitest with React Testing Library for testing
- Path alias: `@/*` maps to `./src/*`

**Backend (`/api`)**

- External REST API (Linx, Express, FastAPI, etc.)
- OpenAPI 3.0+ specification maintained in `/api/*.yaml`
- Default base URL: `http://localhost:8042`

## Architecture & Key Concepts

### Frontend Architecture (`/web/src`)

**Directory Structure:**

- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `contexts/` - React Context providers (e.g., ToastContext)
- `lib/api/` - API client and endpoint functions
- `lib/auth/` - Authentication and RBAC helpers (core infrastructure)
- `lib/validation/` - Zod validation schemas (core infrastructure)
- `lib/utils/` - Helper functions and constants
- `types/` - TypeScript type definitions (including `roles.ts`)

### Styling & Component System (VERY IMPORTANT)

This project uses:

- **Tailwind CSS 4**
- **Shadcn UI** as the component library
- **Radix UI primitives** (via Shadcn components)
- **Utility-first component composition**

Claude must:

### Always prefer **Shadcn UI components** when building UI

(e.g., `<Button />`, `<Input />`, `<Dialog />`, `<Card />`, `<Form />`)

### If a needed Shadcn component does not exist

Claude must call the MCP server tool:

```
mcp__shadcn__add_component
```

Example instruction for Claude:

> “Install the Dialog component via Shadcn MCP and then use it to build the settings modal UI.”

### If multiple components are needed, install them one-by-one via MCP.

### Never write “Shadcn-style” components.

Always use **real Shadcn code**, installed via MCP.

**API Client Pattern:**
The project includes a production-ready API client (`lib/api/client.ts`) with:

- Type-safe requests/responses
- Centralized error handling for HTTP status codes (401, 403, 404, 500)
- Automatic JSON parsing
- Development logging with sensitive field sanitization
- Support for binary responses (file downloads)
- Query parameter handling
- Custom headers (including `LastChangedUser` for audit trails)

All API calls must use the API client inside:

```
web/src/lib/api/client.ts
```

Do not call `fetch()` directly in components.

Claude must:

- Create endpoint wrappers under `web/src/lib/api/[module].ts`
- Create type definitions under `web/src/types/[name].ts`
- Implement loading, error, empty states for all API-driven pages

**Convenience Methods:**

- `get<T>(endpoint, params?)` - GET requests
- `post<T>(endpoint, body?, lastChangedUser?)` - POST requests
- `put<T>(endpoint, body?, lastChangedUser?)` - PUT requests
- `del<T>(endpoint, lastChangedUser?)` - DELETE requests

**Toast Notification System:**
Included toast notification system with:

- `ToastContext` for state management
- `ToastContainer` for rendering
- Variants: success, error, info, warning
- Auto-dismiss with configurable duration
- Constants in `lib/utils/constants.ts`

### Security & Authentication (Core Infrastructure)

This template includes a complete **Role-Based Access Control (RBAC)** system and **input validation** framework as core infrastructure. These are not examples to be deleted—they are foundational patterns that all projects built from this template should use and extend.

#### Role-Based Access Control (RBAC)

**Role Definitions** ([web/src/types/roles.ts](web/src/types/roles.ts)):

| Role            | Level | Description                                                      |
| --------------- | ----- | ---------------------------------------------------------------- |
| `ADMIN`         | 100   | Full system access - manage users, configurations, all resources |
| `POWER_USER`    | 50    | Advanced features and bulk operations                            |
| `STANDARD_USER` | 25    | Standard access - create, edit, delete own resources             |
| `READ_ONLY`     | 10    | View-only access                                                 |

**To customize roles for your project:**

1. Update the `UserRole` enum in `types/roles.ts`
2. Update the `ROLE_HIERARCHY` object with your privilege levels
3. Update `roleDescriptions` for UI display
4. Modify `DEFAULT_ROLE` for new user defaults

**Auth Helper Functions** ([web/src/lib/auth/auth-helpers.ts](web/src/lib/auth/auth-helpers.ts)):

```typescript
// Check exact role
hasRole(user, UserRole.ADMIN);

// Check if user has any of the specified roles
hasAnyRole(user, [UserRole.ADMIN, UserRole.POWER_USER]);

// Check role hierarchy (user level >= required level)
hasMinimumRole(user, UserRole.POWER_USER);

// Resource-based access control
isAuthorized(user, 'document', 'delete');
```

**Server-Side Protection:**

```typescript
// In Server Components - throws error if unauthorized
const session = await requireAuth();
const session = await requireRole(UserRole.ADMIN);
const session = await requireMinimumRole(UserRole.POWER_USER);
const session = await requireAnyRole([UserRole.ADMIN, UserRole.POWER_USER]);
```

**API Route Protection:**

```typescript
// Wrap API handlers with role protection
export const GET = withRoleProtection(
  async (request) => {
    return NextResponse.json({ data: 'sensitive' });
  },
  { role: UserRole.ADMIN }
);

// Or use minimum role level
export const POST = withRoleProtection(handler, {
  minimumRole: UserRole.POWER_USER
});

// Or allow multiple roles
export const DELETE = withRoleProtection(handler, {
  roles: [UserRole.ADMIN, UserRole.POWER_USER]
});
```

#### Input Validation (Zod Schemas)

**Validation Schemas** ([web/src/lib/validation/schemas.ts](web/src/lib/validation/schemas.ts)):

The template includes production-ready validation schemas:

- `emailSchema` - Email validation with normalization
- `passwordSchema` - Strong password requirements (8+ chars, upper, lower, number, special)
- `signInSchema` / `signUpSchema` - Authentication forms
- `fileUploadSchema` - File type and size validation (5MB limit, images + PDF)
- `paginationSchema` / `searchSchema` - API query validation
- `sanitizeHtml()` - XSS prevention helper

**Usage Pattern:**

```typescript
import { validateRequest, signInSchema } from '@/lib/validation/schemas';

const result = validateRequest(signInSchema, formData);
if (result.success) {
  // result.data is typed correctly
  await signIn(result.data);
} else {
  // result.errors contains validation messages
  setErrors(result.errors);
}
```

#### Auth Configuration Files

- [web/src/lib/auth/auth.ts](web/src/lib/auth/auth.ts) - NextAuth.js configuration
- [web/src/lib/auth/auth.config.ts](web/src/lib/auth/auth.config.ts) - Auth providers config
- [web/src/lib/auth/auth-helpers.ts](web/src/lib/auth/auth-helpers.ts) - RBAC helper functions
- [web/src/lib/auth/auth-server.ts](web/src/lib/auth/auth-server.ts) - Server-side auth utilities
- [web/src/lib/auth/auth-client.ts](web/src/lib/auth/auth-client.ts) - Client-side auth utilities

### API Integration Pattern

1. Define types for API responses in `types/`
2. Create endpoint functions in `lib/api/` that use the API client
3. Call endpoint functions from components
4. Handle errors consistently using the built-in error handling

Example:

```typescript
// In lib/api/users.ts
import { get, post } from './client';
import type { User } from '@/types/user';

export const getUsers = () => get<User[]>('/v1/users');
export const createUser = (data: Partial<User>) =>
  post<User>('/v1/users', data, 'CurrentUser');
```

### Next.js App Router Rules

When generating pages:

- Use **server components by default**
- Add `"use client"` only when needed (forms, interactivity, hooks)
- Place pages under `web/src/app/`

### Testing Strategy

**Testing Framework:**
The project uses Vitest with React Testing Library for comprehensive testing, with a focus on **integration tests** over unit tests.

**Test Organization - Centralized Structure:**
All tests are centralized in `src/__tests__/` with subdirectories by test type:

- `src/__tests__/integration/` - Integration tests (primary focus)
- `src/__tests__/scripts/` - Template tooling and script tests
- `src/__tests__/api/` - API endpoint tests (if needed)

**Files you should NOT create:**

- `src/__tests__/utils/` - Avoid standalone utility tests; test utilities through integration
- `constants.test.ts` - Constants have no behavior to test
- `types.test.ts` - TypeScript compiler validates types
- `*-schemas.test.ts` - Don't test Zod/Yup directly; test validation via form/API integration

**Test File Naming:**

- Use `.test.ts` for non-React tests (API, utils)
- Use `.test.tsx` for React component/page tests
- Use descriptive names: `api-client.test.ts`, `page-rendering.test.tsx`, `user-workflow.test.tsx`

**Focus on Integration Tests:**
Integration tests verify that multiple parts of your application work together:

- API client + error handling + data transformation
- Component + API calls + state management
- Complete user workflows (load page → fetch data → interact → verify result)
- Authentication flows
- Form submissions with validation and API integration

**Best Practices (see template tests):**

1. **Test realistic workflows**: Focus on what users actually do
2. **Strategic API Mocking**: Use mocking only for scenarios that are difficult or impossible to reproduce with a live test API
3. **Arrange-Act-Assert pattern**: Keep tests structured and readable
4. **Descriptive test names**: Describe the scenario, not the implementation
5. **User-centric queries**: Use `screen.getByRole`, `getByLabelText` (accessibility-first)
6. **User interactions**: Use `userEvent` (not `fireEvent`) for realistic interactions
7. **Async testing**: Always use `waitFor` for async operations
8. **Test error states**: Don't just test the happy path

**Acceptance Test Quality Checklist (CRITICAL)**

Before writing any test, ask: **"Would a user care if this broke?"**

Every test MUST pass this checklist:

| Question                                                                  | If NO, don't write the test |
| ------------------------------------------------------------------------- | --------------------------- |
| Does this test verify something a user can see or interact with?          | ❌ Skip it                  |
| Would a product manager understand what this test validates?              | ❌ Rewrite it               |
| Could this test fail even if the feature works correctly for users?       | ❌ Delete it                |
| Does the test name describe a user outcome, not an implementation detail? | ❌ Rename it                |

**Valid acceptance tests verify:**

- ✅ User can see specific content ("Total: $1,234" is displayed)
- ✅ User can perform actions (clicking "Submit" saves the form)
- ✅ User receives feedback (error message appears when validation fails)
- ✅ User workflow completes (login → redirect to dashboard)
- ✅ Accessibility requirements (screen reader can navigate the form)

**Invalid tests that should NOT be written:**

- ❌ Component has correct CSS class names
- ❌ Internal state updates to specific value
- ❌ Function is called N times
- ❌ Component renders N child elements
- ❌ Props are passed correctly to child components
- ❌ Redux/state store contains expected shape
- ❌ SVG has correct attributes (fill, stroke, dimensions)
- ❌ Animation classes are applied
- ❌ Internal DOM structure matches expectations
- ❌ Constants or config objects have expected values
- ❌ TypeScript types work correctly (compiler handles this)
- ❌ Third-party library behavior (Zod schemas validate, NextAuth sessions work, etc.)

**Query Priority (Accessibility-First):**

Use queries in this order of preference:

| Priority        | Query                  | When to Use                                                       |
| --------------- | ---------------------- | ----------------------------------------------------------------- |
| 1st             | `getByRole`            | Buttons, links, headings, forms - **preferred for most elements** |
| 2nd             | `getByLabelText`       | Form inputs with labels                                           |
| 3rd             | `getByPlaceholderText` | Inputs without visible labels                                     |
| 4th             | `getByText`            | Non-interactive content                                           |
| 5th             | `getByDisplayValue`    | Filled form inputs                                                |
| **Last resort** | `getByTestId`          | **Only when no semantic query works**                             |

⚠️ **`getByTestId` is an anti-pattern in most cases.** If you find yourself adding `data-testid` attributes, first ask: "Is there a semantic HTML element or ARIA role I should use instead?" The answer is usually yes.

**Template Tests:**

- [web/src/__tests__/integration/api-client.test.ts](web/src/__tests__/integration/api-client.test.ts) - API client integration testing
- [web/src/__tests__/integration/page-rendering.test.tsx](web/src/__tests__/integration/page-rendering.test.tsx) - Component + data fetching integration testing
- [web/src/__tests__/integration/auth-helpers.test.ts](web/src/__tests__/integration/auth-helpers.test.ts) - RBAC helper functions testing
- [web/src/__tests__/integration/rbac.test.ts](web/src/__tests__/integration/rbac.test.ts) - Role-based access control integration testing
- [web/src/__tests__/integration/validation-schemas.test.ts](web/src/__tests__/integration/validation-schemas.test.ts) - Zod validation schemas testing
- [web/src/__tests__/scripts/generate-progress-index.test.ts](web/src/__tests__/scripts/generate-progress-index.test.ts) - Progress index generator script testing

**What NOT to Test:**

- Simple utility functions (unless complex logic)
- Third-party library code
- Trivial getters/setters
- TypeScript types (let the compiler handle it)

**Anti-Pattern: Testing Library Internals (IMPORTANT)**

Do NOT write tests that query internal DOM structures of third-party components. This is a common mistake with visualization libraries (Recharts, Chart.js, D3), rich text editors, and complex UI components.

❌ **Bad - Testing implementation details:**

```typescript
// Testing Recharts internal SVG rendering
expect(container.querySelector('.recharts-bar-rectangle')).toHaveAttribute(
  'fill',
  '#8884d8'
);
expect(screen.getByTestId('chart').querySelectorAll('rect')).toHaveLength(5);
```

✅ **Good - Testing user-observable behavior:**

```typescript
// Test that data is accessible (via sr-only text or aria-labels)
expect(screen.getByText('Sales: $1,234')).toBeInTheDocument();

// Test that the chart container renders
expect(screen.getByRole('img', { name: /sales chart/i })).toBeInTheDocument();

// Test loading/error states
expect(screen.getByText('Loading chart...')).toBeInTheDocument();
```

**Why this matters:**

1. Internal DOM structure can change between library versions (brittle tests)
2. jsdom cannot render SVG/Canvas properly (tests will fail or be meaningless)
3. These tests don't verify what users actually see
4. Visual verification belongs in E2E tests (Playwright/Cypress) or visual regression tools

**For charts and visualizations specifically:**

- Test that the component renders without crashing
- Test data transformation/formatting functions separately
- Test loading, error, and empty states
- Use accessibility features (aria-labels, sr-only text) to verify data display
- Defer visual correctness testing to E2E or manual QA

**Test Mock Requirements (CRITICAL):**

When tests fail due to mock issues, you MUST fix the mocks - never skip tests to avoid fixing them. This is a strict requirement.

Common mock issues and how to fix them:

1. **Multiple API calls**: If a component makes multiple API calls, use `mockResolvedValue` for consistent returns or chain `mockResolvedValueOnce` for sequential calls:

   ```typescript
   // WRONG: Only handles first call
   mockGet.mockResolvedValue(data);

   // RIGHT: Handles multiple calls
   mockGet.mockResolvedValue(data); // If all calls return same shape
   // OR
   mockGet
     .mockResolvedValueOnce(bloombergData)
     .mockResolvedValueOnce(custodianData);
   ```

2. **Context providers not wrapped**: If tests fail with "must be used within Provider", add the provider mock at the top of the test file:

   ```typescript
   vi.mock('@/contexts/ToastContext', () => ({
     useToast: () => ({ showToast: vi.fn() }),
     ToastProvider: ({ children }) => children
   }));
   ```

3. **Navigation mocks**: Always mock next/navigation before component imports:

   ```typescript
   vi.mock('next/navigation', () => ({
     useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
     usePathname: () => '/current-path',
     useSearchParams: () => new URLSearchParams()
   }));
   ```

4. **Async state updates**: Use `waitFor` and ensure mocks resolve before assertions:
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Expected')).toBeInTheDocument();
   });
   ```

**Never use `describe.skip()` or `it.skip()` to bypass failing tests due to mock issues.** The only acceptable uses of skip are:

- Tests for features not yet implemented (TDD red phase)
- Tests that require capabilities not available in the test environment (e.g., actual browser APIs)

If you encounter a mock issue you cannot solve, ask the user for help rather than skipping the test.

### Configuration

**Environment Variables:**
Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (defaults to `http://localhost:8042`)

**TypeScript Configuration:**

- Strict mode enabled
- Path alias `@/*` for imports
- Target: ES2017
- JSX: react-jsx (React 19)

**Tailwind CSS:**
Configured via PostCSS with `@tailwindcss/postcss` plugin

## Development Workflow

1. **API-First Development:**

- Start with OpenAPI spec in `/api/*.yaml`
- Define data structures and endpoints
- Use spec as contract between frontend and backend

2. **Frontend Implementation:**

- Create types based on API schema
- Build API endpoint functions in `lib/api/`
- Implement pages in `app/` using App Router
- Create reusable components in `components/`

3. **Styling:**

- Try to use shadcn/ui for all components unless not possible
- Use Tailwind utility classes
- Define custom theme variables in `app/globals.css`

## Git Branching Strategy

**Create feature branches before starting work.** Never commit directly to `main` for feature development.

### Branch Naming Convention

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature (entire feature) | `feature/<feature-name>` | `feature/monthly-process` |
| Epic (single epic) | `feature/epic-<N>-<short-name>` | `feature/epic-1-start-page` |
| Bug fix | `fix/<issue-description>` | `fix/file-upload-validation` |
| Hotfix | `hotfix/<issue-description>` | `hotfix/approval-button-crash` |

### When to Create Branches

**For large features with multiple epics:**
1. Create a main feature branch from `main`: `feature/monthly-process`
2. Optionally create epic sub-branches from the feature branch: `feature/epic-1-start-page`
3. Merge epic branches into feature branch as each epic completes
4. Create PR from feature branch to `main` when all epics are done

**For single epics or small features:**
1. Create a feature branch from `main`: `feature/epic-1-start-page`
2. Work on the epic, committing regularly
3. Create PR to `main` when epic is complete and verified

### Branch Workflow with TDD Phases

```
main
  └── feature/monthly-process (create before DESIGN phase)
        ├── Commit: wireframes (after DESIGN)
        ├── Commit: epics and stories (after PLAN)
        ├── Commit: acceptance tests (after SPECIFY)
        ├── Commits: implementation (during IMPLEMENT)
        ├── Commit: quality gate results (after VERIFY)
        └── PR to main (after all phases complete)
```

### Important Rules

- **Create the feature branch before starting any phase** (DESIGN, PLAN, etc.)
- **Never force push** to shared branches
- **Keep branches up to date** with `main` via regular rebases or merges
- **Delete branches** after successful PR merge
- **Use descriptive commit messages** following the project's commit format

## Context Clearing Between Phases

When using the TDD workflow with multiple agents (ui-ux-designer → feature-planner → test-generator → implementation), clear the conversation context at these points to optimize token usage and maintain focus:

**Ideal Clear Points:**

| After Phase | Before Phase | When to Clear |
|-------------|--------------|---------------|
| DESIGN (wireframes) | PLAN (epics/stories) | After user approves wireframes |
| PLAN (epics/stories) | SPECIFY (tests) | After user approves all stories |
| SPECIFY (tests) | IMPLEMENT | After tests are committed |
| IMPLEMENT | REVIEW/VERIFY | After implementation is complete |

**How to Clear:**

- User types `/clear` in the conversation
- Or start a new conversation and use `/continue` to resume workflow

**Why Clear:**

- Resets token usage to 0
- Prevents context window exhaustion on large features
- Each phase's outputs are saved to files, so no work is lost
- Agents can read saved files (wireframes, epics, stories, tests) to resume

**Important:** Always wait for user approval of phase outputs before clearing. Never clear mid-approval flow.

## Quality Gate Policy

### Strict Pass/Fail Criteria

Quality gates are **binary checks** - they either pass or fail. There are **no conditional passes**.

**When running quality checks:**

- Report actual exit codes and error counts truthfully
- Do NOT rationalize failures as "expected" or "acceptable"
- Let the user decide whether to proceed despite failures
- Never report a gate as passing when the underlying check failed

### CRITICAL: No Error Suppressions Allowed

**NEVER use error suppression directives.** All errors must be fixed properly.

**Forbidden suppressions:**

- ❌ `// eslint-disable`
- ❌ `// eslint-disable-next-line`
- ❌ `// @ts-expect-error`
- ❌ `// @ts-ignore`
- ❌ `// @ts-nocheck`

**Why this matters:**

- Suppressions hide real problems instead of fixing them
- They accumulate technical debt
- They make code harder to maintain
- They can hide security vulnerabilities or bugs

**If you encounter an error:**

1. **Understand the root cause** - Don't suppress, investigate
2. **Fix it properly** - Refactor code, add proper types, handle edge cases
3. **If it's a false positive** - Ask the user before suppressing (almost never needed)

**Example:**

```typescript
// ❌ WRONG - Suppressing instead of fixing
// @ts-expect-error delay option not in types
await userEvent.type(input, 'test', { delay: 100 });

// ✅ CORRECT - Remove problematic option or fix types
await userEvent.type(input, 'test');
```

**Example of WRONG reporting:**

> "Gate 3: Code Quality ✅ PASS - TypeScript has errors but they're expected from TDD"

**Example of CORRECT reporting:**

> "Gate 3: Code Quality ❌ FAIL - TypeScript: 30 errors (from TDD test files for unimplemented stories).
>
> **Options:**
>
> 1. Skip/comment out failing tests to pass the gate
> 2. Proceed with failed gate (requires your approval)"

### TDD Workflow and Quality Gates

In TDD, test files are written before implementation, which creates TypeScript/ESLint errors. This is expected but **still counts as a FAILED quality gate** until fixed.

**Two approaches:**

1. **Green Build Approach** - Skip/comment out tests for unimplemented stories so gates always pass (more CI/CD friendly)
2. **Red-Green-Refactor TDD** - Accept failing gates until all stories are implemented (true TDD but requires CI/CD awareness)

The project must choose one approach and document it. Agents must NOT make this choice for the user.

### CRITICAL: Test Quality is NOT Negotiable

**Test quality validation (`npm run test:quality`) MUST always pass, regardless of TDD approach:**

- ❌ **WRONG**: "Tests are skipped with `.skip()` so test quality issues are OK to defer"
- ✅ **CORRECT**: "Test quality issues found - must fix before proceeding, even if tests are skipped"

**Why this matters:**

- Test quality validation runs on ALL test files, including skipped tests
- Anti-patterns in skipped tests will fail CI/CD pipelines
- "Tests are skipped" is NOT a valid excuse to ignore test quality failures
- Fix or remove problematic test code before committing

**Exit codes:**

- `npm run test:quality` exit code 0 = PASS ✅
- `npm run test:quality` exit code != 0 = FAIL ❌ (must fix before proceeding)

## Progress Index (Auto-Generated)

The project includes an automatic progress tracking system that generates a `PROGRESS.md` file in `generated-docs/`.

**How It Works:**

A Claude Code PostToolUse hook triggers `.github/scripts/generate-progress-index.js` whenever files in `generated-docs/stories/` are written or edited. The script scans story files and generates a progress dashboard.

**Hook Trigger:**

The hook is configured in `.claude/settings.json` and fires on `Write` or `Edit` operations to files matching `generated-docs/stories/*`. Other file operations do not trigger the script.

**Status Detection Logic:**

Stories are tracked via checkbox status in the `## Acceptance Tests` section of each story file:

| Checkbox State             | Status         |
| -------------------------- | -------------- |
| All `- [x]` checked        | ✅ Complete    |
| Some checked, some `- [ ]` | 🔄 In Progress |
| No checkboxes checked      | ⏳ Planned     |

Epic and feature statuses aggregate from their child stories.

**Output File:**

The generated file is located at:

```
generated-docs/PROGRESS.md
```

**Important:** Do not edit `PROGRESS.md` manually - it will be overwritten on the next story file change.

**Related Files:**

- [.github/scripts/generate-progress-index.js](.github/scripts/generate-progress-index.js) - Generator script
- [.claude/settings.json](.claude/settings.json) - Hook configuration
- [generated-docs/PROGRESS.md](generated-docs/PROGRESS.md) - Auto-generated output

## Important Patterns

**Path Aliases:**
Always use `@/` prefix for imports from `src/`:

```typescript
import { apiClient } from '@/lib/api/client';
import type { User } from '@/types/user';
```

**Error Handling:**
API client automatically handles common errors. Custom error handling can be added in `lib/api/client.ts` in the `handleErrorResponse` function.

**Development Logging:**
The API client logs requests/responses in development mode and automatically sanitizes sensitive fields (password, token, apiKey, secret, creditCard, ssn).

**Binary Responses:**
For file downloads, use `isBinaryResponse: true`:

```typescript
const blob = await apiClient<Blob>('/v1/download', {
  method: 'GET',
  isBinaryResponse: true
});
```

## File Locations

**Configuration:**

- [web/package.json](web/package.json) - Dependencies and scripts
- [web/tsconfig.json](web/tsconfig.json) - TypeScript settings
- [web/next.config.ts](web/next.config.ts) - Next.js configuration
- [web/.mcp.json](web/.mcp.json) - MCP servers configuration
- [web/postcss.config.mjs](web/postcss.config.mjs) - PostCSS/Tailwind
- [web/eslint.config.mjs](web/eslint.config.mjs) - Linting rules
- [web/vitest.config.ts](web/vitest.config.ts) - Vitest test configuration
- [web/vitest.setup.ts](web/vitest.setup.ts) - Vitest setup file

**Source Code:**

- [web/src/app/layout.tsx](web/src/app/layout.tsx) - Root layout
- [web/src/app/page.tsx](web/src/app/page.tsx) - Home page
- [web/src/app/globals.css](web/src/app/globals.css) - Global styles
- [web/src/lib/api/client.ts](web/src/lib/api/client.ts) - API client
- [web/src/lib/utils/constants.ts](web/src/lib/utils/constants.ts) - App constants
- [web/src/types/api.ts](web/src/types/api.ts) - API type definitions
- [web/src/contexts/ToastContext.tsx](web/src/contexts/ToastContext.tsx) - Toast system

**Authentication & Security (Core Infrastructure):**

- [web/src/lib/auth/auth.ts](web/src/lib/auth/auth.ts) - NextAuth.js configuration
- [web/src/lib/auth/auth-helpers.ts](web/src/lib/auth/auth-helpers.ts) - RBAC helper functions
- [web/src/lib/auth/auth.config.ts](web/src/lib/auth/auth.config.ts) - Auth providers config
- [web/src/lib/validation/schemas.ts](web/src/lib/validation/schemas.ts) - Zod validation schemas
- [web/src/types/roles.ts](web/src/types/roles.ts) - Role definitions and hierarchy

**API Specification:**

- [api/Api Definition.yaml](api/Api Definition.yaml) - OpenAPI spec

## Important Notes

- This is a **template repository** - customize for your specific project
- Uses **App Router** (not Pages Router) - pages go in `app/`, not `pages/`
- API client includes audit trail support via `LastChangedUser` header
- Toast notification system is fully functional out of the box
- All monetary/sensitive logging is automatically sanitized in development
- The template is optimized for AI-assisted development with clear patterns and structure

## Template Versioning & Releases (For Maintainers)

This section is for maintainers of the template repository itself, not end users.

### Version Strategy

The template uses [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes to template structure or patterns
- **MINOR** (0.1.0): New features, components, or workflows
- **PATCH** (0.0.1): Bug fixes, documentation updates, dependency bumps

### Creating a Release

1. Update [CHANGELOG.md](CHANGELOG.md) with changes under `## [Unreleased]`
2. Move unreleased changes to a new version heading: `## [X.Y.Z] - YYYY-MM-DD`
3. Commit: `git commit -m "chore: prepare release vX.Y.Z"`
4. Create GitHub Release:
   - Tag: `vX.Y.Z`
   - Title: `vX.Y.Z`
   - Use "Generate release notes" for auto-categorized PR list
5. The release notes will auto-categorize PRs based on labels (configured in [.github/release.yml](.github/release.yml))

### PR Labels for Release Notes

Use these labels on PRs for proper categorization:

| Label                    | Release Category    |
| ------------------------ | ------------------- |
| `breaking`               | Breaking Changes    |
| `enhancement`, `feature` | Features            |
| `bug`, `fix`             | Bug Fixes           |
| `security`               | Security            |
| `documentation`, `docs`  | Documentation       |
| `testing`, `test`        | Testing             |
| `chore`, `maintenance`   | Maintenance         |
| `ignore-for-release`     | Excluded from notes |

### Template Sync System

Derived repositories inherit `.github/workflows/sync-template.yml` which:

- Runs weekly (Sundays at midnight UTC)
- Creates PRs for infrastructure updates
- Excludes `/web` folder (configured in [.templatesyncignore](.templatesyncignore))

**What syncs automatically:** `.github/`, `.claude/`, root configs, `CLAUDE.md`, `CHANGELOG.md`

**What users review manually:** Everything in `/web` (documented in CHANGELOG)

### Related Files

- [CHANGELOG.md](CHANGELOG.md) - Version history
- [.github/release.yml](.github/release.yml) - Release notes configuration
- [.github/workflows/sync-template.yml](.github/workflows/sync-template.yml) - Sync workflow
- [.templatesyncignore](.templatesyncignore) - Files excluded from sync

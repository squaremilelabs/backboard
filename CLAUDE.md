# Backboard - Code Architecture & Organization

## Repository Overview

**Backboard** is a Next.js-based task management application with a modular architecture.

### Core Technology Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Database**: InstantDB (real-time database)
- **Authentication**: Clerk
- **Styling**: Custom design system (`smui/`) built on React Aria Components
- **State Management**: TanStack Query + InstantDB's reactive queries
- **Monitoring**: Sentry (production only)

### Current Folder Structure
```
backboard/
├── 🎨 smui/                          # Custom Design System (30 files)
│   ├── button/, checkbox/, modal/, text-field/
│   └── ... (15 components total)
│
├── 📁 src/
│   ├── 📱 app/                       # Next.js App Router
│   │   ├── api/ (account, create-task, jobs, list-scopes)
│   │   ├── current/, snoozed/
│   │   └── scope/[id]/[[...view]]/
│   │   
│   ├── 🔧 common/                    # Shared utilities (9 files)
│   │   ├── components/ (5 files)
│   │   └── utils/ (4 files)
│   │
│   ├── 🗄️ database/                  # Data layer
│   │   ├── models/ (account, task, scope, recurring-task)
│   │   ├── db-client.ts, instant.schema.ts, instant.perms.ts
│   │
│   ├── 🏗️ modules/                   # Feature modules
│   │   ├── auth/, recurring-task/, root/, scope/, task/
│   │
│   └── 🎨 styles/ (colors.css, fonts.ts, index.css)
```

## 🚨 Current Organizational Issues

### 1. Styling Architecture (HIGH IMPACT)
**Problem**: Styling logic scattered across multiple locations
- `src/styles/` - Global styles, fonts
- `src/common/components/class-names.ts` - Typography & palette utilities  
- `smui/*/variants.ts` - Component-specific styling
- Inline Tailwind throughout components

**Issues**:
- Typography utilities mixed with component utilities
- Color palette logic separate from CSS color definitions
- No central theme system - accent colors handled separately

### 2. Common/Shared Code Fragmentation (MEDIUM IMPACT)
**Problem**: Shared utilities poorly categorized
- `src/common/components/` contains both reusable components AND styling utilities
- `src/common/utils/` has 4 different utilities with no clear categorization
- 27 files import from `@/common` showing heavy cross-module dependencies

**Specific Issues**:
- `class-names.ts` belongs in styling, not components
- `text-editor.tsx` is domain-specific but placed in common
- Date/list utilities lack clear ownership

### 3. Module Interdependencies (MEDIUM IMPACT)
**Problem**: Tight coupling between modules
- Task module heavily depends on scope, auth, and common
- 34 files import from `smui` - design system tightly coupled throughout
- 24 files import from `@/modules` - suggests potential circular dependencies

### 4. API Route Organization (LOW IMPACT)
**Problem**: Inconsistent API structure
- Mix of single resource (`account/`) and action-based (`create-task/`) routes
- Some grouped by type (`jobs/`) others not

## 📋 Reorganization Recommendations

### Priority 1: Consolidate Styling System
```
src/
├── design-system/
│   ├── theme/
│   │   ├── colors.ts        # From styles/colors.css
│   │   ├── typography.ts    # From common/components/class-names.ts
│   │   └── palette.ts       # Centralize all color logic
│   └── components/          # Move from smui/
└── styles/
    └── globals.css          # Keep only global CSS
```

### Priority 2: Restructure Common Directory
```
src/
├── lib/                     # Rename 'common' to 'lib'
│   ├── components/         # Only truly reusable components
│   ├── hooks/              # Move use-* utilities here
│   ├── utils/              # Pure utility functions
│   └── constants/          # App-wide constants
```

### Priority 3: Better Module Boundaries
```
src/modules/
├── task/
│   ├── api/                # Move task API routes here
│   ├── components/
│   ├── hooks/
│   └── utils/
├── scope/
│   ├── api/                # Move scope API routes here
│   └── ...
```

### Priority 4: API Route Consistency
```
src/app/api/
├── tasks/
│   ├── route.ts            # CRUD operations
│   └── [id]/route.ts
├── scopes/
│   ├── route.ts
│   └── [id]/route.ts
└── jobs/                   # Background jobs
```

## 🎯 Implementation Strategy

### Week 1: Styling Consolidation
- [ ] Create `src/design-system/theme/` directory
- [ ] Move typography utilities from `common/components/class-names.ts`
- [ ] Consolidate color definitions
- [ ] Update imports across codebase

### Week 2: Common Directory Restructure
- [ ] Rename `common/` to `lib/`
- [ ] Separate truly reusable components from utilities
- [ ] Move `use-*` hooks to `lib/hooks/`
- [ ] Update all import statements

### Week 3: Module Boundary Cleanup
- [ ] Move API routes into respective modules
- [ ] Identify and break circular dependencies
- [ ] Create clear interfaces between modules

### Week 4: Final Cleanup & Testing
- [ ] Standardize API route structure
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Performance audit

## 🛠️ Development Commands

```bash
# Development
npm run dev

# Build & Test
npm run build
npm run lint

# Database Operations
npm run db:dev:push-schema
npm run db:dev:push-perms
```

## 📝 Notes for Future Sessions

- **Current file count**: 95+ TypeScript files
- **Design system**: 30 files in `smui/` directory
- **Heavy cross-dependencies**: Most modules import from `@/common` and `smui`
- **InstantDB schema**: Well-structured with 5 core entities (accounts, tasks, recurring_tasks, scopes, files, users)
- **React patterns**: Heavy use of compound components and render props

## 🔍 Key Files to Remember

- `src/database/instant.schema.ts` - Core data model
- `src/common/components/class-names.ts` - Typography & palette utilities
- `src/modules/task/task-list/task-list-item.tsx` - Main task component
- `smui/utils.ts` - Design system utilities
- `package.json` - Dependencies and scripts

---

*Generated from codebase analysis on 2025-08-26*
*Total files analyzed: 95+ TypeScript files*
*Architecture assessment: Functional but needs consolidation*
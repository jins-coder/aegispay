# Dedicated Project Template

This directory serves as the standard template for creating new projects with **uReact**.

## Directory Architecture
```
src/
├── system/                    # Giant system-dependent folder (Core, Actions, Hooks, Components)
└── projects/                  # Dedicated projects folder
    ├── docs-portal/           # Official react.dev documentation & interactive showcase
    ├── starter/               # Minimal starter blueprint
    └── <your-project>/        # Any new project you create
```

## How to Create a New Project
1. Create a dedicated folder: `src/projects/<your-project-name>/`
2. Add your application files (`App.tsx`, `components/`, `styles.css`)
3. Import directly from `'ureact'`:
   ```tsx
   import { createStore, view, useAction, useOptimistic, Link } from 'ureact';
   ```
4. All system-dependent dependencies, reactivity engines, and React 19 helpers are completely maintained in `src/system/`.

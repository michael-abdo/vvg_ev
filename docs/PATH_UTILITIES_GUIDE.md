# Path Utilities Guide

This guide explains when to use `path-utils` vs `useBasePath` hook for handling paths in your application.

## Overview

The template provides two ways to handle paths with basePath support:

1. **`path-utils`** - Direct utility functions for server-side and static contexts
2. **`useBasePath`** - React hook for client-side components

## When to Use Each

### Use `path-utils` when:

- **Server Components** - In React Server Components or `async` components
- **API Routes** - In API route handlers (`app/api/*/route.ts`)
- **Server Actions** - In server action functions
- **Middleware** - In `middleware.ts`
- **Configuration Files** - In `next.config.js`, auth config, etc.
- **Non-React Files** - In utility functions, services, or standalone scripts

```typescript
// Server component example
import { pagePath } from '@/lib/utils/path-utils';

export default async function ServerPage() {
  return <Link href={pagePath('/dashboard')}>Dashboard</Link>;
}

// API route example
import { apiPath } from '@/lib/utils/path-utils';

export async function GET() {
  const response = await fetch(apiPath('/external-service'));
  // ...
}
```

### Use `useBasePath` hook when:

- **Client Components** - In components with `'use client'` directive
- **Dynamic Navigation** - When using `useRouter()` for navigation
- **Interactive Components** - Components that respond to user interactions
- **Conditional Paths** - When paths change based on client-side state

```typescript
// Client component example
'use client';

import { useBasePath } from '@/lib/hooks';

export function ClientNavigation() {
  const { pagePath, apiPath } = useBasePath();
  const router = useRouter();
  
  const handleClick = () => {
    router.push(pagePath('/dashboard'));
  };
  
  const fetchData = async () => {
    const response = await fetch(apiPath('/data'));
    // ...
  };
  
  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

## Performance Considerations

### path-utils
- **Build-time Resolution**: Values are resolved at build time for server components
- **No Runtime Overhead**: Direct function calls, no hooks
- **Tree-shakeable**: Only import what you need

### useBasePath Hook
- **Runtime Resolution**: Detects basePath at runtime
- **Memoized**: Results are cached to prevent unnecessary recalculations
- **React Integration**: Works seamlessly with React's rendering cycle

## Migration Guide

If you're converting a component from server to client or vice versa:

### Server to Client
```typescript
// Before (Server Component)
import { pagePath } from '@/lib/utils/path-utils';
<Link href={pagePath('/about')}>About</Link>

// After (Client Component)
import { useBasePath } from '@/lib/hooks';
const { pagePath } = useBasePath();
<Link href={pagePath('/about')}>About</Link>
```

### Client to Server
```typescript
// Before (Client Component)
const { pagePath } = useBasePath();
router.push(pagePath('/home'));

// After (Server Component)
import { pagePath } from '@/lib/utils/path-utils';
redirect(pagePath('/home'));
```

## Common Patterns

### API Calls in Client Components
```typescript
'use client';

import { useBasePath } from '@/lib/hooks';

export function DataFetcher() {
  const { apiPath } = useBasePath();
  
  useEffect(() => {
    fetch(apiPath('/documents'))
      .then(res => res.json())
      .then(setData);
  }, [apiPath]);
}
```

### Static Assets in Client Components
```typescript
'use client';

import { useBasePath } from '@/lib/hooks';

export function Logo() {
  const { assetPath } = useBasePath();
  
  return <img src={assetPath('/logo.png')} alt="Logo" />;
}
```

### Authentication Redirect
```typescript
// Server Component
import { pagePath } from '@/lib/utils/path-utils';
import { redirect } from 'next/navigation';

if (!session) {
  redirect(pagePath('/sign-in'));
}

// Client Component
const { pagePath } = useBasePath();
const router = useRouter();

if (!session) {
  router.push(pagePath('/sign-in'));
}
```

## Best Practices

1. **Consistency**: Use the same approach throughout a component
2. **Import Once**: In client components, call `useBasePath()` once at the top
3. **Type Safety**: Both approaches provide full TypeScript support
4. **No Hardcoding**: Never hardcode paths; always use utilities
5. **Test Both**: Test your app with and without BASE_PATH set

## Troubleshooting

### Common Issues

1. **"Cannot use hooks in Server Component"**
   - Solution: Use `path-utils` instead of `useBasePath`

2. **"window is not defined"**
   - Solution: You're using client-side code in a server context

3. **Paths not updating with BASE_PATH**
   - Solution: Ensure you're using the utilities consistently

### Environment Variables

- `BASE_PATH` - Server-side basePath (build time)
- `NEXT_PUBLIC_BASE_PATH` - Client-side basePath (runtime)

Both should typically have the same value in production.

## Summary

- **Server/Static Context**: Use `path-utils`
- **Client/Interactive Context**: Use `useBasePath` hook
- **Both provide**: Full basePath support, TypeScript types, and consistent API
- **Choose based on**: Component type and execution context
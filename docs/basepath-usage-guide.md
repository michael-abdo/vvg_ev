# BasePath Usage Guide

## Understanding Next.js BasePath Behavior

When Next.js has a `basePath` configured in `next.config.mjs`, it automatically handles path prefixing in certain contexts. This guide explains when to use plain paths vs. the path utility functions.

## When to Use Plain Paths

### 1. Next.js Link Component
```tsx
// ✅ CORRECT - Next.js automatically prepends basePath
<Link href="/dashboard">Dashboard</Link>
<Link href="/api/health">API Status</Link>

// ❌ WRONG - Results in double basePath
<Link href={pagePath('/dashboard')}>Dashboard</Link>
```

### 2. Next.js Image Component (for public assets)
```tsx
// ✅ CORRECT - Next.js handles basePath for public assets
<Image src="/logo.svg" alt="Logo" />

// ❌ WRONG - Double basePath
<Image src={assetPath('/logo.svg')} alt="Logo" />
```

## When to Use Path Utilities

### 1. Programmatic Navigation
```tsx
import { useRouter } from 'next/navigation';
import { pagePath } from '@/lib/utils/path-utils';

const router = useRouter();

// ✅ CORRECT - router.push needs full path
router.push(pagePath('/dashboard'));
```

### 2. API Calls with fetch()
```tsx
import { apiPath } from '@/lib/utils/path-utils';

// ✅ CORRECT - fetch needs full path
const response = await fetch(apiPath('/documents'));
```

### 3. Authentication Callbacks
```tsx
import { signIn, signOut } from 'next-auth/react';
import { pagePath } from '@/lib/utils/path-utils';

// ✅ CORRECT - NextAuth needs full path
signIn("azure-ad", { callbackUrl: pagePath('/dashboard') });
signOut({ callbackUrl: pagePath('/') });
```

### 4. External URLs or Full URL Construction
```tsx
// ✅ CORRECT - When you need the full URL
const fullUrl = `${window.location.origin}${pagePath('/share/123')}`;
```

### 5. Non-Next.js Contexts
```tsx
// ✅ CORRECT - In API routes or server-side code
const redirectUrl = pagePath('/success');
```

## Quick Reference

| Context | Use Plain Path | Use Path Utility |
|---------|----------------|------------------|
| `<Link>` component | ✅ | ❌ |
| `<Image>` src (public assets) | ✅ | ❌ |
| `router.push()` | ❌ | ✅ |
| `fetch()` API calls | ❌ | ✅ |
| NextAuth callbacks | ❌ | ✅ |
| External URL construction | ❌ | ✅ |
| Server-side redirects | ❌ | ✅ |

## Testing Your Implementation

To verify correct basePath behavior:

1. Set `BASE_PATH=/template` in your `.env.local`
2. Check that navigation works without double paths
3. Verify API calls resolve correctly
4. Test authentication flows

## Common Pitfalls

1. **Double BasePath**: Using `pagePath()` with `<Link>` results in `/template/template/...`
2. **Missing BasePath**: Using plain paths with `router.push()` results in missing basePath
3. **API Call Failures**: Not using `apiPath()` for fetch calls when deployed to a subdirectory
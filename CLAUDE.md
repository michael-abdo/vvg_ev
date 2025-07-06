# HOW - Core Development Principles

## 🎯 **Smallest Possible Feature**
- Build the minimal working version first
- One feature at a time, completely finished
- No scope creep or "while we're at it" additions
- Ship working code fast, iterate based on real usage

## ⚡ **Fail FAST**
- Never hide errors behind mock data or placeholders
- Throw clear, specific errors immediately when systems fail
- Make failures loud and visible - no silent degradation
- Better to crash early than mislead with fake functionality

## 🔍 **Determine Root Cause**
- Always understand WHY before fixing HOW
- Trace problems to their source, not symptoms
- Use logging and debugging to understand the real issue
- Document findings to prevent repeat occurrences

## 🔄 **DRY (Don't Repeat Yourself)**
- Consolidate duplicate logic into shared utilities
- Reuse existing patterns and functions
- Extend current files instead of creating new ones
- One source of truth for each piece of logic

---

## 🚫 **NEVER DO:**
- Use mock data when real integrations exist
- Return fake responses that hide actual failures
- Create multiple files that do the same thing
- Fix symptoms without understanding root causes
- Build complex features when simple ones work
- Hide errors in silent try/catch blocks

## ✅ **ALWAYS DO:**
- Start with the simplest working solution
- Make failures immediately visible
- Understand the root cause before fixing
- Reuse existing code and patterns
- Build one complete feature before starting another
- Throw specific errors instead of masking problems

---

**Success = Working code that fails fast, reuses existing patterns, and solves the actual root problem with the smallest possible implementation.**
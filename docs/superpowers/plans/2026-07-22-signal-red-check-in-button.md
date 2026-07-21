# Signal Red Check-In Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the live check-in action a large tactile signal-red circular button that encourages repeat interaction.

**Architecture:** Keep `useCheckIn` and request handling unchanged. `CheckInApp` maps existing states to clearer action labels, while `styles.css` owns the responsive circular button, metallic bezel, press feedback, and reduced-motion fallback.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, Vite.

---

## File Structure

- `apps/web/src/CheckInApp.tsx`: maps existing check-in states to the concise action labels.
- `apps/web/src/CheckInApp.test.tsx`: proves the active state retains an enabled repeat-action label.
- `apps/web/src/styles.css`: creates the responsive tactile signal-red button and quiet centred composition.

### Task 1: Preserve the repeat action in the component contract

**Files:**
- Modify: `apps/web/src/CheckInApp.test.tsx`
- Modify: `apps/web/src/CheckInApp.tsx`

- [ ] **Step 1: Write the failing test**

Replace the active-state assertion with:

```ts
expect(
  screen.getByRole("button", { name: "한 번 더 참여하기" }),
).toBeEnabled();
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm run test --workspace apps/web -- CheckInApp.test.tsx`

Expected: the fresh-session test fails because the current action label is `다시 요청하기`.

- [ ] **Step 3: Write the minimal implementation**

In `CheckInApp.tsx`, replace both active and completed labels with:

```tsx
"한 번 더 참여하기"
```

Replace the starting label with:

```tsx
"연결 중"
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm run test --workspace apps/web -- CheckInApp.test.tsx`

Expected: all CheckInApp tests pass.

### Task 2: Style the tactile signal-red button

**Files:**
- Modify: `apps/web/src/styles.css`

- [ ] **Step 1: Implement the responsive button surface**

Update the page layout to centre the panel and define a `--color-signal-red` token. Make `.check-in-button` a responsive square with `aspect-ratio: 1`, `border-radius: 50%`, layered red radial gradients, a silver inset bezel, and a deep external shadow.

- [ ] **Step 2: Add intentional interaction states**

Add a hover lift and red glow, a pressed translate-and-shadow reduction, a distinct focus ring, and a disabled appearance that retains the circular silhouette. In the reduced-motion media query, remove only transitions and animations.

- [ ] **Step 3: Verify visual output**

Reload `http://localhost:5173` and inspect desktop and a 390px-wide viewport. Confirm the button remains dominant, fully visible, legible, and centred.

- [ ] **Step 4: Run project verification**

Run: `npm run test --workspace apps/web`, `npm run typecheck --workspace apps/web`, and `npm run build --workspace apps/web`.

Expected: each command exits with status 0.

# Signal Red Check-In Button Design

## Goal

Replace the understated rectangular check-in CTA with a large, tactile circular
button that invites repeated interaction while preserving the existing check-in
request behaviour.

## Visual Direction

- Use the reference's physical push-button language: a silver outer ring, deep
  red bezel, saturated signal-red face, and a soft upper-right highlight.
- Build the button entirely in CSS. Do not ship the reference image or add an
  image asset.
- Keep the surrounding page quiet: white canvas, concise label, and no extra
  decorative panels or gradients outside the button.
- Centre the action in the viewport. The button diameter is responsive, around
  220px on narrow screens and up to 280px on larger screens.

## Component and States

- Retain the native `button` element and the current `useCheckIn` integration.
- Idle label: `참여하기`.
- Starting label: `연결 중`; disable the button while a request is starting.
- Active and completed label: `한 번 더 참여하기`, so repeat requests remain
  explicit and desirable.
- Error remains a recoverable retry state with the existing error message.
- The button gets a restrained hover lift and glow, then visibly depresses on
  pointer or keyboard activation. Reduced-motion users receive the same state
  changes without transitions.

## Accessibility

- Keep a visible high-contrast focus ring that remains distinct from the red
  surface.
- Preserve native disabled semantics, live status announcements, and readable
  text labels for all color-based states.
- Maintain a minimum 44px pointer target; the round button substantially exceeds
  this requirement.

## Data Flow and Error Handling

No request, storage, heartbeat, or error-handling code changes are needed.
`useCheckIn` continues to own request state and duplicate-request prevention;
the presentation maps that state to the updated labels and button appearance.

## Verification

- Existing component tests continue to verify button labels and disabled
  behaviour.
- Run the web test suite, typecheck, and production build.
- Inspect the running app at desktop and mobile widths to confirm the button is
  visually dominant, usable, and not clipped.

# AI Polish Reply - Design Spec

## Overview

Add an "AI Polish" button to the ReplyForm component that polishes ticket response text with professional tone.

## Functionality

### Core Feature

- User types a response in the ReplyForm textarea
- Clicking "Polish with AI" sends the text to backend
- Backend calls MiniMax API to polish the text with professional tone
- Polished text replaces the original content in textarea
- User can then edit further or send the polished response

### API Endpoint

```
POST /api/tickets/:id/polish
Body: { "body": "original text" }
Response: { "polished": "polished text" }
```

### Backend Implementation

- New route handler in `backend/src/routes/tickets.ts`
- Call MiniMax API with polish prompt
- Return polished text

### Frontend Implementation

- Add "Polish with AI" button next to "Send Response" button
- `useMutation` for polish API call
- Button states: default → polishing (disabled) → result
- On success: replace textarea content with polished text
- On error: show alert, keep original text

## UI States

| State | Button Text | Button State |
|-------|-------------|--------------|
| Default | "Polish with AI" | Enabled |
| Polishing | "Polishing..." | Disabled |
| Error | "Polish with AI" | Enabled |

## Error Handling

- API failure: `alert(err.message)`, original text unchanged
- Empty input: button disabled (form validation handles this)

## Component Changes

### ReplyForm.tsx

- Add polish mutation using `useMutation`
- Add "Polish with AI" Button next to submit Button
- On polish success: update textarea with `watch("body")` + `reset({ body: polished })`
- Show "Polishing..." while pending

### API Route (tickets.ts)

```
POST /api/tickets/:id/polish
- Validates body is non-empty
- Calls MiniMax API with polish prompt
- Returns { polished: string }
```

## Testing

- Component test: button renders, shows loading state, replaces content on success
- E2E test: full polish flow with real backend

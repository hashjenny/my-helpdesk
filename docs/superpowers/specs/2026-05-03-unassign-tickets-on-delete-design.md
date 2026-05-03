# Unassign Tickets on User Deletion - Design Spec

## Problem

When a user is soft-deleted via `DELETE /users/:id`, their assigned tickets remain pointing to a "deleted" user. This creates orphaned assignments.

## Solution

In the `DELETE /users/:id` endpoint transaction, add a step to unassign all tickets assigned to the user being deleted.

## Current Delete Flow

```typescript
// users.ts line 137-147
await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }),
  prisma.session.deleteMany({ where: { userId: id } }),
  // Tickets still assigned to deleted user ❌
])
```

## New Delete Flow

```typescript
await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }),
  prisma.session.deleteMany({ where: { userId: id } }),
  prisma.ticket.updateMany({
    where: { assignedTo: id },
    data: { assignedTo: null },
  }),
])
```

## Scope

- **API-level soft delete only:** This change only affects `DELETE /users/:id` endpoint
- **Database-level cascade:** Not affected - Prisma schema has no explicit onDelete for `assignedTo`, so if someone deletes a user directly in the database, this spec doesn't cover that scenario

## Testing

1. **Component test:** Verify tickets are unassigned when user is deleted via API
2. **E2E test:** Delete a user assigned to tickets, verify tickets show "Unassigned" in the detail page

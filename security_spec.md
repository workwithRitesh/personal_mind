# PersonalMind Security Specification

## Data Invariants
- All documents must belong to the authenticated user (`userId` or `ownerId` must match `request.auth.uid`).
- Users can only read and write their own data.
- Timestamps must be server-validated.
- IDs must be valid strings.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing**: Attempt to create a task for another user.
   ```json
   { "userId": "victim_id", "title": "Malicious Task", "status": "pending" }
   ```
2. **State Shortcutting**: Attempt to create a task as "completed" without transitions. (Actually, creation can be completed, but let's say "status" must be "pending" initially if we enforced that).
3. **Resource Poisoning**: Extremely long title (e.g., 1MB).
4. **Ghost Field Injection**: Adding `isVerified: true` to a user profile.
5. **PII Leak**: Unauthorized read of another user's profile.
6. **Self-Assigned Admin**: Trying to set `isAdmin: true` in user preferences.
7. **Orphaned Write**: Creating a chat message without a user profile (verified via `existsAfter`).
8. **Temporal Integrity**: Setting `createdAt` to a future date manually.
9. **Update Gap**: Changing the `userId` of a task after creation.
10. **Shadow Field**: Adding `hiddenRole: 'admin'` to a memory node.
11. **ID Poisoning**: Using a massive string or special characters as a document ID.
12. **Blanket List Query**: Trying to list all tasks in the system without a `userId` filter.

## Test Strategy
I will use the Firebase Rules emulator (simulated here) to ensure:
- `userId` is strictly validated.
- `affectedKeys().hasOnly()` is used on updates.
- `isValidId()` is used on path variables.

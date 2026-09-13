# Task 3 Brief: Offline Action Queue & Sync Manager

## Requirements
- Files created:
  - `src/lib/offline/offline-manager.ts`: Core functions for managing local offline persistence (`localStorage`), enqueueing offline student activities/reviews, queue retrieval with corrupted data fallback, clearing actions, removing individual actions, incrementing retries with max limit (poison pill dropping), triggering sync via custom callbacks, and broadcasting local sync events.
  - `tests/unit/lib/offline-manager.test.ts`: Comprehensive unit tests covering enqueuing, FIFO ordering, corrupted storage recovery, retry limit enforcement, and queue synchronization.
- Constraints:
  - Resilient storage access (safely handling null `window` or storage exceptions).
  - TypeScript strict typing using domain contracts `QueuedOfflineAction` and `OfflineSyncStatus`.
  - Max retry cutoff (`maxRetries = 3`) to prevent permanent lockups.
  - 100% tests passing.

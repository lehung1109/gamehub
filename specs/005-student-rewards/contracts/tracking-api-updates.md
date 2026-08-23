# Contract Update: Tracking API

## Overview
The existing `POST /api/track` endpoint is updated conceptually, though the schema signature remains the same.

## Schema Changes
No structural changes. `score` remains an optional `number`.

## Behavioral Changes
- For games that do not have a natural score (e.g., Flashcards, Alphabet exploration), the client payload MUST now include `score: 5` (or another agreed fixed amount) to reward the student for completing a learning session.
- The Tracking API will persist this `score` exactly as it did before. 

## Impact on Clients
Client-side game engines must be updated to pass a fixed `score` when firing the completion event if they previously omitted it.

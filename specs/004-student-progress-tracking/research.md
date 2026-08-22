# Research: Student Progress Tracking

## 1. Supabase unauthenticated writes

- **Decision**: Use Next.js API Routes (`/api/track`) for game result submissions instead of raw client-side `anon` writes to Supabase.
- **Rationale**: Students do not have accounts. Allowing `anon` to insert directly into Supabase tables via RLS requires complex validation (e.g. checking if class code is active, finding or creating the student record, and inserting session/detail records) which is difficult and insecure to do purely in Postgres/RLS. An API route can validate the `class_code`, safely perform multiple operations (find/create student, insert session, insert details), and securely handle errors without exposing database structure or allowing malicious data manipulation. 
- **Alternatives considered**: 
  - Using Supabase RPC (Stored Procedure) accessible by `anon`: Viable, but logic is harder to test and maintain in PL/pgSQL compared to a TypeScript API route.
  - Allowing `anon` inserts on tables directly: Highly insecure, as anyone could insert fake data or spam the database.

## 2. `sessionStorage` with Next.js App Router

- **Decision**: Use a custom React hook (`useStudentSession`) in Client Components to manage `sessionStorage`, hydrating state only after initial mount.
- **Rationale**: `sessionStorage` is a browser-only API. Accessing it during Next.js SSR will cause hydration errors. By storing the `classCode` and `studentName` in React state and synchronizing with `sessionStorage` inside `useEffect`, we avoid hydration mismatches. The game wrapper components (which are already Client Components due to interactivity) can safely consume this hook.
- **Alternatives considered**: 
  - Using Cookies: Cookies are sent to the server on every request, which allows SSR. However, the spec explicitly restricts cookies for students (Zero tracking/cookies for end users). `sessionStorage` is strictly client-side and ephemeral (cleared on tab close), which perfectly matches the requirement.

## 3. CSV Export generation in Next.js 16

- **Decision**: Use a Next.js Route Handler (`/api/export-csv`) to generate and serve the CSV file.
- **Rationale**: Generating the CSV on the server allows us to securely query the Supabase database for the entire class history without sending unnecessary data to the client. The Route Handler can format the data, prepend the UTF-8 BOM (`\uFEFF`) for Excel compatibility (as required by the spec), and return a `Response` with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="report.csv"`.
- **Alternatives considered**:
  - Client-side CSV generation using `Blob`: Would require fetching all raw session data to the client first, which could be slow and memory-intensive for large datasets. Server-side generation is more efficient and reliable.

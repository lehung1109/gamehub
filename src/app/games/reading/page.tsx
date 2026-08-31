import { redirect } from 'next/navigation';

export default function ReadingIndexPage() {
  // Redirect to the test module for MVP
  redirect('/games/reading/test-module');
}

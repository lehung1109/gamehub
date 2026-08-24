import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

vi.mock("next/font/google", () => ({
  Geist: () => ({
    variable: "--font-geist-sans",
    className: "font-geist-sans",
  }),
  Geist_Mono: () => ({
    variable: "--font-geist-mono",
    className: "font-geist-mono",
  }),
}));

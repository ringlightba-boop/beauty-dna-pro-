// Future integration point. Not imported anywhere yet — the MVP runs on the
// mock data layer in lib/db.ts. When ready to go live with Supabase:
//
//   npm install @supabase/supabase-js @supabase/ssr
//
// then set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// (see .env.example) and uncomment below.

// import { createBrowserClient } from "@supabase/ssr";
//
// export function createSupabaseBrowserClient() {
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );
// }

export {};

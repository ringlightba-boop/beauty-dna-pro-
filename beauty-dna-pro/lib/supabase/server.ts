// Future integration point — see lib/supabase/client.ts for setup notes.
// Use this variant inside server components, route handlers and server
// actions, where cookies() is available for Supabase Auth's session.

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
//
// export function createSupabaseServerClient() {
//   const cookieStore = cookies();
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get: (name: string) => cookieStore.get(name)?.value,
//         set: (name: string, value: string, options) =>
//           cookieStore.set({ name, value, ...options }),
//         remove: (name: string, options) =>
//           cookieStore.set({ name, value: "", ...options }),
//       },
//     }
//   );
// }

export {};

import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase environment variables are not set');
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// For backward compatibility with existing queryDb calls
export async function queryDb(sql: string, params?: any[]) {
  const { data, error } = await supabaseAdmin
    .rpc('exec_query', { sql, params: params || [] })
    .throwOnError();
  
  if (error) throw error;
  return data;
}

export async function queryDbSingle(sql: string, params?: any[]) {
  const results = await queryDb(sql, params);
  return results?.[0] || null;
}

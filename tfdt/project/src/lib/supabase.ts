import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar si las variables de entorno están disponibles
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// En lugar de lanzar un error, mostraremos una advertencia en la consola
if (!hasSupabaseConfig) {
  console.warn(
    'Advertencia: Las credenciales de Supabase no están configuradas correctamente. Algunas funcionalidades pueden no estar disponibles.'
  );
}

// Crear el cliente de Supabase solo si las credenciales están disponibles
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: localStorage,
        storageKey: 'supabase.auth.token',
        flowType: 'pkce',
        providers: ['google']
      }
    })
  : null; // Si no hay credenciales, devolvemos null

// Verificar si hubo algún error al crear el cliente
if (hasSupabaseConfig && !supabase) {
  console.error(
    'Error al inicializar Supabase. ' +
    'Por favor verifica que:\n' +
    '1. Las credenciales en .env son correctas\n' +
    '2. Tienes conexión a internet\n' +
    '3. El proyecto Supabase está activo'
  );
}
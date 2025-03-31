import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function searchBooks(query: string) {
  if (!query.trim()) {
    throw new Error('Por favor ingresa un término de búsqueda');
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Error en la búsqueda: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      throw new Error('Respuesta inválida del servidor');
    }

    if (!Array.isArray(data.items)) {
      console.error('No se encontraron resultados:', data);
      return [];
    }

    return data.items;
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    throw error;
  }
}
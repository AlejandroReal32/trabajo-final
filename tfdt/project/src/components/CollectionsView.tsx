import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookCard } from './BookCard';
import { Book, BookmarkPlus, BookOpen, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const tabs = [
  {
    id: 'want-to-read',
    label: 'Quiero leer',
    icon: BookmarkPlus
  },
  {
    id: 'reading',
    label: 'Leyendo',
    icon: BookOpen
  },
  {
    id: 'finished',
    label: 'Terminados',
    icon: CheckCircle
  }
];

interface BookCollection {
  id: string;
  book_id: string;
  list_name: string;
  user_id: string;
  created_at: string;
  book: any; // Tipo de libro de la API de Google Books
}

interface CollectionsViewProps {
  userId: string | undefined;
  onBackToSearch: () => void;
}

export function CollectionsView({ userId, onBackToSearch }: CollectionsViewProps) {
  const [collections, setCollections] = useState<{
    'want-to-read': BookCollection[];
    'reading': BookCollection[];
    'finished': BookCollection[];
  }>({
    'want-to-read': [],
    'reading': [],
    'finished': []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'want-to-read' | 'reading' | 'finished'>('want-to-read');

  useEffect(() => {
    if (!userId) return;

    const fetchCollections = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('book_lists')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        // Organizar los libros por lista
        const booksByList: any = {
          'want-to-read': [],
          'reading': [],
          'finished': []
        };

        // Obtener información detallada de cada libro usando la API de Google Books
        const bookDetailsPromises = data.map(async (item) => {
          try {
            const response = await fetch(
              `https://www.googleapis.com/books/v1/volumes/${item.book_id}`
            );
            if (!response.ok) throw new Error('Error al obtener detalles del libro');
            const bookData = await response.json();
            
            // Agregar el libro a la lista correspondiente
            booksByList[item.list_name].push({
              ...item,
              book: bookData
            });
          } catch (error) {
            console.error('Error al obtener detalles del libro:', error);
          }
        });

        await Promise.all(bookDetailsPromises);
        setCollections(booksByList);
      } catch (error) {
        console.error('Error al cargar colecciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [userId]);

  const handleMoveBook = async (bookId: string, fromList: string, toList: string) => {
    if (!userId) return;

    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('book_lists')
        .update({ list_name: toList })
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) throw error;

      // Actualizar el estado local
      setCollections(prev => {
        const updatedCollections = { ...prev };
        const bookIndex = updatedCollections[fromList as keyof typeof prev].findIndex(
          item => item.book_id === bookId
        );

        if (bookIndex !== -1) {
          const book = updatedCollections[fromList as keyof typeof prev][bookIndex];
          updatedCollections[fromList as keyof typeof prev].splice(bookIndex, 1);
          updatedCollections[toList as keyof typeof prev].push({
            ...book,
            list_name: toList
          });
        }

        return updatedCollections;
      });
    } catch (error) {
      console.error('Error al mover libro:', error);
    }
  };

  const tabClasses = (tab: string) => cn(
    "px-4 py-2 text-sm font-medium rounded-t-lg",
    activeTab === tab
      ? "bg-white text-blue-600 border-b-2 border-blue-600"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
  );

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'want-to-read': return <BookmarkPlus size={16} />;
      case 'reading': return <BookOpen size={16} />;
      case 'finished': return <CheckCircle size={16} />;
      default: return null;
    }
  };

  if (!userId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Inicia sesión para ver tus colecciones</p>
        <button
          onClick={onBackToSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver a la búsqueda
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={onBackToSearch}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <Book className="mr-2" /> Volver a la búsqueda
      </button>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'want-to-read' | 'reading' | 'finished')}
                className={cn(
                  'flex items-center py-4 px-4 border-b-2 font-medium text-sm transition-colors duration-200',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {collections[tab.id as keyof typeof collections].length}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando tus libros...</div>
        </div>
      ) : collections[activeTab].length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="text-xl mb-2">No hay libros en esta colección</div>
          <div className="text-sm">Agrega libros desde la búsqueda</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections[activeTab].map((item) => (
            <BookCard
              key={item.book_id}
              book={item.book}
              onMoveToList={(toList) => handleMoveBook(item.book_id, activeTab, toList)}
              currentList={activeTab}
            />
          ))}
        </div>
      )}
    </div>
  );
}
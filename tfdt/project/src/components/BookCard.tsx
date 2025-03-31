import React from 'react';
import { Book, BookmarkPlus, BookOpen, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface BookCardProps {
  book: {
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      imageLinks?: {
        thumbnail: string;
      };
      description?: string;
    };
  };
  onAddToList: (listName: string) => void;
  currentList?: string;
}

function CollectionButtons({ onAddToList, currentList }: { onAddToList: (listName: string) => void, currentList?: string }) {
  const options = [
    { value: 'want-to-read', label: 'Quiero leer', icon: <BookmarkPlus size={16} />, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { value: 'reading', label: 'Leyendo', icon: <BookOpen size={16} />, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    { value: 'finished', label: 'Terminado', icon: <CheckCircle size={16} />, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ];

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onAddToList(option.value)}
          disabled={currentList === option.value}
          className={cn(
            "flex items-center gap-1 px-3 py-2 rounded-lg text-sm flex-1 justify-center",
            option.color,
            currentList === option.value
              ? "opacity-50 cursor-not-allowed"
              : "transition-colors duration-200"
          )}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export function BookCard({ book, onAddToList, currentList }: BookCardProps) {
  if (!book?.volumeInfo) {
    console.error('Datos del libro inválidos:', book);
    return null;
  }

  const { title = 'Título desconocido', authors = [], imageLinks, description = 'Sin descripción disponible' } = book.volumeInfo;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-[2/3] relative">
        <img
          src={imageLinks?.thumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {authors.join(', ') || 'Autor desconocido'}
        </p>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {description}
        </p>
        <CollectionButtons onAddToList={onAddToList} currentList={currentList} />
      </div>
    </div>
  );
}
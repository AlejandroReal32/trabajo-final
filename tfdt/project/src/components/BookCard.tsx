import React, { useState, useRef, useEffect } from 'react';
import { Book, BookmarkPlus, BookOpen, CheckCircle, ChevronDown } from 'lucide-react';
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
}

function DropdownMenu({ onAddToList }: { onAddToList: (listName: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const options = [
    { value: 'want-to-read', label: 'Want to Read', icon: <BookmarkPlus size={16} />, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { value: 'reading', label: 'Reading', icon: <BookOpen size={16} />, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    { value: 'finished', label: 'Finished', icon: <CheckCircle size={16} />, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm",
          "bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        <span className="flex items-center gap-1">
          <Book size={16} />
          <span>Agregar a colección</span>
        </span>
        <ChevronDown size={16} className={cn("transition-transform", isOpen && "transform rotate-180")} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onAddToList(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left",
                option.color
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BookCard({ book, onAddToList }: BookCardProps) {
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
        <div className="relative">
          <DropdownMenu onAddToList={onAddToList} />
        </div>
      </div>
    </div>
  );
}
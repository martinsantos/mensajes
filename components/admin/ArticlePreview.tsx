

import React from 'react';
import { Noticia, Tropo } from '../../types';

interface ArticlePreviewProps {
  noticia: Partial<Noticia>;
  tropo?: Tropo;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ noticia, tropo }) => {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://via.placeholder.com/1200x600.png?text=Image+Not+Available`;
  };

  const defaultNoticia = {
    titulo: 'Article Title Preview',
    bajada: 'This is a preview of the article summary. It gives a brief idea of the content.',
    cuerpo: '<p>This is the main body of the article. It will contain several paragraphs of text, just like the final published version.</p><p>This preview helps you visualize the layout and formatting before saving the changes.</p>',
    imagen_url: '',
    timestamp: new Date().toISOString(),
    author: '',
    ...noticia,
  };

  const defaultTropo = {
      nombre: 'Category',
      color: '#6B7280', // gray
      ...tropo
  }

  return (
    <div className="p-4 bg-gray-50 sm:p-6 rounded-lg max-h-[80vh] overflow-y-auto">
        <article className="max-w-3xl mx-auto">
            <header className="mb-6">
                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
                     <span className="inline-block px-3 py-1 font-semibold text-white rounded-full" style={{ backgroundColor: defaultTropo.color }}>
                        {defaultTropo.nombre}
                    </span>
                    <time dateTime={defaultNoticia.publishDate || defaultNoticia.timestamp}>
                        {new Date(defaultNoticia.publishDate || defaultNoticia.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </time>
                    {defaultNoticia.author && (
                        <span className="font-medium text-gray-700">
                            By {defaultNoticia.author}
                        </span>
                    )}
                </div>
                <h1 className="mt-4 text-2xl font-extrabold leading-tight text-gray-900 md:text-3xl">
                    {defaultNoticia.titulo || "Untitled Article"}
                </h1>
            </header>
            
            {defaultNoticia.imagen_url && (
                <img 
                    src={defaultNoticia.imagen_url} 
                    alt={`Preview of article image for: ${defaultNoticia.titulo}`}
                    onError={handleImageError} 
                    className="w-full h-auto my-6 rounded-lg shadow-lg" 
                />
            )}

            <div className="prose max-w-none prose-lg prose-indigo">
               <p className="p-4 text-lg leading-relaxed text-gray-700 bg-gray-100 border-l-4 rounded-r-lg border-primary-500">
                   {defaultNoticia.bajada}
               </p>
               <div
                  className="mt-6 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: defaultNoticia.cuerpo || '' }}
               />
            </div>
        </article>
    </div>
  );
};

export default ArticlePreview;
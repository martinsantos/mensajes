
import React from 'react';
import { Link } from 'react-router-dom';
import { Noticia, Tropo } from '../../types';

interface SecondaryStoryProps {
  noticia: Noticia;
  tropo?: Tropo;
}

const SecondaryStory: React.FC<SecondaryStoryProps> = ({ noticia, tropo }) => {
  if (!noticia) return null;
  
  const articleLink = `/${tropo?.slug || 'news'}/${noticia.slug}`;

  return (
    <article className="py-4 border-b border-gray-200">
      <Link to={articleLink} className="group">
        {tropo && (
          <p className="mb-1 text-xs font-bold uppercase" style={{ color: tropo.color }}>
            {tropo.nombre}
          </p>
        )}
        <h2 className="font-bold text-gray-800 group-hover:text-primary-700 transition-colors">
          {noticia.titulo}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {new Date(noticia.publishDate || noticia.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}
        </p>
      </Link>
    </article>
  );
};

export default SecondaryStory;
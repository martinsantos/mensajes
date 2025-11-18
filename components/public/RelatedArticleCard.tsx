
import React from 'react';
import { Link } from 'react-router-dom';
import { Noticia, Tropo } from '../../types';
import ImageWithBlurUp from '../common/ImageWithBlurUp';

interface RelatedArticleCardProps {
  noticia: Noticia;
  tropo: Tropo;
}

const RelatedArticleCard: React.FC<RelatedArticleCardProps> = ({ noticia, tropo }) => {

  const articleLink = `/${tropo.slug}/${noticia.slug}`;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://via.placeholder.com/400x300.png?text=Image`;
  };

  return (
    <article className="flex flex-col overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-sm hover:shadow-lg">
      <Link to={articleLink} className="block group">
        <ImageWithBlurUp
          src={noticia.imagen_url}
          alt={noticia.titulo}
          onError={handleImageError}
          className="w-full h-32"
          imgClassName="object-cover"
          loading="lazy"
        />
        <div className="p-4">
          <h3 className="text-base font-bold text-gray-800 transition-colors line-clamp-2 group-hover:text-primary-600">
            {noticia.titulo}
          </h3>
          <p className="mt-2 text-xs text-gray-500">
            {new Date(noticia.publishDate || noticia.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}
          </p>
        </div>
      </Link>
    </article>
  );
};

export default RelatedArticleCard;

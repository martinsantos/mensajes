
import React from 'react';
import { Link } from 'react-router-dom';
import { Noticia, Tropo } from '../../types';
import TwitterIcon from '../icons/TwitterIcon';
import FacebookIcon from '../icons/FacebookIcon';
import LinkedInIcon from '../icons/LinkedInIcon';
import ImageWithBlurUp from '../common/ImageWithBlurUp';

interface FeaturedStoryProps {
  noticia: Noticia;
  tropo?: Tropo;
}

const FeaturedStory: React.FC<FeaturedStoryProps> = ({ noticia, tropo }) => {
  if (!noticia) return null;
  const articleLink = `/${tropo?.slug || 'news'}/${noticia.slug}`;
  const fullUrl = `${window.location.origin}#${articleLink}`;

  const shareTitle = encodeURIComponent(noticia.titulo);
  const shareDescription = encodeURIComponent(noticia.bajada);

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${shareTitle}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${shareTitle}&summary=${shareDescription}`;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://via.placeholder.com/400x300.png?text=Image`;
  };
  
  return (
    <article className="mb-6">
      <Link to={articleLink} className="block group">
        <ImageWithBlurUp
            src={noticia.imagen_url}
            alt={noticia.titulo}
            onError={handleImageError}
            className="w-full mb-2 rounded-lg aspect-4/3 group-hover:opacity-90 transition-opacity"
            imgClassName="object-cover"
        />
        {tropo && (
          <p className="mb-1 text-xs font-bold uppercase" style={{ color: tropo.color }}>
            {tropo.nombre}
          </p>
        )}
        <h3 className="font-bold text-gray-800 group-hover:text-primary-700 transition-colors">
          {noticia.titulo}
        </h3>
      </Link>
      <div className="pt-3 mt-3 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-gray-500">Share:</span>
          <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="text-gray-400 transition-colors hover:text-blue-400">
            <TwitterIcon className="w-5 h-5" />
          </a>
          <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="text-gray-400 transition-colors hover:text-blue-600">
            <FacebookIcon className="w-5 h-5" />
          </a>
          <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="text-gray-400 transition-colors hover:text-blue-700">
            <LinkedInIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </article>
  );
};

export default FeaturedStory;

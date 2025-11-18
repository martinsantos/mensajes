
import React from 'react';
import { Link } from 'react-router-dom';
import { Noticia, Tropo } from '../../types';
import TwitterIcon from '../icons/TwitterIcon';
import FacebookIcon from '../icons/FacebookIcon';
import LinkedInIcon from '../icons/LinkedInIcon';
import ImageWithBlurUp from '../common/ImageWithBlurUp';

interface MainStoryProps {
  noticia: Noticia;
  tropo?: Tropo;
}

const MainStory: React.FC<MainStoryProps> = ({ noticia, tropo }) => {
  if (!noticia) return null;

  const articleLink = `/${tropo?.slug || 'news'}/${noticia.slug}`;
  const fullUrl = `${window.location.origin}#${articleLink}`;

  const shareTitle = encodeURIComponent(noticia.titulo);
  const shareDescription = encodeURIComponent(noticia.bajada);

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${shareTitle}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${shareTitle}&summary=${shareDescription}`;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://via.placeholder.com/800x600.png?text=Image+Not+Available`;
  };

  return (
    <article className="mb-8">
      <Link to={articleLink} className="block group">
        <ImageWithBlurUp
          src={noticia.imagen_url}
          alt={noticia.titulo}
          onError={handleImageError}
          className="w-full mb-4 rounded-lg aspect-video group-hover:opacity-90 transition-opacity"
          imgClassName="object-cover"
          loading="lazy"
        />
        {tropo && (
          <p className="mb-2 text-sm font-bold uppercase" style={{ color: tropo.color }}>
            {tropo.nombre}
          </p>
        )}
        <h1 className="mb-2 text-3xl font-bold text-gray-900 leading-tight group-hover:text-primary-700 transition-colors md:text-4xl">
          {noticia.titulo}
        </h1>
        <p className="text-lg text-gray-600">
          {noticia.bajada}
        </p>
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div className="text-sm text-gray-500">
          {noticia.author && <span>By {noticia.author} &middot; </span>}
          <span>{new Date(noticia.publishDate || noticia.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-500">Share:</span>
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

export default MainStory;

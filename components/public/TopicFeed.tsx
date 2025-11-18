
import React from 'react';
import { Link } from 'react-router-dom';
import { Noticia, Tropo } from '../../types';

interface TopicFeedProps {
  tropo: Tropo;
  noticias: Noticia[];
}

const TopicArticle: React.FC<{noticia: Noticia, tropo: Tropo}> = ({noticia, tropo}) => {
    const articleLink = `/${tropo.slug}/${noticia.slug}`;
    return (
        <article className="py-4 border-t border-gray-200">
             <Link to={articleLink} className="group">
                <h3 className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">
                    {noticia.titulo}
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {noticia.bajada}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                    {new Date(noticia.publishDate || noticia.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}
                </p>
             </Link>
        </article>
    )
}

const TopicFeed: React.FC<TopicFeedProps> = ({ tropo, noticias }) => {
  if (!noticias || noticias.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="pb-2 text-2xl font-bold border-b-4" style={{borderColor: tropo.color}}>
        {tropo.nombre}
      </h2>
      <div className="mt-4">
        {noticias.map(noticia => (
          <TopicArticle key={noticia.id} noticia={noticia} tropo={tropo} />
        ))}
      </div>
    </section>
  );
};

export default TopicFeed;
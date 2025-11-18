
import React from 'react';
import { Link } from 'react-router-dom';
import { Noticia, Tropo } from '../../types';

interface LatestNewsWidgetProps {
  noticias: Noticia[];
  tropos: Tropo[];
}

const LatestNewsWidget: React.FC<LatestNewsWidgetProps> = ({ noticias, tropos }) => {

  const getTropoForNoticia = (tropoId: number) => tropos.find(t => t.id === tropoId);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="pb-2 text-lg font-bold border-b border-gray-200">
        Latest News
      </h3>
      <ul className="mt-4 space-y-3">
        {noticias.map((noticia, index) => {
          const tropo = getTropoForNoticia(noticia.tropo_id);
          const articleLink = `/${tropo?.slug || 'news'}/${noticia.slug}`;
          return (
            <li key={noticia.id} className="pb-3 border-b border-gray-100 last:border-b-0">
              <Link to={articleLink} className="group">
                <p className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">
                    <span className="mr-2 font-bold text-gray-400">{index + 1}</span>
                    {noticia.titulo}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LatestNewsWidget;

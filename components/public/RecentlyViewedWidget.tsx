import React from 'react';
import { Link } from 'react-router-dom';
import { RecentlyViewedArticle } from '../../types';

interface RecentlyViewedWidgetProps {
  articles: RecentlyViewedArticle[];
}

const RecentlyViewedWidget: React.FC<RecentlyViewedWidgetProps> = ({ articles }) => {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="pb-2 text-lg font-bold border-b border-gray-200">
        Recently Viewed
      </h3>
      <ul className="mt-4 space-y-3">
        {articles.map((article) => (
          <li key={`${article.tropoSlug}-${article.slug}`} className="pb-3 border-b border-gray-100 last:border-b-0">
            <Link to={`/${article.tropoSlug}/${article.slug}`} className="group">
              <p className="font-semibold text-gray-800 transition-colors group-hover:text-primary-700">
                {article.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentlyViewedWidget;

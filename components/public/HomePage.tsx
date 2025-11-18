
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useNewsData from '../../hooks/useNewsData';
import { Noticia, Tropo } from '../../types';
import TwitterIcon from '../icons/TwitterIcon';
import FacebookIcon from '../icons/FacebookIcon';
import LinkedInIcon from '../icons/LinkedInIcon';
import { calculateReadTime } from '../../utils/textUtils';
import ImageWithBlurUp from '../common/ImageWithBlurUp';

const NoticiaCard: React.FC<{ noticia: Noticia; tropo?: Tropo }> = ({ noticia, tropo }) => {
    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return "Just now";
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = `https://via.placeholder.com/800x600.png?text=Image+Not+Available`;
    };

    const articleLink = `/${tropo?.slug || 'news'}/${noticia.slug}`;
    const fullUrl = `${window.location.origin}#${articleLink}`;

    const shareTitle = encodeURIComponent(noticia.titulo);
    const shareDescription = encodeURIComponent(noticia.bajada);

    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${shareTitle}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${shareTitle}&summary=${shareDescription}`;

    const readTime = calculateReadTime(noticia.cuerpo);

    return (
        <div className="flex flex-col overflow-hidden bg-white rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
            <Link to={articleLink}>
                 <ImageWithBlurUp
                    src={noticia.imagen_url}
                    alt={noticia.titulo}
                    onError={handleImageError}
                    className="w-full h-48"
                    imgClassName="object-cover"
                    loading="lazy"
                />
            </Link>
            <div className="flex flex-col flex-grow p-4">
                {tropo && (
                    <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold text-white rounded-full w-fit" style={{ backgroundColor: tropo.color }}>
                        {tropo.nombre}
                    </span>
                )}
                <Link to={articleLink}>
                    <h2 className="mb-2 text-lg font-bold text-gray-800 hover:text-primary-600 line-clamp-2">{noticia.titulo}</h2>
                </Link>
                <p className="flex-grow mb-3 text-sm text-gray-600 line-clamp-3">{noticia.bajada}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1.5">
                        <span>
                            {new Date(noticia.publishDate || noticia.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                        </span>
                        <span className="text-gray-400">&middot;</span>
                        <span>{readTime}</span>
                    </div>
                    {noticia.author && <span className="font-medium text-gray-700 truncate">By {noticia.author}</span>}
                </div>
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
            </div>
        </div>
    );
};

const HomePage: React.FC = () => {
    const { noticias, tropos, loading, error } = useNewsData();
    const [selectedTropo, setSelectedTropo] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredNoticias = useMemo(() => {
        return noticias
            .filter(n => n.estado === 'publicada')
            .filter(n => selectedTropo === null || n.tropo_id === selectedTropo)
            .filter(n => 
                n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                n.bajada.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [noticias, selectedTropo, searchTerm]);
    
    const getTropoForNoticia = (tropoId: number) => tropos.find(t => t.id === tropoId);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="py-6 bg-white shadow-sm">
                <div className="container px-4 mx-auto text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-primary-700 sm:text-5xl">Gemini News Hub</h1>
                    <p className="mt-2 text-lg text-gray-600">Your daily dose of AI-powered news</p>
                </div>
            </header>

            <main className="container px-4 py-8 mx-auto">
                <div className="flex flex-col gap-4 p-4 mb-8 bg-white rounded-lg shadow-sm md:flex-row md:items-center">
                    <div className="flex-grow">
                        <input 
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => setSelectedTropo(null)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${selectedTropo === null ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            All
                        </button>
                        {tropos.map(tropo => (
                            <button key={tropo.id} onClick={() => setSelectedTropo(tropo.id)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${selectedTropo === tropo.id ? 'text-white' : 'text-gray-800'}`} style={{backgroundColor: selectedTropo === tropo.id ? tropo.color : '#E5E7EB' }}>
                                {tropo.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center mt-16">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary-600"></div>
                    </div>
                )}
                {error && <p className="text-center text-red-600">{error}</p>}
                
                {!loading && !error && (
                    filteredNoticias.length > 0 ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {filteredNoticias.map(noticia => (
                                <NoticiaCard key={noticia.id} noticia={noticia} tropo={getTropoForNoticia(noticia.tropo_id)} />
                            ))}
                        </div>
                    ) : (
                         <div className="py-16 text-center">
                            <h3 className="text-xl font-semibold text-gray-700">No Articles Found</h3>
                            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
                        </div>
                    )
                )}
            </main>

             <footer className="py-6 mt-8 bg-white border-t">
                <div className="container px-4 mx-auto text-sm text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Gemini News Hub. All rights reserved.</p>
                    <Link to="/login" className="mt-1 text-primary-600 hover:underline">Admin Login</Link>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

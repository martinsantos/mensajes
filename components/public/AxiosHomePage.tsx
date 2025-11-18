
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useNewsData from '../../hooks/useNewsData';
import { Noticia, Tropo } from '../../types';
import MainStory from './MainStory';
import SecondaryStory from './SecondaryStory';
import TopicFeed from './TopicFeed';
import FeaturedStory from './FeaturedStory';
import LatestNewsWidget from './LatestNewsWidget';

const AxiosHomePage: React.FC = () => {
    const { noticias, tropos, loading, error } = useNewsData();

    const publishedNoticias = useMemo(() => {
        return noticias
            .filter(n => n.estado === 'publicada')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [noticias]);

    const getTropoForNoticia = (tropoId: number) => tropos.find(t => t.id === tropoId);

    const mainStory = publishedNoticias[0];
    const secondaryStories = publishedNoticias.slice(1, 4);
    const featuredStory = publishedNoticias[4]; 
    const topicFeedNoticias = publishedNoticias.slice(5);

    const noticiasByTropo = useMemo(() => {
        return topicFeedNoticias.reduce((acc, noticia) => {
            const tropoId = noticia.tropo_id;
            if (!acc[tropoId]) {
                acc[tropoId] = [];
            }
            acc[tropoId].push(noticia);
            return acc;
        }, {} as Record<number, Noticia[]>);
    }, [topicFeedNoticias]);


    if (loading) {
        return (
            <div className="flex items-center justify-center py-48">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container p-8 mx-auto text-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }
    
    return (
        <main className="container px-4 py-8 mx-auto">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {mainStory && <MainStory noticia={mainStory} tropo={getTropoForNoticia(mainStory.tropo_id)} />}
                    
                    <div className="mt-8">
                        {secondaryStories.map(noticia => (
                            <SecondaryStory key={noticia.id} noticia={noticia} tropo={getTropoForNoticia(noticia.tropo_id)} />
                        ))}
                    </div>
                    
                    {tropos.map(tropo => (
                        noticiasByTropo[tropo.id] && noticiasByTropo[tropo.id].length > 0 && (
                            <TopicFeed 
                                key={tropo.id} 
                                tropo={tropo} 
                                noticias={noticiasByTropo[tropo.id]} 
                            />
                        )
                    ))}
                </div>
                
                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24">
                       {publishedNoticias.length > 0 && 
                            <LatestNewsWidget noticias={publishedNoticias.slice(0, 5)} tropos={tropos} />
                       }
                       {featuredStory && 
                            <div className="mt-8">
                                <FeaturedStory noticia={featuredStory} tropo={getTropoForNoticia(featuredStory.tropo_id)} />
                            </div>
                       }
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default AxiosHomePage;

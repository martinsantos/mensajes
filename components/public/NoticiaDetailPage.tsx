import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useNewsData from '../../hooks/useNewsData';
import HomeIcon from '../icons/HomeIcon';
import { calculateReadTime } from '../../utils/textUtils';
import { slugify } from '../../utils/imageUtils';
import TwitterIcon from '../icons/TwitterIcon';
import FacebookIcon from '../icons/FacebookIcon';
import LinkedInIcon from '../icons/LinkedInIcon';
import { useReadingHistory } from '../../hooks/useReadingHistory';
import RecentlyViewedWidget from './RecentlyViewedWidget';
import VerticalReadingProgressBar from './VerticalReadingProgressBar';
import ImageWithBlurUp from '../common/ImageWithBlurUp';
// fix: Import RelatedArticleCard component to resolve reference error.
import RelatedArticleCard from './RelatedArticleCard';
import TypographyControls from './TypographyControls';

// Helper function to set or create a meta tag
const setMeta = (attr: 'name' | 'property', value: string, content: string) => {
    let element = document.head.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement;
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

// Helper function to set or create a canonical link tag
const setCanonical = (url: string) => {
    let element = document.head.querySelector(`link[rel="canonical"]`) as HTMLLinkElement;
    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
    }
    element.setAttribute('href', url);
};

const NoticiaDetailPage: React.FC = () => {
    const { tropoSlug, noticiaSlug } = useParams<{ tropoSlug: string, noticiaSlug: string }>();
    const { noticias, tropos, loading, error } = useNewsData();
    const { history, addArticleToHistory } = useReadingHistory();

    const [scrollProgress, setScrollProgress] = useState(0);

    // --- Typography Controls State ---
    const FONT_SIZES = ['prose-base', 'prose-lg', 'prose-xl'];
    const [fontSizeIndex, setFontSizeIndex] = useState(1); // Default to 'prose-lg'

    const handleIncreaseFontSize = () => setFontSizeIndex(i => Math.min(i + 1, FONT_SIZES.length - 1));
    const handleDecreaseFontSize = () => setFontSizeIndex(i => Math.max(i - 1, 0));
    // --- End Typography Controls State ---

    const articleData = useMemo(() => {
        if (!tropos.length || !noticias.length) return null;

        const tropo = tropos.find(t => t.slug === tropoSlug);
        if (!tropo) return null;

        const noticia = noticias.find(n => n.slug === noticiaSlug && n.tropo_id === tropo.id);
        if (!noticia) return null;

        return { noticia, tropo };
    }, [noticias, tropos, tropoSlug, noticiaSlug]);

    const { processedBody, headings } = useMemo(() => {
        const headings: { text: string; id: string; level: number }[] = [];
        if (!articleData?.noticia.cuerpo) return { processedBody: '', headings };

        const parser = new DOMParser();
        const doc = parser.parseFromString(articleData.noticia.cuerpo, 'text/html');
        const nodes = doc.querySelectorAll('h2, h3');

        nodes.forEach(node => {
            const text = node.textContent || '';
            if (text) {
                const id = slugify(text);
                node.setAttribute('id', id);
                headings.push({
                    text,
                    id,
                    level: node.tagName === 'H2' ? 2 : 3,
                });
            }
        });

        return { processedBody: doc.body.innerHTML, headings };
    }, [articleData]);


    const relatedArticles = useMemo(() => {
        if (!articleData) return [];
    
        const { noticia: currentNoticia } = articleData;
    
        return noticias
            .filter(noticia =>
                noticia.tropo_id === currentNoticia.tropo_id &&
                noticia.id !== currentNoticia.id &&
                noticia.estado === 'publicada'
            )
            .sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                const currentTime = new Date(currentNoticia.timestamp).getTime();
                return Math.abs(timeA - currentTime) - Math.abs(timeB - currentTime);
            })
            .slice(0, 3);
    }, [articleData, noticias]);
    
    // Add current article to history when it's available
    useEffect(() => {
        if (articleData) {
            addArticleToHistory({
                slug: articleData.noticia.slug,
                tropoSlug: articleData.tropo.slug,
                title: articleData.noticia.titulo,
            });
        }
    }, [articleData, addArticleToHistory]);
    
    // Filter out the *current* article from the list we display
    const recentlyViewedArticles = history.filter(
        item => item.slug !== noticiaSlug || item.tropoSlug !== tropoSlug
    );

    // Update meta tags for SEO and social sharing
    useEffect(() => {
        const defaultTitle = "Gemini News Hub";
        const defaultDescription = "Your daily dose of AI-powered news";

        if (articleData) {
            const { noticia, tropo } = articleData;
            const canonicalUrl = window.location.href;
            const keywords = `${tropo.nombre}, ${noticia.titulo.split(' ').slice(0, 5).join(', ')}, news, article`;

            document.title = `${noticia.titulo} | Gemini News Hub`;
            setMeta('name', 'description', noticia.bajada);
            setMeta('name', 'keywords', keywords);
            if (noticia.author) {
                setMeta('name', 'author', noticia.author);
            }
            setMeta('property', 'og:title', noticia.titulo);
            setMeta('property', 'og:description', noticia.bajada);
            setMeta('property', 'og:image', noticia.imagen_url);
            setMeta('property', 'og:url', canonicalUrl);
            setMeta('property', 'og:type', 'article');
            setCanonical(canonicalUrl);


            // Cleanup function to restore default meta tags when the component unmounts
            return () => {
                document.title = defaultTitle;
                setMeta('name', 'description', defaultDescription);
                document.head.querySelector(`meta[name="keywords"]`)?.remove();
                document.head.querySelector(`meta[name="author"]`)?.remove();
                document.head.querySelector(`meta[property="og:title"]`)?.remove();
                document.head.querySelector(`meta[property="og:description"]`)?.remove();
                document.head.querySelector(`meta[property="og:image"]`)?.remove();
                document.head.querySelector(`meta[property="og:url"]`)?.remove();
                document.head.querySelector(`meta[property="og:type"]`)?.remove();
                document.head.querySelector(`link[rel="canonical"]`)?.remove();
            };
        } else {
             // If no article data, ensure default tags are set.
             document.title = defaultTitle;
             setMeta('name', 'description', defaultDescription);
        }
    }, [articleData]);
    

    // Effect to track scroll position and update the reading progress bar.
    useEffect(() => {
        // A flag to ensure we don't queue up multiple animation frames.
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                // Use requestAnimationFrame to run the update on the next repaint.
                // This is more performant than updating state on every scroll event.
                window.requestAnimationFrame(() => {
                    const el = document.documentElement;
                    const totalHeight = el.scrollHeight - el.clientHeight;
                    
                    // Calculate progress, preventing division by zero.
                    const progress = totalHeight > 0 ? (el.scrollTop / totalHeight) * 100 : 0;
                    
                    setScrollProgress(progress);
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Add the event listener when the component mounts.
        // The `passive: true` option improves scrolling performance.
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial call to set the progress bar correctly on page load,
        // especially if the browser restores a scrolled position.
        handleScroll();

        // Cleanup: remove the event listener when the component unmounts
        // to prevent memory leaks.
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount/unmount.


    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = `https://via.placeholder.com/1200x600.png?text=Image+Not+Available`;
    };

    const handleProgressBarClick = (clickedProgress: number) => {
        const el = document.documentElement;
        const totalHeight = el.scrollHeight - el.clientHeight;
        
        // Calculate the target scroll position based on the click percentage.
        const scrollToY = (totalHeight * clickedProgress) / 100;

        // Scroll the window to the calculated position smoothly.
        window.scrollTo({
            top: scrollToY,
            behavior: 'smooth',
        });
    };

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
                <Link to="/" className="inline-flex items-center mt-4 text-primary-600 hover:underline">
                    <HomeIcon className="w-4 h-4 mr-2" /> Go back to Home
                </Link>
            </div>
        );
    }
    
    if (!articleData) {
        return (
             <div className="flex flex-col items-center justify-center py-24 text-center">
                <h2 className="text-3xl font-bold text-gray-800">404 - Not Found</h2>
                <p className="mt-2 text-gray-600">The article you are looking for does not exist.</p>
                <Link to="/" className="inline-flex items-center px-4 py-2 mt-6 text-white transition-colors duration-200 rounded-md shadow-sm bg-primary-600 hover:bg-primary-700">
                    <HomeIcon className="w-5 h-5 mr-2" />
                    Back to Homepage
                </Link>
            </div>
        );
    }

    const { noticia, tropo } = articleData;
    const readTime = calculateReadTime(noticia.cuerpo);

    const fullUrl = window.location.href;
    const shareTitle = encodeURIComponent(noticia.titulo);
    const shareDescription = encodeURIComponent(noticia.bajada);

    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${shareTitle}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${shareTitle}&summary=${shareDescription}`;
    
    const articleBodyClasses = `
      prose ${FONT_SIZES[fontSizeIndex]} max-w-2xl mx-auto antialiased break-words
      
      [--tw-prose-body:theme(colors.slate.900)]
      [--tw-prose-headings:theme(colors.slate.900)]
      [--tw-prose-bold:theme(colors.slate.900)]
      [--tw-prose-links:theme(colors.primary.800)]
      hover:[--tw-prose-links:theme(colors.primary.900)]
      [--tw-prose-quotes:theme(colors.slate.800)]
      [--tw-prose-quote-borders:theme(colors.primary.500)]
      
      /* --- CODE BLOCK STYLING --- */
      /* Inline code */
      [--tw-prose-code:theme(colors.fuchsia.800)]
      /* Fenced code blocks */
      [--tw-prose-pre-bg:theme(colors.slate.800)]
      [--tw-prose-pre-code:theme(colors.slate.200)]
      /* --- END CODE BLOCK STYLING --- */
      
      prose-p:font-serif prose-p:mb-[1.5em]
      prose-li:font-serif prose-li:my-2
      prose-blockquote:font-serif prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:text-xl
      prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary-600 prose-a:transition-all
      
      prose-headings:font-sans prose-headings:tracking-tight
      prose-h2:font-bold prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-3xl md:prose-h2:text-4xl
      prose-h3:font-bold prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-2xl md:prose-h3:text-3xl

      /* Fenced Code Block Container */
      prose-pre:border prose-pre:border-slate-700 prose-pre:p-6 prose-pre:rounded-lg prose-pre:shadow-lg prose-pre:overflow-x-auto
      /* Inline Code Snippet */
      prose-code:font-mono prose-code:text-sm prose-code:font-semibold prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:before:content-[''] prose-code:after:content-['']
      /* Reset inline styles when inside a fenced block */
      prose-pre:prose-code:bg-transparent prose-pre:prose-code:font-normal prose-pre:prose-code:p-0 prose-pre:prose-code:rounded-none prose-pre:prose-code:before:content-none prose-pre:prose-code:after:content-none
    `;

    return (
         <>
             <VerticalReadingProgressBar 
                progress={scrollProgress} 
                color={tropo.color} 
                onClick={handleProgressBarClick} 
             />
            <main className="container grid grid-cols-1 gap-8 px-4 py-8 mx-auto lg:grid-cols-3 lg:gap-12" style={{scrollBehavior: 'smooth'}}>
                <article className="p-6 bg-white rounded-lg shadow-md lg:col-span-2 md:p-8 lg:p-12">
                    <header className="mb-8">
                        <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2">
                             <span className="inline-block px-3 py-1 font-semibold text-white rounded-full" style={{ backgroundColor: tropo.color }}>
                                {tropo.nombre}
                            </span>
                            <div className="flex items-center gap-x-2">
                                <time dateTime={noticia.publishDate || noticia.timestamp}>
                                    {new Date(noticia.publishDate || noticia.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                </time>
                                <span className="text-gray-500">&middot;</span>
                                <span>{readTime}</span>
                            </div>
                        </div>
                        {noticia.author && (
                            <p className="mt-4 text-sm font-medium text-gray-700">
                                By {noticia.author}
                            </p>
                        )}
                        <h1 className={`${noticia.author ? 'mt-2' : 'mt-4'} text-3xl font-extrabold leading-tight text-gray-800 md:text-4xl lg:text-5xl tracking-tight`}>
                            {noticia.titulo}
                        </h1>
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-600">Share:</span>
                                <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="text-gray-500 transition-colors hover:text-blue-400">
                                    <TwitterIcon className="w-6 h-6" />
                                </a>
                                <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="text-gray-500 transition-colors hover:text-blue-600">
                                    <FacebookIcon className="w-6 h-6" />
                                </a>
                                <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="text-gray-500 transition-colors hover:text-blue-700">
                                    <LinkedInIcon className="w-6 h-6" />
                                </a>
                            </div>
                             <TypographyControls
                                onIncreaseFontSize={handleIncreaseFontSize}
                                onDecreaseFontSize={handleDecreaseFontSize}
                                isMinFont={fontSizeIndex === 0}
                                isMaxFont={fontSizeIndex === FONT_SIZES.length - 1}
                             />
                        </div>
                    </header>
                    
                    <ImageWithBlurUp
                        src={noticia.imagen_url}
                        alt={noticia.titulo}
                        onError={handleImageError}
                        className="w-full my-8 rounded-lg shadow-lg aspect-video"
                        imgClassName="object-cover"
                        loading="eager"
                    />

                    <p className="mt-10 mb-12 text-xl font-serif leading-relaxed text-gray-800 md:text-2xl">
                        {noticia.bajada}
                    </p>
                    
                    <div 
                        className={articleBodyClasses}
                        dangerouslySetInnerHTML={{ __html: processedBody }}
                    />
                </article>

                 <aside className="lg:col-span-1">
                    <div className="sticky space-y-8 top-24">
                        {headings.length > 0 && (
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <h3 className="pb-2 text-lg font-bold border-b border-gray-200">
                                    In This Article
                                </h3>
                                <ul className="mt-4 space-y-2">
                                    {headings.map((heading) => (
                                        <li key={heading.id}>
                                            <a 
                                                href={`#${heading.id}`}
                                                className={`transition-colors text-gray-600 hover:text-primary-700 ${heading.level === 3 ? 'ml-4' : ''}`}
                                            >
                                                {heading.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {recentlyViewedArticles.length > 0 && 
                            <RecentlyViewedWidget articles={recentlyViewedArticles} />
                        }
                    </div>
                </aside>
            </main>
            {relatedArticles.length > 0 && (
                <section className="py-12 bg-gray-100 border-t">
                    <div className="container px-4 mx-auto">
                        <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">Related Stories</h2>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {relatedArticles.map(article => (
                                <RelatedArticleCard 
                                    key={article.id} 
                                    noticia={article} 
                                    tropo={tropo} 
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default NoticiaDetailPage;
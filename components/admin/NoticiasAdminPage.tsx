

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useNewsData from '../../hooks/useNewsData';
import { Noticia } from '../../types';
import { slugify, resizeImageFile } from '../../utils/imageUtils';
import { scrapeUrl } from '../../services/geminiService';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import ArticlePreview from './ArticlePreview';
import CategoryIcon from '../icons/CategoryIcon';
import RichTextEditor from '../common/RichTextEditor';

const NoticiasAdminPage: React.FC = () => {
    const { noticias, tropos, addNoticia, updateNoticia, deleteNoticia } = useNewsData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNoticia, setCurrentNoticia] = useState<Noticia | null>(null);
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeError, setScrapeError] = useState<string | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageSourceType, setImageSourceType] = useState<'url' | 'upload'>('url');
    const [searchTerm, setSearchTerm] = useState('');
    
    const ITEMS_PER_PAGE = 10;
    
    const defaultFormState = {
        titulo: '',
        slug: '',
        bajada: '',
        cuerpo: '',
        imagen_url: '',
        is_image_external: false,
        tropo_id: 0,
        estado: 'borrador' as 'borrador' | 'publicada',
        author: '',
        publishDate: '',
    };
    const [formData, setFormData] = useState(defaultFormState);
    const [scrapeUrlInput, setScrapeUrlInput] = useState('');
    const [isScrapeUrlValid, setIsScrapeUrlValid] = useState(true);

    useEffect(() => {
        const tropoId = tropos.length > 0 ? tropos[0].id : 0;
        if (currentNoticia) {
            setFormData({
                ...defaultFormState,
                ...currentNoticia,
                tropo_id: currentNoticia.tropo_id || tropoId,
                publishDate: currentNoticia.publishDate ? currentNoticia.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
            });
            if (currentNoticia.imagen_url) {
                setImageSourceType(currentNoticia.is_image_external ? 'url' : 'upload');
            } else {
                setImageSourceType('url');
            }
        } else {
            setFormData({...defaultFormState, tropo_id: tropoId, publishDate: new Date().toISOString().split('T')[0]});
            setImageSourceType('url');
        }
    }, [currentNoticia, tropos, isModalOpen]);

    const filteredNoticias = useMemo(() => {
        if (!searchTerm.trim()) {
            return noticias;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return noticias.filter(noticia =>
            noticia.titulo.toLowerCase().includes(lowercasedFilter) ||
            noticia.bajada.toLowerCase().includes(lowercasedFilter) ||
            noticia.cuerpo.toLowerCase().includes(lowercasedFilter)
        );
    }, [noticias, searchTerm]);

    const totalPages = Math.ceil(filteredNoticias.length / ITEMS_PER_PAGE);

    const paginatedNoticias = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredNoticias.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredNoticias, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);


    const handleOpenModal = (noticia: Noticia | null = null) => {
        setCurrentNoticia(noticia);
        setScrapeError(null);
        setIsScrapeUrlValid(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentNoticia(null);
        setScrapeUrlInput('');
        setScrapeError(null);
        setIsScrapeUrlValid(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'titulo') {
            setFormData(prev => ({ ...prev, titulo: value, slug: slugify(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCuerpoChange = (content: string) => {
        setFormData(prev => ({ ...prev, cuerpo: content }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsProcessingImage(true);
            try {
                const resizedDataUrl = await resizeImageFile(file);
                setFormData(prev => ({
                    ...prev,
                    imagen_url: resizedDataUrl,
                    is_image_external: false
                }));
            } catch (error) {
                console.error("Image processing failed:", error);
                alert("Failed to process image.");
            } finally {
                setIsProcessingImage(false);
                e.target.value = '';
            }
        }
    };
    
    const handleScrapeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setScrapeUrlInput(url);

        if (url.trim() === '') {
            setScrapeError(null);
            setIsScrapeUrlValid(true);
            return;
        }
        
        const looksLikeUrl = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;
        const isValid = looksLikeUrl.test(url);
        
        setIsScrapeUrlValid(isValid);

        if (!isValid) {
            setScrapeError("Please enter a URL with a valid format (e.g., example.com).");
        } else {
            setScrapeError(null);
        }
    };


    const handleScrape = async () => {
        if (!scrapeUrlInput || !isScrapeUrlValid) {
            setScrapeError("Please enter a valid URL.");
            return;
        }

        let urlToScrape = scrapeUrlInput;
        if (!/^https?:\/\//i.test(urlToScrape)) {
            urlToScrape = 'https://' + urlToScrape;
        }

        try {
            new URL(urlToScrape);
        } catch (_) {
            setScrapeError("The provided URL is not valid. Please ensure it is a complete and correct URL.");
            setIsScrapeUrlValid(false);
            return;
        }

        setIsScraping(true);
        setScrapeError(null);
        try {
            const data = await scrapeUrl(urlToScrape);
            // Convert plain text with newlines to simple HTML paragraphs
            const formattedContent = data.content
                .split('\n')
                .filter(p => p.trim() !== '')
                .map(p => `<p>${p}</p>`)
                .join('');

            setFormData(prev => ({
                ...prev,
                titulo: data.title,
                slug: slugify(data.title),
                bajada: data.description,
                cuerpo: formattedContent,
                imagen_url: data.image,
                is_image_external: true,
                author: data.author || '',
            }));
            setImageSourceType('url');
        } catch (error) {
            console.error("Scraping failed:", error);
            setScrapeError("Scraping failed. The URL might be inaccessible or invalid.");
        } finally {
            setIsScraping(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.tropo_id || formData.tropo_id === 0) {
            alert("Please select a category (Tropo). If none are available, please create one first.");
            return;
        }
        const finalFormData = {
            ...formData,
            author: formData.author?.trim() === '' ? undefined : formData.author,
        };

        if (currentNoticia) {
            updateNoticia({ ...currentNoticia, ...finalFormData, tropo_id: Number(finalFormData.tropo_id) });
        } else {
            addNoticia({...finalFormData, tropo_id: Number(finalFormData.tropo_id), timestamp: new Date().toISOString()});
        }
        handleCloseModal();
    };

    const getTropo = (tropoId: number) => tropos.find(t => t.id === tropoId);
    
    const goToNextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage(p => Math.max(p - 1, 1));

    const paginationItems = useMemo(() => {
        const pageNumbers: (number | string)[] = [];
        const maxPages = 7; // e.g. 1 ... 4 5 6 ... 10
        if(totalPages <= maxPages) {
            for(let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if(currentPage > 3) {
                pageNumbers.push('...');
            }

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if(currentPage <= 2) {
                start = 2;
                end = 3;
            }
            if(currentPage >= totalPages - 1) {
                start = totalPages - 2;
                end = totalPages - 1;
            }

            for(let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            if(currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }
        return pageNumbers.filter((v, i, a) => a.indexOf(v) === i); // remove duplicates if any

    }, [totalPages, currentPage]);

    return (
        <div>
             <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Noticias</h1>
                 <div className="flex items-center space-x-2">
                    <Link
                        to="/admin/tropos"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-gray-200 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <CategoryIcon className="w-5 h-5 mr-2 -ml-1" />
                        Manage Categories
                    </Link>
                    <Button onClick={() => handleOpenModal()}>Add Noticia</Button>
                </div>
            </div>
             <div className="mb-4">
                <input
                    type="search"
                    placeholder="Search by title or content..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full max-w-md px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
             <div className="overflow-hidden bg-white rounded-lg shadow-md">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Título</th>
                            <th scope="col" className="px-6 py-3">Tropo</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Published</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedNoticias.map(noticia => {
                            const tropo = getTropo(noticia.tropo_id);
                            return (
                                <tr key={noticia.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{noticia.titulo}</td>
                                    <td className="px-6 py-4">
                                        {tropo ? <span className="px-2 py-1 text-xs font-semibold text-white rounded" style={{backgroundColor: tropo.color}}>{tropo.nombre}</span> : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${noticia.estado === 'publicada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{noticia.estado}</span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(noticia.publishDate || noticia.timestamp).toLocaleDateString('en-CA')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="secondary" onClick={() => handleOpenModal(noticia)}>Edit</Button>
                                            <Button variant="danger" onClick={() => deleteNoticia(noticia.id)}>Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                 {filteredNoticias.length === 0 && (
                    <p className="p-6 text-center text-gray-500">
                        {searchTerm ? 'No articles match your search.' : 'No news articles found.'}
                    </p>
                 )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 bg-white border-t">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing{' '}
                                <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                                {' '}to{' '}
                                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredNoticias.length)}</span>
                                {' '}of{' '}
                                <span className="font-medium">{filteredNoticias.length}</span> results
                            </p>
                        </div>
                        <nav className="flex items-center -space-x-px text-sm">
                            <button
                                type="button"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="px-3 py-1 font-medium border rounded-l-md bg-white border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Previous Page"
                            >
                                Previous
                            </button>
                            {paginationItems.map((page, index) =>
                                typeof page === 'number' ? (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => setCurrentPage(page)}
                                        aria-current={page === currentPage ? 'page' : undefined}
                                        className={`px-3 py-1 font-medium border border-gray-300 ${
                                            page === currentPage
                                                ? 'bg-primary-600 text-white border-primary-600'
                                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={index} className="px-3 py-1 font-medium border border-gray-300 bg-white text-gray-600">
                                        ...
                                    </span>
                                )
                            )}
                            <button
                                type="button"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 font-medium border rounded-r-md bg-white border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Next Page"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentNoticia ? 'Edit Noticia' : 'Add Noticia'}>
                <div className="p-4 mb-4 space-y-2 bg-gray-100 rounded-lg">
                    <label htmlFor="scrape-url" className="text-sm font-medium">Scrape URL to auto-fill</label>
                    <div className="flex space-x-2">
                        <input 
                            type="url" 
                            id="scrape-url" 
                            placeholder="https://example.com/article" 
                            value={scrapeUrlInput} 
                            onChange={handleScrapeUrlChange}
                            aria-invalid={!isScrapeUrlValid}
                            aria-describedby="scrape-error"
                            className={`flex-grow w-full p-2 text-sm rounded-lg transition-colors ${!isScrapeUrlValid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
                        />
                        <Button onClick={handleScrape} disabled={isScraping || !isScrapeUrlValid || !scrapeUrlInput}>
                            {isScraping ? <Spinner /> : 'Scrape'}
                        </Button>
                    </div>
                    {scrapeError && <p id="scrape-error" className="mt-2 text-sm text-red-600">{scrapeError}</p>}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="titulo" placeholder="Title" value={formData.titulo} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input type="text" name="slug" placeholder="Slug" value={formData.slug} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input type="text" name="author" placeholder="Author (optional)" value={formData.author || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                    <textarea name="bajada" placeholder="Bajada (summary)" value={formData.bajada} onChange={handleChange} className="w-full p-2 border rounded" rows={3}></textarea>
                    
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Content</label>
                        <RichTextEditor
                            value={formData.cuerpo}
                            onChange={handleCuerpoChange}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label htmlFor="tropo_id" className="block mb-2 text-sm font-medium text-gray-700">Category</label>
                            {tropos.length > 0 ? (
                                <select id="tropo_id" name="tropo_id" value={formData.tropo_id} onChange={handleChange} className="w-full p-2 border rounded" required>
                                    <option value="0" disabled>Select a Tropo</option>
                                    {tropos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                </select>
                             ) : (
                                <div className="flex flex-col justify-center h-full p-3 text-sm text-center text-gray-600 bg-gray-100 border rounded-lg">
                                    <p>No categories found.</p>
                                    <Link to="/admin/tropos" onClick={handleCloseModal} className="mt-1 text-xs text-primary-600 hover:underline">
                                        Create one now
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="estado" className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                            <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className="w-full p-2 border rounded" required>
                                <option value="borrador">Borrador</option>
                                <option value="publicada">Publicada</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="publishDate" className="block mb-2 text-sm font-medium text-gray-700">Publish Date</label>
                            <input id="publishDate" type="date" name="publishDate" value={formData.publishDate || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                    </div>

                     <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Image</label>
                        <div className="p-4 space-y-4 bg-gray-50 border rounded-lg">
                            <fieldset>
                                <legend className="sr-only">Image Source</legend>
                                <div className="flex space-x-4">
                                    <div className="flex items-center">
                                        <input id="source-url" name="imageSource" type="radio" value="url" checked={imageSourceType === 'url'} onChange={() => setImageSourceType('url')} className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"/>
                                        <label htmlFor="source-url" className="block ml-2 text-sm font-medium text-gray-700">From URL</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="source-upload" name="imageSource" type="radio" value="upload" checked={imageSourceType === 'upload'} onChange={() => setImageSourceType('upload')} className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"/>
                                        <label htmlFor="source-upload" className="block ml-2 text-sm font-medium text-gray-700">Upload File</label>
                                    </div>
                                </div>
                            </fieldset>
                            
                            {imageSourceType === 'url' && (
                                <div className="mt-2">
                                    <label htmlFor="imagen_url_input" className="block text-xs font-medium text-gray-600">External Image URL</label>
                                    <div className="flex items-start mt-1 space-x-2">
                                        <input 
                                            id="imagen_url_input" 
                                            type="text" 
                                            name="imagen_url" 
                                            placeholder="https://..." 
                                            value={formData.is_image_external ? formData.imagen_url : ''} 
                                            onChange={(e) => {
                                                setFormData(p => ({...p, imagen_url: e.target.value, is_image_external: true}));
                                            }} 
                                            className="w-full p-2 text-sm border rounded"
                                        />
                                        {formData.is_image_external && formData.imagen_url && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({...p, imagen_url: '', is_image_external: true}))}
                                                className="flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                                                aria-label="Remove URL"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    
                                    {formData.is_image_external && formData.imagen_url && (
                                        <div className="p-2 mt-2 bg-gray-100 border rounded-lg">
                                            <img src={formData.imagen_url} alt={formData.titulo ? `Preview for: ${formData.titulo}` : 'Image preview'} className="object-contain w-full bg-white border rounded-lg max-h-32" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {imageSourceType === 'upload' && (
                                <div className="mt-2">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            {isProcessingImage ? (
                                                <div className="flex flex-col items-center justify-center w-24 h-24 p-2 text-sm text-center text-gray-600 bg-gray-100 border-2 border-dashed rounded-lg animate-pulse">
                                                    <Spinner size="md" />
                                                    <span className="mt-1">Processing...</span>
                                                </div>
                                            ) : !formData.is_image_external && formData.imagen_url ? (
                                                <img
                                                    src={formData.imagen_url}
                                                    alt="Uploaded image preview"
                                                    className="object-cover w-24 h-24 border rounded-lg shadow-sm"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-24 h-24 text-gray-400 bg-gray-100 border-2 border-dashed rounded-lg">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <label htmlFor="image-upload" className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer ${isProcessingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                <span>{!formData.is_image_external && formData.imagen_url ? 'Change Image' : 'Choose File'}</span>
                                                <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isProcessingImage} />
                                            </label>
                                            <p className="mt-2 text-xs text-gray-500">
                                                Image will be resized to a max width of 800px.
                                            </p>
                                            {!formData.is_image_external && formData.imagen_url && !isProcessingImage && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData(p => ({...p, imagen_url: '', is_image_external: false}))}
                                                    className="inline-flex items-center px-3 py-1 mt-2 text-xs font-medium text-red-600 transition-colors bg-transparent rounded hover:bg-red-50"
                                                >
                                                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove Uploaded Image
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 mt-4 space-x-2 border-t">
                         <Button variant="secondary" type="button" onClick={() => setIsPreviewOpen(true)}>
                            Live Preview
                        </Button>
                        <div className="space-x-2">
                            <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
                            <Button type="submit">Save Noticia</Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Article Live Preview">
                <ArticlePreview 
                    noticia={formData} 
                    tropo={getTropo(Number(formData.tropo_id))} 
                />
            </Modal>
        </div>
    );
};

export default NoticiasAdminPage;
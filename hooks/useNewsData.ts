
import { useState, useEffect, useCallback } from 'react';
import { Noticia, Tropo } from '../types';
import { generateInitialData } from '../services/geminiService';

const useNewsData = () => {
  const [tropos, setTropos] = useState<Tropo[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storedData = localStorage.getItem('newsData');
      if (storedData) {
        const { tropos, noticias } = JSON.parse(storedData);
        setTropos(tropos);
        setNoticias(noticias);
      } else {
        const data = await generateInitialData();
        setTropos(data.tropos);
        setNoticias(data.noticias);
        localStorage.setItem('newsData', JSON.stringify(data));
      }
    } catch (err) {
      setError('Failed to fetch initial data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAndPersist = (newTropos: Tropo[], newNoticias: Noticia[]) => {
    setTropos(newTropos);
    setNoticias(newNoticias);
    localStorage.setItem('newsData', JSON.stringify({ tropos: newTropos, noticias: newNoticias }));
  };

  // Noticia CRUD
  const addNoticia = (noticia: Omit<Noticia, 'id'>) => {
    const newNoticia: Noticia = { ...noticia, id: Date.now(), timestamp: new Date().toISOString() };
    const updatedNoticias = [newNoticia, ...noticias];
    updateAndPersist(tropos, updatedNoticias);
  };

  const updateNoticia = (updatedNoticia: Noticia) => {
    const updatedNoticias = noticias.map(n => n.id === updatedNoticia.id ? updatedNoticia : n);
    updateAndPersist(tropos, updatedNoticias);
  };

  const deleteNoticia = (id: number) => {
    const updatedNoticias = noticias.filter(n => n.id !== id);
    updateAndPersist(tropos, updatedNoticias);
  };

  // Tropo CRUD
  const addTropo = (tropo: Omit<Tropo, 'id'>) => {
    const newTropo: Tropo = { ...tropo, id: Date.now() };
    const updatedTropos = [...tropos, newTropo];
    updateAndPersist(updatedTropos, noticias);
  };

  const updateTropo = (updatedTropo: Tropo) => {
    const updatedTropos = tropos.map(t => t.id === updatedTropo.id ? updatedTropo : t);
    updateAndPersist(updatedTropos, noticias);
  };

  const deleteTropo = (id: number) => {
    const isTropoInUse = noticias.some(n => n.tropo_id === id);
    if(isTropoInUse) {
      alert("Cannot delete a category that is currently in use by news articles.");
      return;
    }
    const updatedTropos = tropos.filter(t => t.id !== id);
    updateAndPersist(updatedTropos, noticias);
  };

  const getTropoBySlug = useCallback((slug: string): Tropo | undefined => {
    return tropos.find(t => t.slug === slug);
  }, [tropos]);

  return {
    tropos,
    noticias,
    loading,
    error,
    addNoticia,
    updateNoticia,
    deleteNoticia,
    addTropo,
    updateTropo,
    deleteTropo,
    getTropoBySlug,
  };
};

export default useNewsData;

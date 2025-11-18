import { useState, useEffect, useCallback } from 'react';
import { RecentlyViewedArticle } from '../types';

const HISTORY_KEY = 'recentlyViewedArticles';
const MAX_HISTORY_SIZE = 5;

export const useReadingHistory = () => {
  const [history, setHistory] = useState<RecentlyViewedArticle[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse reading history:", error);
      setHistory([]);
    }
  }, []);

  const addArticleToHistory = useCallback((article: RecentlyViewedArticle) => {
    setHistory(prevHistory => {
      // Remove existing entry if it's already there to move it to the front
      const filteredHistory = prevHistory.filter(item => item.slug !== article.slug || item.tropoSlug !== article.tropoSlug);
      
      // Add new article to the front
      const newHistory = [article, ...filteredHistory];
      
      // Limit the history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.length = MAX_HISTORY_SIZE;
      }
      
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save reading history:", error);
      }
      
      return newHistory;
    });
  }, []);

  return { history, addArticleToHistory };
};

// Utility for managing reading history in localStorage

const HISTORY_KEY = 'thuvien_reading_history';
const MAX_HISTORY_ITEMS = 50;

export const historyStorage = {
  // Add or update a book in history
  addToHistory: (book) => {
    try {
      const history = historyStorage.getHistory();
      
      // Create history item
      const historyItem = {
        id: book.id,
        name: book.name,
        author: book.author,
        category: book.category,
        thumbnailPath: book.thumbnailPath,
        views: book.views || 0,
        timestamp: new Date().toISOString()
      };
      
      // Remove if already exists
      const filtered = history.filter(item => item.id !== book.id);
      
      // Add to beginning
      filtered.unshift(historyItem);
      
      // Keep only MAX_HISTORY_ITEMS
      const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      
      return trimmed;
    } catch (error) {
      console.error('Error adding to history:', error);
      return [];
    }
  },
  
  // Get all history items
  getHistory: () => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },
  
  // Remove specific item from history
  removeFromHistory: (bookId) => {
    try {
      const history = historyStorage.getHistory();
      const filtered = history.filter(item => item.id !== bookId);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (error) {
      console.error('Error removing from history:', error);
      return historyStorage.getHistory();
    }
  },
  
  // Clear all history
  clearHistory: () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      return [];
    } catch (error) {
      console.error('Error clearing history:', error);
      return [];
    }
  },
  
  // Check if book is in history
  isInHistory: (bookId) => {
    const history = historyStorage.getHistory();
    return history.some(item => item.id === bookId);
  }
};

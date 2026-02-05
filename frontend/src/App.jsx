import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AddBookPage from './pages/AddBookPage';
import BookDetailPage from './pages/BookDetailPage';
import ReadPage from './pages/ReadPage';
import HotBooksPage from './pages/HotBooksPage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/doc/:id" element={<ReadPage />} />
          <Route path="*" element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tim-kiem" element={<SearchPage />} />
                <Route path="/them-truyen" element={<AddBookPage />} />
                <Route path="/truyen-hot" element={<HotBooksPage />} />
                <Route path="/lich-su" element={<HistoryPage />} />
                <Route path="/sach/:id" element={<BookDetailPage />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

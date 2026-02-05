import './TrendingSection.css';

const TrendingSection = ({ books = [] }) => {
  // Use books from props, display top 10 by views
  const trendingBooks = books
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map((book) => ({
      id: book.id,
      title: book.name,
      views: `${(book.views || 0).toLocaleString()} lượt xem`
    }));

  return (
    <div className="trending-section">
      <div className="trending-header">
        <h2>TRENDING</h2>
      </div>
      <div className="trending-list">
        {trendingBooks.map((book, index) => (
          <div key={book.id} className="trending-item">
            <div className={`trending-rank rank-${index + 1}`}>
              {index + 1}
            </div>
            <div className="trending-info">
              <h3 className="trending-title">{book.title}</h3>
              <p className="trending-views">{book.views}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;

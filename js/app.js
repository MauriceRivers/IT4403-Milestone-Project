
$(document).ready(function () {
  const searchBtn = $('#searchBtn');
  const searchInput = $('#searchInput');
  const resultsDiv = $('#results');
  const bookDetailsDiv = $('#bookDetails');
  const toggleViewBtn = $('#toggleView');
  const loadBookshelfBtn = $('#loadBookshelf');

  let currentView = 'grid';
  let currentQuery = '';
  let startIndex = 0;
  const maxResults = 10;

  function saveSearchHistory(term) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    history = history.filter(item => item !== term);
    history.unshift(term);
    if (history.length > 10) history.pop();
    localStorage.setItem('searchHistory', JSON.stringify(history));
    renderSearchHistory();
  }

  function renderSearchHistory() {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    let html = '<h3>Search History</h3>' + history.map(term => 
      `<button class='historyItem'>${term}</button>`
    ).join(' ');
    $('#searchHistory').html(html);

    $('.historyItem').click(function () {
      $('#searchInput').val($(this).text());
      searchBtn.click();
    });
  }

  function renderBooks(books) {
    $.get('templates/book-item.mustache', function(template) {
      let html = '';
      books.forEach(book => {
        const info = book.volumeInfo;
        const data = {
          id: book.id,
          title: info.title || "No Title",
          authors: info.authors ? info.authors.join(", ") : "N/A",
          publisher: info.publisher || "N/A",
          publishedDate: info.publishedDate || "N/A",
          previewLink: info.previewLink || "",
          shortDescription: info.description ? info.description.substring(0, 150) + "..." : "No description available.",
          viewClass: currentView
        };
        html += Mustache.render(template, data);
      });
      resultsDiv.html(html);
      renderPaginationControls();
    });
  }

  function renderPaginationControls() {
    const paginationHtml = `
      <div id="pagination">
        <button id="prevPage" ${startIndex === 0 ? "disabled" : ""}>Previous</button>
        <button id="nextPage">Next</button>
      </div>`;
    $('#results').append(paginationHtml);

    $('#prevPage').click(function () {
      if (startIndex >= maxResults) {
        startIndex -= maxResults;
        fetchBooks(currentQuery);
      }
    });

    $('#nextPage').click(function () {
      startIndex += maxResults;
      fetchBooks(currentQuery);
    });
  }

  function fetchBooks(query) {
    resultsDiv.html('<p>Searching...</p>');
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}`)
      .then(res => res.json())
      .then(data => {
        if (!data.items || data.items.length === 0) {
          resultsDiv.html('<p>No results found.</p>');
          return;
        }
        renderBooks(data.items);
      })
      .catch(() => {
        resultsDiv.html('<p>Error fetching results.</p>');
      });
  }

  function loadBookDetails(volumeId) {
    bookDetailsDiv.html('<p>Loading details...</p>');
    $.get('templates/book-detail.mustache', function(template) {
      fetch(`https://www.googleapis.com/books/v1/volumes/${volumeId}`)
        .then(res => res.json())
        .then(data => {
          const info = data.volumeInfo;
          const detailData = {
            title: info.title || "No Title",
            authors: info.authors ? info.authors.join(", ") : "N/A",
            publisher: info.publisher || "N/A",
            publishedDate: info.publishedDate || "N/A",
            pageCount: info.pageCount || "N/A",
            categories: info.categories ? info.categories.join(", ") : "N/A",
            description: info.description || "No description available.",
            previewLink: info.previewLink || ""
          };
          bookDetailsDiv.html(Mustache.render(template, detailData));
          $('html, body').animate({ scrollTop: bookDetailsDiv.offset().top }, 'slow');
        })
        .catch(() => {
          bookDetailsDiv.html('<p>Error loading book details.</p>');
        });
    });
  }

  function loadBookshelf() {
    const userId = '104524434943805325616';
    const shelfId = '1001';
    const apiURL = `https://www.googleapis.com/books/v1/users/${userId}/bookshelves/${shelfId}/volumes`;

    $('#results').empty();
    $('#bookDetails').html('<p>Loading bookshelf...</p>');
    fetch(apiURL)
      .then(res => res.json())
      .then(data => {
        if (!data.items || data.items.length === 0) {
          $('#bookDetails').html('<p>No books found in your public shelf.</p>');
          return;
        }

        $.get('templates/bookshelf-item.mustache', function(template) {
          let html = '<h2>My Bookshelf</h2>';
          data.items.forEach(book => {
            const info = book.volumeInfo;
            const shelfData = {
              id: book.id,
              title: info.title || "No Title",
              thumbnail: info.imageLinks?.thumbnail || ""
            };
            html += Mustache.render(template, shelfData);
          });
          $('#bookDetails').html(html);
        });
      })
      .catch(() => {
        $('#bookDetails').html('<p>Failed to load your bookshelf.</p>');
      });
  }

  searchBtn.click(function () {
    const query = searchInput.val().trim();
    bookDetailsDiv.empty();

    if (!query) {
      resultsDiv.html('<p>Please enter a search term.</p>');
      return;
    }

    currentQuery = query;
    startIndex = 0;
    saveSearchHistory(query);
    fetchBooks(query);
  });

  toggleViewBtn.click(function () {
    currentView = currentView === 'grid' ? 'list' : 'grid';
    if (currentQuery) fetchBooks(currentQuery);
  });

  loadBookshelfBtn.click(function () {
    loadBookshelf();
  });

  $(document).on('click', '.view-details', function (e) {
    e.preventDefault();
    const volumeId = $(this).data('id');
    loadBookDetails(volumeId);
  });

  renderSearchHistory();
});

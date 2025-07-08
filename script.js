const maxResults = 50;
const booksPerPage = 10;
let currentBooks = [];

$(document).ready(function () {
  $("#searchBtn").on("click", function () {
    const term = $("#searchTerm").val().trim();
    if (term !== "") {
      searchBooks(term);
    }
  });

  // Trigger search on Enter key
  $("#searchTerm").on("keypress", function (e) {
    if (e.which === 13) {
      $("#searchBtn").click();
    }
  });

  loadBookshelf(); // Load your public bookshelf on page load
});

function searchBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;

  $.getJSON(url, function (data) {
    currentBooks = data.items || [];
    showPage(1);
    renderPagination(currentBooks.length);
  });
}

function showPage(pageNum) {
  const start = (pageNum - 1) * booksPerPage;
  const end = start + booksPerPage;
  const pageBooks = currentBooks.slice(start, end);

  $("#results").empty();
  pageBooks.forEach(book => {
    const title = book.volumeInfo.title || "No Title";
    const img = book.volumeInfo.imageLinks?.thumbnail || "";

    const bookDiv = $(`
      <div class="book" data-id="${book.id}">
        <img src="${img}" alt="${title}">
        <p>${title}</p>
      </div>
    `);

    bookDiv.on("click", function () {
      showBookDetails(book);
    });

    $("#results").append(bookDiv);
  });

  $(".page-link").removeClass("active-page");
  $(`.page-link[data-page='${pageNum}']`).addClass("active-page");
}

function renderPagination(totalBooks) {
  const totalPages = Math.ceil(totalBooks / booksPerPage);
  $("#pagination").empty();

  for (let i = 1; i <= totalPages; i++) {
    const btn = $(`<span class="page-link" data-page="${i}">${i}</span>`);
    btn.on("click", function () {
      showPage(i);
    });
    $("#pagination").append(btn);
  }
}

function showBookDetails(book) {
  const info = book.volumeInfo;
  const title = info.title || "No Title";
  const authors = info.authors ? info.authors.join(", ") : "Unknown Author";
  const description = info.description || "No description available.";
  const img = info.imageLinks?.thumbnail || "";

  $("#bookDetails").html(`
    <h3>${title}</h3>
    <p><strong>Authors:</strong> ${authors}</p>
    <img src="${img}" alt="${title}">
    <p>${description}</p>
  `);
}

function loadBookshelf() {
  const shelfID = "1000";
  const userID = "104524434943805325616";

  const url = `https://www.googleapis.com/books/v1/users/${userID}/bookshelves/${shelfID}/volumes`;

  $.getJSON(url, function (data) {
    const books = data.items || [];

    $("#bookshelf").empty();
    books.forEach(book => {
      const title = book.volumeInfo.title || "No Title";
      const img = book.volumeInfo.imageLinks?.thumbnail || "";

      const bookDiv = $(`
        <div class="book">
          <img src="${img}" alt="${title}">
          <p>${title}</p>
        </div>
      `);

      bookDiv.on("click", function () {
        showBookDetails(book);
      });

      $("#bookshelf").append(bookDiv);
    });
  });
}

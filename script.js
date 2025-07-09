document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const resultsDiv = document.getElementById("results");

  searchBtn.addEventListener("click", function () {
    const query = searchInput.value.trim();

    if (query === "") {
      resultsDiv.innerHTML = "<p>Please enter a search term.</p>";
      return;
    }

    // Clear previous results
    resultsDiv.innerHTML = "<p>Searching...</p>";

    // Fetch data from Google Books API
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        resultsDiv.innerHTML = "";

        if (!data.items || data.items.length === 0) {
          resultsDiv.innerHTML = "<p>No results found.</p>";
          return;
        }

        // Loop through books
        data.items.forEach((book) => {
          const bookInfo = book.volumeInfo;
          const bookDiv = document.createElement("div");
          bookDiv.className = "book";

         bookDiv.innerHTML = `
  <h3>${bookInfo.title || "No Title"}</h3>
  <p><strong>Author(s):</strong> ${bookInfo.authors ? bookInfo.authors.join(", ") : "N/A"}</p>
  <p><strong>Publisher:</strong> ${bookInfo.publisher || "N/A"}</p>
  <p><strong>Published Date:</strong> ${bookInfo.publishedDate || "N/A"}</p>
  <p>${bookInfo.description ? bookInfo.description.substring(0, 200) + "..." : "No description available."}</p>
  <p>
    ${bookInfo.previewLink ? `<a href="${bookInfo.previewLink}" target="_blank">Preview Book</a>` : ""}
    | <a href="details.html?volumeId=${book.id}">View Details</a>
  </p>
  <hr>
`;



          resultsDiv.appendChild(bookDiv);
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        resultsDiv.innerHTML = "<p>Error fetching results. Please try again later.</p>";
      });
  });
});

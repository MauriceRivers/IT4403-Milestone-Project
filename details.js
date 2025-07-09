document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const volumeId = params.get("volumeId");
  const bookDetailsDiv = document.getElementById("book-details");

  if (!volumeId) {
    bookDetailsDiv.innerHTML = "<p>No book selected.</p>";
    return;
  }

  fetch(`https://www.googleapis.com/books/v1/volumes/${volumeId}`)
    .then(response => response.json())
    .then(data => {
      const bookInfo = data.volumeInfo;
      bookDetailsDiv.innerHTML = `
        <h2>${bookInfo.title || "No Title"}</h2>
        <p><strong>Author(s):</strong> ${bookInfo.authors ? bookInfo.authors.join(", ") : "N/A"}</p>
        <p><strong>Publisher:</strong> ${bookInfo.publisher || "N/A"}</p>
        <p><strong>Published Date:</strong> ${bookInfo.publishedDate || "N/A"}</p>
        <p><strong>Page Count:</strong> ${bookInfo.pageCount || "N/A"}</p>
        <p><strong>Categories:</strong> ${bookInfo.categories ? bookInfo.categories.join(", ") : "N/A"}</p>
        <p><strong>Description:</strong> ${bookInfo.description || "No description available."}</p>
        ${bookInfo.previewLink ? `<p><a href="${bookInfo.previewLink}" target="_blank">Preview on Google Books</a></p>` : ""}
      `;
    })
    .catch(error => {
      console.error("Error loading book details:", error);
      bookDetailsDiv.innerHTML = "<p>Error loading book details. Please try again later.</p>";
    });
});

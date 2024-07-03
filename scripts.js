document.addEventListener('DOMContentLoaded', () => {
    const books = [];

    fetch('books.json')
        .then(response => response.json())
        .then(jsonData => {
            books.push(...jsonData);
            fetchCSVData();
        });

    function fetchCSVData() {
        fetch('books.csv')
            .then(response => response.text())
            .then(csvData => {
                const parsedData = parseCSV(csvData);
                mergeData(parsedData);
                displayBooks(books);
            });
    }

    function parseCSV(data) {
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const book = {};
            headers.forEach((header, index) => {
                book[header.trim()] = index === 0 ? parseInt(values[index].trim(), 10) : values[index].trim();
            });
            return book;
        });
    }

    function mergeData(csvBooks) {
        csvBooks.forEach(csvBook => {
            const book = books.find(book => book.id == csvBook.id);
            if (!book) {
                books.push(csvBook);
            }
        });
    }

    function displayBooks(bookList) {
        const sortCriteria = document.getElementById('sort-options').value;
        bookList.sort((a, b) => a[sortCriteria].localeCompare(b[sortCriteria]));
        
        const bookListElement = document.getElementById('book-list');
        bookListElement.innerHTML = '';
        bookList.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-list__item');
            bookItem.innerHTML = `
                <div class="book-list__title">${book.title}</div>
                <div class="book-list__author">${book.author}</div>
                <div class="book-list__genre">${book.genre}</div>
            `;
            bookListElement.appendChild(bookItem);
        });
    }

    function searchBooks(query) {
        const filteredBooks = books.filter(book => {
            return book.title.toLowerCase().includes(query) || 
                   book.author.toLowerCase().includes(query) ||
                   book.genre.toLowerCase().includes(query);
        });

        if (filteredBooks.length === 0) {
            document.getElementById('book-list').innerHTML = '<div class="no-results">No results found</div>';
        } else {
            displayBooksWithHighlight(filteredBooks, query);
        }
    }

    function displayBooksWithHighlight(bookList, query) {
        const bookListElement = document.getElementById('book-list');
        bookListElement.innerHTML = '';
        bookList.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-list__item');
            bookItem.innerHTML = `
                <div class="book-list__title">${highlightText(book.title, query)}</div>
                <div class="book-list__author">${highlightText(book.author, query)}</div>
                <div class="book-list__genre">${highlightText(book.genre, query)}</div>
            `;
            bookListElement.appendChild(bookItem);
        });
    }

    function highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    function sortBooks(criteria) {
        books.sort((a, b) => a[criteria].localeCompare(b[criteria]));
        displayBooks(books);
    }

    document.getElementById('search-input').addEventListener('input', () => {
        const query = document.getElementById('search-input').value.toLowerCase();
        searchBooks(query);
    });

    document.getElementById('sort-options').addEventListener('change', (event) => {
        const criteria = event.target.value;
        sortBooks(criteria);
    });
});

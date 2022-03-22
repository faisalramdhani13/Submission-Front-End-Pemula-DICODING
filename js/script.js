const UNCOMPLETED_BOOK_ID = "unread";
const COMPLETED_BOOK_ID = "read";
const BOOK_ITEMID = "itemId";
const STORAGE_KEY = "BOOK_APPS";


function addBook() {
    const checkbox = document.getElementById('isCompleted');
    if(checkbox.checked === true){
        const isCompleted = document.getElementById(COMPLETED_BOOK_ID);

        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const year = document.getElementById('year').value;

        const book = makeBook(title, author, year, true)
        const bookObject = composeBookObject(title, author, year, true)

        book[BOOK_ITEMID] = bookObject.id;
        books.push(bookObject);

        isCompleted.append(book)
        updateDataToStorage();
    } else {
        const isUncompleted = document.getElementById(UNCOMPLETED_BOOK_ID);
        
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const year = document.getElementById('year').value;

        const book = makeBook(title, author, year, false);
        const bookObject = composeBookObject(title, author, year, false);

        book[BOOK_ITEMID] = bookObject.id;
        books.push(bookObject);

        isUncompleted.append(book);
        updateDataToStorage();
    }
}

function makeBook(title, author, year, isCompleted) {
    const bookTitle = document.createElement('h3');
    bookTitle.classList.add('title');
    bookTitle.innerText = title;

    const bookAuthor = document.createElement('p');
    bookAuthor.classList.add('author');
    bookAuthor.innerHTML = author;

    const bookYear = document.createElement('p');
    bookYear.classList.add('year');
    bookYear.innerHTML = year; 

    const bookContainer = document.createElement('div');
    bookContainer.classList.add('inner');
    bookContainer.append(bookTitle, bookAuthor, bookYear);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(bookContainer);

    if(isCompleted){
        container.append(createUndoButton(), trashButton());
    } else {
        container.append(createCheckButton(), trashButton());
    }

    return container;
}

function addBookToCompleted(bookElement){
    const bookCompleted = document.getElementById(COMPLETED_BOOK_ID);
    const bookTitle = bookElement.querySelector(".inner > .title").innerHTML;
    const bookAuthor = bookElement.querySelector(".inner > .author").innerHTML;
    const bookYear = bookElement.querySelector(".inner > .year").innerHTML;

    const newBook = makeBook(bookTitle, bookAuthor, bookYear, true);

    const book = findBook(bookElement[BOOK_ITEMID]);
    book.isCompleted = true;
    newBook[BOOK_ITEMID] = book.id;

    bookCompleted.append(newBook);
    bookElement.remove();

    updateDataToStorage();
}

function undoBookFromCompleted(bookElement){
    const bookUncompleted = document.getElementById(UNCOMPLETED_BOOK_ID);
    const bookTitle = bookElement.querySelector(".inner > .title").innerHTML;
    const bookAuthor = bookElement.querySelector(".inner > .author").innerHTML;
    const bookYear = bookElement.querySelector(".inner > .year").innerHTML;

    const newBook = makeBook(bookTitle, bookAuthor, bookYear, false);

    const book = findBook(bookElement[BOOK_ITEMID]);
    book.isCompleted = false;
    newBook[BOOK_ITEMID] = book.id;

    bookUncompleted.append(newBook);
    bookElement.remove();

    updateDataToStorage();
}

function createButton(btn, eventListener) {
    const button = document.createElement('button');
    button.classList.add(btn);
    button.addEventListener("click", function(event){
        eventListener(event);
    });

    return button;
}

function createCheckButton(){
    return createButton('check-button', function(event){
        addBookToCompleted(event.target.parentElement);
    });
}

function createUndoButton(){
    return createButton('undo-button', function(event){
        undoBookFromCompleted(event.target.parentElement);
    });
}

function trashButton(){
    return createButton('trash-button', function(event){
        if(confirm("Apakah Anda yakin ingin menghapus buku ini?")){
            removeBookFromCompleted(event.target.parentElement);
        }
    });
}

function removeBookFromCompleted(bookElement){
    const bookTarget = findBookIndex(bookElement[BOOK_ITEMID]);
    books.splice(bookTarget, 1);

    bookElement.remove();
    updateDataToStorage();
}

let books = [];

function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert("Browser tidak mendukung.")
        return false
    }
    return true;
}

function saveData(){
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event('ondatasaved'));
}

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    
    let data = JSON.parse(serializedData);

    if(data !== null)
    books = data

    document.dispatchEvent(new Event('ondataloaded'));
}

function updateDataToStorage(){
    if(isStorageExist())
    saveData();
}

function composeBookObject(bookTitle, bookAuthor, bookYear, isCompleted){
    return {
        id: +new Date(),
        bookTitle, bookAuthor, bookYear, isCompleted
    };
}

function findBook(bookId){
    for(book of books){
        if(book.id === bookId)
        return book;
    }
    return null;
}

function findBookIndex(bookId){
    let index = 0
    for(book of books){
        if(book.id === bookId)
        return index;

        index++;
    }

    return -1;
}

function refreshDataBooks(){
    const bookUncompleted = document.getElementById(UNCOMPLETED_BOOK_ID);
    let bookCompleted = document.getElementById(COMPLETED_BOOK_ID);

    for(book of books){
        const newBook = makeBook(book.bookTitle, book.bookAuthor, book.bookYear, book.isCompleted);
        newBook[BOOK_ITEMID] = book.id;

        if(book.isCompleted){
            bookCompleted.append(newBook);
        } else {
            bookUncompleted.append(newBook);
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const submitForm = document.getElementById('inputBook');

    submitForm.addEventListener('submit', function(search) {
        search.preventDefault();
        addBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

document.addEventListener('ondatasaved', function() {
    console.log("Data Berhasil Disimpan.")
});

document.addEventListener('ondataloaded', function() {
    refreshDataBooks();
})
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



public_users.post("/register", (req,res) => {
  //Write your code here
  const {username, password} = req.body;

  if(users[username]){
    return res.status(400).json({message: "Username already exists"});
  }

  if(!username || !password){
    return res.status(400).json({ message: "Username and password are required" });
  }

  users[username] = {password};

  return res.status(201).json({ message: "User registered successfully" });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here

    axios.get('https://yeraygonzale-5010.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books')
    .then(response => {
        console.log('Books:', response.data); 
    })
    .catch(error => {
        console.log('Error:', error.message);
    });

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    // Obtener el ISBN de los parámetros de la URL
    const isbn = req.params.isbn;
  
    try {
      const response = await axios.get(`https://yeraygonzale-5010.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/isbn/${isbn}`);
      return res.status(200).json(response.data);
    } catch (error) {
      console.log('Error:', error.message);
      return res.status(500).json({ message: 'Error' });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    // Obtener el autor de los parámetros de la URL
    const author = req.params.author;
  
    try {
      // Hacer la solicitud a la API externa para obtener los libros de un autor específico
      const response = await axios.get(`https://yeraygonzale-5010.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${author}`);
      
      // Verificar si la respuesta contiene libros
      if (response.data && response.data.length > 0) {
        return res.status(200).json(response.data); // Si hay resultados, devolverlos
      } else {
        return res.status(404).json({ message: "No books found for this author" }); // Si no hay resultados
      }
    } catch (error) {
      // Manejo de errores
      console.log('Error:', error.message);
      return res.status(500).json({ message: 'Error al obtener los libros por autor' });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;

  const booksByTitle = Object.values(books).filter(book => book.title === title); // Filtrar libros por autor

    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle); // Si hay resultados, devolverlos
    } else {
        return res.status(404).json({ message: "No books found for this title" }); // Si no hay resultados, devolver error 404
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  if(books[isbn]){
    const reviews = books[isbn].reviews;
        return res.status(300).json({reviews});
  }
  else{
        return res.status(404).json({ message: "Book not found" }); // Si no existe, devolver un error 404
  }
});

module.exports.general = public_users;

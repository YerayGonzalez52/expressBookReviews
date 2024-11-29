const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
    
      // Verifica las credenciales del usuario
      if (authenticatedUser(username, password)) {
        // Genera un token JWT con una expiración de 1 hora
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
    
        // Guarda el token y el nombre de usuario en la sesión (si es necesario)
        req.session.authorization = {
          accessToken,
          username
        };
    
        return res.status(200).json({
          message: "User successfully logged in",
          accessToken: accessToken // Puedes devolver el token al usuario para que lo use
        });
      } else {
        return res.status(401).json({ message: "Invalid login. Check username and password" });
      }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Verificar si el usuario está autenticado
    const { username } = req.session.authorization;
    if (!username) {
      return res.status(401).json({ message: "You must be logged in to post a review" });
    }
  
    // Obtener el ISBN y la reseña de la solicitud
    const isbn = req.params.isbn;
    const review = req.query.review;  // Se espera la reseña como parámetro en la query
  
    // Verificar si se proporcionó una reseña
    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }
  
    // Verificar si el libro existe
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Agregar o modificar la reseña para el libro
    if (books[isbn].reviews[username]) {
      // Si el usuario ya ha dejado una reseña, modificarla
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // Si el usuario no ha dejado una reseña, agregarla
      books[isbn].reviews[username] = review;
      return res.status(201).json({ message: "Review added successfully" });
    }
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // ISBN del libro
    const username = req.session.authorization.username; // Usuario autenticado desde la sesión
    const review = req.body.review; // Reseña que se quiere eliminar (puede ser opcional si no se envía)

    // Verificar si el libro existe en la base de datos
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Verificar si el libro tiene reseñas
    if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }

    // Comprobar si el usuario tiene una reseña para ese libro
    if (!books[isbn].reviews[username]) {
        return res.status(403).json({ message: "You cannot delete a review you haven't posted" });
    }

    // Eliminar la reseña del libro para ese usuario
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});

  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

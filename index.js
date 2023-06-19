const { query } = require("express");
const express = require("express");
const app = express();
const session = require('express-session');


// BDD 
const mysql = require('mysql');
const connect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nitrocol",
});

app.use(express.static("public"));

app.set('view engine', "ejs");
app.set('views', "./views");
app.listen(8080);

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({extended : true}))

// authentification
app.post("/", (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    if (username && password) {
        connect.query('SELECT * FROM users WHERE username = ?', [username], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                const user = results[0];
                if (user.password === password) {
                    request.session.loggedin = true;
                    request.session.userId = user.id;
                    response.redirect('/home');
                } else {
                    response.send("Invalid username or password");
                }
            } else {
                response.send("Invalid username or password");
            }
            response.end();
        });
    } else {
        response.send("Enter username and password");
        response.end();
    }
});

connect.connect(function(err){
    if (err) throw err;
    console.log("Yess cela fonctionne");
    connect.query("SELECT * from users;", function(err, result){
        if (err) throw err;
    })
});

// read users
app.get("/users", function (request, response) {
    connect.query("SELECT * FROM users;", function (err, result) {
        if (err) throw err;
        console.log(result);
        response.render("users", {users: result})
         
    })
});

// read profil user
app.get("/home", function (request, response) {
    if (request.session.loggedin) {
        const userId = request.session.userId;
        console.log(userId);
        console.log("ok");

        connect.query("SELECT * FROM users WHERE id = ?", [userId], function (err, result) {
            if (err) throw err;
            console.log(result);
            response.render("home", { user: result[0] });
        });
    } else {
        response.send('Go login');
    }
});

// read products
app.get("/products", function (request, response) {
    connect.query("SELECT * FROM produits;", function (err, result) {
        if (err) throw err;
        console.log(result);
        response.render("products", {products: result})
         
    })
});

// add users
app.post("/add_user", (request, response) => {
    const querys = "INSERT INTO users (username, password, f_name, l_name, img) VALUES ('" + request.body.username + "', '" + request.body.password + "', '" + request.body.f_name + "', '" + request.body.l_name + "', '" + request.body.img + "');";
    console.log(querys);
    connect.query(querys, function (err, result) {
        if (err) throw err;
        response.redirect('/users')
    })
});

// add products
app.post("/add_product", (request, response) => {
    const querys = "INSERT INTO produits (titres, descriptions, img , dates , avis , prix) VALUES ('" + request.body.titres + "', '" + request.body.descriptions + "', '" + request.body.img + "', '" + new Date().toISOString() + "', '" + request.body.avis + "', '" + request.body.prix + "');";
    console.log(querys);
    connect.query(querys, function (err, result) {
        if (err) throw err;
        response.redirect('/products')
    })
});

app.get("/add_user", (request, response) => {
    response.render("add_user");
});
app.get("/add_product", (request, response) => {
    response.render("add_product");
});

app.get("/", function (request, response) {
    response.render("login");
})

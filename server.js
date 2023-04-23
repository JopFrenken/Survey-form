/**
 * Main entry point for the web server application.
 * 
 * This file sets up the Express application instance, including middleware 
 */ 

const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const router = require("./router.js");
const dotenv = require("dotenv");
const db = require("./utils/Database.js");

dotenv.config();
db.connect();

const app = express();

app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.raw());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

router(app);
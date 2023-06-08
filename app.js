var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
require("dotenv").config();
const Dishes = require("./models/dishes");
const Comments = require("./models/comments");
const mongoose = require("mongoose");
const dishesRouter = require("./routes/dishes");
const promotionsRouter = require("./routes/promotions");
const leaderRouter = require("./routes/leaders");
const DATABASE = process.env.DATABASE;
const url = `mongodb://127.0.0.1:27017/${DATABASE}`;
const session = require("express-session");
const FileStore = require("session-file-store")(session);
var app = express();

app.use(
    session({
        name: "session-id",
        secret: "12345-67890",
        saveUninitialized: false,
        resave: false,
        store: new FileStore(),
    })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(cookieParser("12345-67890"));
app.use(auth);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishesRouter);
app.use("/promotions", promotionsRouter);
app.use("/leaders", leaderRouter);

app.use(cookieParser("12345-67890"));
function auth(req, res, next) {
    console.log("request headers>>", req.headers);
    if (!req.session.user) {
        let authHeader = req.headers.authorization;
        if (!authHeader) {
            let err = new Error("You are not authenticated");
            res.setHeader("WWW-Authenticate", "Basic");
            err.status = 401;
            next(err);
            return;
        }
        let auth = new Buffer.from(authHeader.split(" ")[1], "base64")
            .toString()
            .split(":");
        let username = auth[0];
        let password = auth[1];
        if (username === "admin" && password === "password") {
            session.user = "admin";
            next();
        } else {
            let err = new Error("You are not authenticated");
            res.setHeader("WWW-Authenticate", "Basic");
            err.status = 401;
            next(err);
        }
    } else {
        if (req.session.user === "admin") {
            console.log("req.session: ", req.session);

            next();
        } else {
            let err = new Error("You are not authenticated");
            err.status = 401;
            next(err);
        }
    }
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

const connect = mongoose.connect(url);

connect.then(
    (db) => {
        console.log("Connected correctly to server");
    },
    (err) => {
        console.log(err);
    }
);

module.exports = app;

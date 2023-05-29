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

const DATABASE = process.env.DATABASE;
const url = `mongodb://127.0.0.1:27017/${DATABASE}`;

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishesRouter);

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
    () => {
        console.log("Connect to db successful");
    },
    (err) => console.log("err>>", err.message)
);

module.exports = app;

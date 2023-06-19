var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
require("dotenv").config();
const mongoose = require("mongoose");
const dishesRouter = require("./routes/dishes");
const promotionsRouter = require("./routes/promotions");
const leaderRouter = require("./routes/leaders");
const DATABASE = process.env.DATABASE;
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/users");
const config = require("./config");
const authenticate = require("./authenticate");
var app = express();

const url = config.mongoUrl;

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(
    session({
        name: "session-id",
        secret: "12345-67890",
        saveUninitialized: false,
        resave: false,
        store: new FileStore({ logFn: function () {} }),
    })
);

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishesRouter);
app.use("/promotions", promotionsRouter);
app.use("/leaders", leaderRouter);

// app.use(cookieParser("12345-67890"));

function auth(req, res, next) {
    console.log("req.user >>", req.user);
    if (!req.user) {
        let err = new Error("You are already authenticated!");
        err.status = 403;
        return next(err);
    } else {
        next();
    }
}

// app.use(auth);

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
        console.log("Connected correctly to mogoDB server");
    },
    (err) => {
        console.log(err);
    }
);

module.exports = app;

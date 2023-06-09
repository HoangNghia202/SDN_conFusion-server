var express = require("express");
var router = express.Router();
const passport = require("passport");
const User = require("../models/users");
const authenticate = require("../authenticate");
const { verifyUser, verifyAdmin } = require("../authenticate");
const { corsWithOptions } = require("./cors");
/* GET users listing. */
router.get("/", verifyUser, verifyAdmin, function (req, res, next) {
    User.find({})
        .then((users) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(users);
        })
        .catch((err) => next(err));
});

router.post("/signup", corsWithOptions, (req, res, next) => {
    console.log("res.body: ", req.body);

    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        async (err, user) => {
            console.log("user: ", user);
            if (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ err: err });
            } else {
                if (req.body.firstName) user.firstName = req.body.firstName;
                if (req.body.lastName) user.lastName = req.body.lastName;

                await user.save();
                passport.authenticate("local")(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json({
                        success: true,
                        status: "Registration Successful!",
                        user: user,
                    });
                });
            }
        }
    );
});

router.post(
    "/login",
    corsWithOptions,
    passport.authenticate("local"),
    (req, res) => {
        const token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({
            success: true,
            status: "You are successfully logged in!",
            accessToken: token,
        });
    }
);

router.get("/logout", corsWithOptions, (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            }
        });
        res.clearCookie("session-id");
        res.redirect("/");
    } else {
        var err = new Error("You are not logged in!");
        err.status = 403;
        next(err);
    }
});

router.get(
    "/facebook/token",
    passport.authenticate("facebook-token"),
    (req, res) => {
        if (req.user) {
            const token = authenticate.getToken({ _id: req.user._id });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                status: "You are successfully logged in!",
                accessToken: token,
            });
        }
    }
);

module.exports = router;

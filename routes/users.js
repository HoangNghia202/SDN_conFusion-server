var express = require("express");
var router = express.Router();
const passport = require("passport");
const User = require("../models/users");
const authenticate = require("../authenticate");
/* GET users listing. */
router.get("/", function (req, res, next) {
    res.send("respond with a resource");
});

router.post("/signup", (req, res, next) => {
    console.log("res.body: ", req.body);

    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            console.log("user: ", user);

            if (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ err: err });
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json({
                        success: true,
                        status: "Registration Successful!",
                    });
                });
                console.log("User created");
            }
        }
    );
});

router.post("/login", passport.authenticate("local"), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
        success: true,
        status: "You are successfully logged in!",
        accessToken: token,
    });
});

router.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie("session-id");
        res.redirect("/");
    } else {
        var err = new Error("You are not logged in!");
        err.status = 403;
        next(err);
    }
});

module.exports = router;

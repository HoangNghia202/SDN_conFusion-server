const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/users");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const FacebookTokenStrategy = require("passport-facebook-token");
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const config = require("./config.js");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

var opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        try {
            const user = await User.findOne({ _id: jwt_payload._id });
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = (req, res, next) => {
    console.log("req.user >>> ", req.user);
    if (req.user.admin) {
        next();
    } else {
        let err = new Error(
            "You are not authorized to perform this operation!"
        );
        err.status = 403;
        return next(err);
    }
};

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret,
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({ facebookId: profile.id }, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user !== null) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstName = profile.name.givenName;
                    user.lastName = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) return done(err, false);
                        else return done(null, user);
                    });
                }
            });
        }
    )
);

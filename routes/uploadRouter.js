const authenticate = require("../authenticate.js");
const multer = require("multer");
const express = require("express");
const { corsWithOptions } = require("./cors.js");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const imageFileFilter = (req, res, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error("You can upload only image files!"), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFileFilter });
const uploadRouter = express.Router();
uploadRouter
    .route("/")
    .get(
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            res.statusCode = 403;
            res.end("GET operation not supported on /imageUpload");
        }
    )
    .post(
        corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        upload.single("imageFile"),
        (req, res) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(req.file);
        }
    )
    .put(
        corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            res.statusCode = 403;
            res.end("PUT operation not supported on /imageUpload");
        }
    )
    .delete(
        corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            res.statusCode = 403;
            res.end("DELETE operation not supported on /imageUpload");
        }
    );

module.exports = uploadRouter;

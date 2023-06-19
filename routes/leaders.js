const express = require("express");
const leaderRouter = express.Router();
const Leaders = require("../models/leader");
const { verifyUser, verifyAdmin } = require("../authenticate");
leaderRouter
    .route("/")
    .get((req, res, next) => {
        Leaders.find({})
            .then(
                (leaders) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(leaders);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post(verifyUser, verifyAdmin, (req, res, next) => {
        Leaders.create(req.body)
            .then(
                (leader) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(leader);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .put(verifyUser, verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /leaders");
    })
    .delete(verifyUser, verifyAdmin, (req, res, next) => {
        Leaders.remove({})
            .then(
                (resp) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(resp);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    });

leaderRouter
    .route("/:leaderId")
    .get((req, res, next) => {
        Leaders.findById(req.params.leaderId)
            .then(
                (leader) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(leader);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post(verifyUser, verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(
            `POST operation not supported on /leaders/${req.params.leaderId}`
        );
    })
    .put(verifyUser, verifyAdmin, (req, res, next) => {
        Leaders.findByIdAndUpdate(
            req.params.leaderId,
            {
                $set: req.body,
            },
            { new: true }
        )
            .then(
                (leader) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(leader);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .delete(verifyUser, verifyAdmin, (req, res, next) => {
        Leaders.findByIdAndRemove(req.params.leaderId)
            .then(
                (resp) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(resp);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    });

module.exports = leaderRouter;

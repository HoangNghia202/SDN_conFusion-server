const express = require("express");
const promotionRouter = express.Router();
const Promotions = require("../models/promotions");
const { verifyAdmin, verifyUser } = require("../authenticate");
const { cors, corsWithOptions } = require("./cors");
promotionRouter
    .route("/")
    .get((req, res, next) => {
        Promotions.find({})
            .then(
                (promotions) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(promotions);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
        Promotions.create(req.body)
            .then(
                (promotion) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(promotion);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .put(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /promotions");
    })
    .delete(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
        Promotions.remove({})
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

promotionRouter
    .route("/:promotionId")
    .get((req, res, next) => {
        Promotions.findById(req.params.promotionId)
            .then(
                (promotion) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(promotion);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(
            "POST operation not supported on /promotions/" +
                req.params.promotionId
        );
    })
    .put(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
        Promotions.findByIdAndUpdate(
            req.params.promotionId,
            { $set: req.body },
            { new: true }
        )
            .then(
                (promotion) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(promotion);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })

    .delete(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
        Promotions.findByIdAndRemove(req.params.promotionId)
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

module.exports = promotionRouter;

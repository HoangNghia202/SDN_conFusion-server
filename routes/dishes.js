const express = require("express");
const mongoose = require("mongoose");
const Dishes = require("../models/dishes");
const dishRouter = express.Router();
const authenticate = require("../authenticate");
const { corsWithOptions, cors } = require("./cors");
const { verifyAdmin } = require("../authenticate");
dishRouter
    .route("/")
    .get(authenticate.verifyUser, (req, res, next) => {
        console.log("req.user: ", req.user);

        Dishes.find({})
            .populate("comments.author")
            .then(
                (dishes) => {
                    res.status = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dishes);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post(
        corsWithOptions,
        authenticate.verifyUser,
        verifyAdmin,
        async (req, res, next) => {
            await Dishes.create(req.body)
                .then(
                    (dish) => {
                        console.log("Dish created", dish);
                        res.status = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(dish);
                    },
                    (err) => next(err)
                )
                .catch((err) => next(err));
        }
    )

    .put(
        corsWithOptions,
        authenticate.verifyUser,
        verifyAdmin,
        (req, res, next) => {
            res.statusCode = 403;
            res.end("PUT operation not supported on /dishes");
        }
    )
    .delete(
        corsWithOptions,
        authenticate.verifyUser,
        verifyAdmin,
        (req, res, next) => {
            Dishes.remove({})
                .then(
                    (resp) => {
                        res.status = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(resp);
                    },
                    (err) => next(err)
                )
                .catch((err) => next(err));
        }
    );

dishRouter
    .route("/:dishId")
    .get((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate("comments.author")
            .then(
                (dish) => {
                    res.status = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post(
        corsWithOptions,
        authenticate.verifyUser,
        verifyAdmin,
        (req, res, next) => {
            res.statusCode = 403;
            res.end(
                "POST operation not supported on /dishes/" + req.params.dishId
            );
        }
    )
    .put(
        corsWithOptions,
        authenticate.verifyUser,
        verifyAdmin,
        (req, res, next) => {
            Dishes.findByIdAndUpdate(
                req.params.dishId,
                {
                    $set: req.body,
                },
                { new: true }
            )
                .then(
                    (dish) => {
                        res.status = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(dish);
                    },
                    (err) => next(err)
                )
                .catch((err) => next(err));
        }
    )
    .delete(
        corsWithOptions,
        authenticate.verifyUser,
        verifyAdmin,
        (req, res, next) => {
            Dishes.findByIdAndRemove(req.params.dishId)
                .then(
                    (resp) => {
                        res.status = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(resp);
                    },
                    (err) => next(err)
                )
                .catch((err) => next(err));
        }
    );

dishRouter
    .route("/:dishId/comments")
    .get(authenticate.verifyUser, (req, res, next) => {
        console.log("req.user: ", req.user);

        Dishes.findById(req.params.dishId)
            .populate("comments.author")
            .then(
                (dish) => {
                    if (dish != null) {
                        res.status = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(dish.comments);
                    } else {
                        err = new Error(
                            "Dish " + req.params.dishId + " not found"
                        );
                        err.status = 404;
                        return next(err);
                    }
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post(corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(
                (dish) => {
                    if (dish != null) {
                        req.body.author = req.user._id;
                        console.log("req.body: ", req.body);

                        dish.comments.push(req.body);
                        dish.save().then(
                            (dish) => {
                                res.status = 200;
                                res.setHeader(
                                    "Content-Type",
                                    "application/json"
                                );
                                res.json(dish);
                            },
                            (err) => next(err)
                        );
                    } else {
                        err = new Error(
                            "Dish " + req.params.dishId + " not found"
                        );
                        err.status = 404;
                        return next(err);
                    }
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .put(corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(
            "PUT operation not supported on /dishes/" +
                req.params.dishId +
                "/comments"
        );
    })
    .delete(authenticate.verifyUser, verifyAdmin, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(
                (dish) => {
                    if (dish != null) {
                        for (var i = dish.comments.length - 1; i >= 0; i--) {
                            dish.comments.id(dish.comments[i]._id).remove();
                        }
                        dish.save().then(
                            (dish) => {
                                res.status = 200;
                                res.setHeader(
                                    "Content-Type",
                                    "application/json"
                                );
                                res.json(dish);
                            },
                            (err) => next(err)
                        );
                    } else {
                        err = new Error(
                            "Dish " + req.params.dishId + " not found"
                        );
                        err.status = 404;
                        return next(err);
                    }
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    });

dishRouter
    .route("/:dishId/comments/:commentId")
    .get(cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate("comments.author")
            .then(
                (dish) => {
                    if (
                        dish != null &&
                        dish.comments.id(req.params.commentId) != null
                    ) {
                        res.status = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(dish.comments.id(req.params.commentId));
                    } else if (dish == null) {
                        err = new Error(
                            "Dish " + req.params.dishId + " not found"
                        );
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error(
                            "Comment " + req.params.commentId + " not found"
                        );
                        err.status = 404;
                        return next(err);
                    }
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post(cors, (req, res, next) => {
        res.statusCode = 403;
        res.end(
            "POST operation not supported on /dishes/" +
                req.params.dishId +
                "/comments/" +
                req.params.commentId
        );
    })
    .put(cors, authenticate.verifyUser, (req, res, next) => {
        if (req.body.author != req.user._id) {
            res.statusCode = 403;
            res.end("You are not authorized to perform this operation!");
        }
        Dishes.findById(req.params.dishId)
            .then(
                (dish) => {
                    if (
                        dish != null &&
                        dish.comments.id(req.params.commentId) != null
                    ) {
                        if (
                            req.user._id !=
                            dish.comments.id(req.params.commentId).author._id
                        ) {
                            res.statusCode = 403;
                            res.end(
                                "You are not authorized to perform this operation!"
                            );
                        }
                        if (req.body.rating) {
                            dish.comments.id(req.params.commentId).rating =
                                req.body.rating;
                        }
                        if (req.body.comment) {
                            dish.comments.id(req.params.commentId).comment =
                                req.body.comment;
                        }
                        dish.save().then(
                            (dish) => {
                                Dishes.findById(dish._id)
                                    .populate("comments.author")
                                    .then((dish) => {
                                        res.statusCode = 200;
                                        res.setHeader(
                                            "Content-Type",
                                            "application/json"
                                        );
                                        res.json(dish);
                                    });
                            },
                            (err) => next(err)
                        );
                    } else if (dish == null) {
                        err = new Error(
                            "Dish " + req.params.dishId + " not found"
                        );
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error(
                            "Comment " + req.params.commentId + " not found"
                        );
                        err.status = 404;
                        return next(err);
                    }
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })

    .delete(cors, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(
                (dish) => {
                    if (
                        dish != null &&
                        dish.comments.id(req.params.commentId) != null
                    ) {
                        if (
                            req.user._id !=
                            dish.comments.id(req.params.commentId).author._id
                        ) {
                            res.statusCode = 403;
                            res.end(
                                "You are not authorized to perform this operation!"
                            );
                        }
                        dish.comments.id(req.params.commentId).remove();
                        dish.save().then(
                            (dish) => {
                                Dishes.findById(dish._id)
                                    .populate("comments.author")
                                    .then((dish) => {
                                        res.statusCode = 200;
                                        res.setHeader(
                                            "Content-Type",
                                            "application/json"
                                        );
                                        res.json(dish);
                                    });
                            },
                            (err) => next(err)
                        );
                    } else if (dish == null) {
                        err = new Error(
                            "Dish " + req.params.dishId + " not found"
                        );
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error(
                            "Comment " + req.params.commentId + " not found"
                        );
                        err.status = 404;
                        return next(err);
                    }
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    });

module.exports = dishRouter;

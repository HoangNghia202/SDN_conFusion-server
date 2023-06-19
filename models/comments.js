const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentSchema = new Schema(
    {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            require: true,
        },
        comment: {
            type: String,
            require: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

var Comments = mongoose.model("Comment", commentSchema);
module.exports = { Comments, commentSchema };

const mongoose = require("mongoose");
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;
const Schema = mongoose.Schema;
const { commentSchema } = require("./comments");
const dishSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
            unique: true,
        },
        description: {
            type: String,
            require: true,
        },
        image: {
            type: String,
            require: true,
        },
        category: {
            type: String,
            require: true,
        },
        label: {
            type: String,
            default: "",
        },
        price: {
            type: Currency,
            require: true,
            min: 0,
        },
        feature: {
            type: Boolean,
            default: false,
        },

        comments: [commentSchema],
    },
    {
        timestamps: true,
    }
);

var Dishes = mongoose.model("Dish", dishSchema);
module.exports = Dishes;

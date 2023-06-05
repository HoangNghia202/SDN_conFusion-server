const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promotionSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
            unique: true,
        },
        image: {
            type: String,
            require: true,
        },
        label: {
            type: String,
            require: true,
            default: "",
        },
        description: {
            type: String,
            require: true,
            default: "",
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Promotions = mongoose.model("Promotion", promotionSchema);
module.exports = Promotions;

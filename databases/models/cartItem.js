const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    product_id : {
        type : String,
        required : true
    },
    img : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    quantity : {
        type : Number,
        default : 1
    },
    userId : {
        type : String,
        required : true
    }

},
{
    timestamps : true
});

const cartItemModel =  mongoose.model('cartItem',cartItemSchema);

module.exports = cartItemModel;


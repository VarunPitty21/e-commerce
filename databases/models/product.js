const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
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
    stock : {
        type : Number,
        default : 1
    },
},
{
    timestamps : true
});

const productModel =  mongoose.model('products',productSchema);

module.exports = productModel;


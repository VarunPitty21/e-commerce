module.exports.init = function(){
    const mongoose = require('mongoose');
    mongoose.connect("mongodb+srv://todoApp:1234567890@cluster0.pepha.mongodb.net/ecommerce?retryWrites=true&w=majority")
    .then(function(){
        console.log("db is live");
    })
    .catch(function(){
        console.log("Internal Server Error");
    })
}
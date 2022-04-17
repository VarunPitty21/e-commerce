const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports.userRoleEnums = {
    admin : 1,
    customer : 2
}

const userSchema = new Schema({

    username : 
    {
        type : String,
        required : true
    },

    password :
    {
        type : String,
        required : true
    },

    email :
    {
        type : String,
        required : true
    },

    profile_picture :
    {
        type : String,
        required : true
    },
    
    isVerified :
    {
        type : Boolean,
        required : true
    },

    userType :
    {
        type : Number,
        required : true
    }

},
{
    timestamps : true
});

const userModel =  mongoose.model('user',userSchema);

module.exports.model = userModel;


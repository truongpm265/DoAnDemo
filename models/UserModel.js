var mongoose = require('mongoose');
var UserSchema = mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            require: true,
        },
        password: {
            type: String,
            require: true,
        },
        role: {
            type: String,
        },
        address: {
            type: String
        }
    }
);
var UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
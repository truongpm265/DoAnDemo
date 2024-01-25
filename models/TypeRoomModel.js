var mongoose = require('mongoose');

var TypeRoomSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        description: {
            type: String,
        },
    }
);
var TypeRoomModel = mongoose.model("typerooms", TypeRoomSchema);
module.exports = TypeRoomModel;
var mongoose = require('mongoose');

var RoomSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        typeRoom: {           //"category"    : name of reference field
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'typerooms'  //"categories"  : name of reference collection
        },
        price:{
            type: Number,
            min: [0, 'price can not be negative']
        },
        quantity:{
            type: Number,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        }
    }
)
var RoomModel = mongoose.model("rooms", RoomSchema);
module.exports = RoomModel;
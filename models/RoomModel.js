var mongoose = require('mongoose');

var RoomSchema = mongoose.Schema(
    {
        roomNumber:{
            type: String,
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        typeRoom: {           //"category"    : name of reference field
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'typerooms'  //"categories"  : name of reference collection
        },
        description: {
            type: String,
        },
        image:[],
        availability: {
            type: Boolean,
            default: true,
        },
        pricePerNight:{
            type: Number,
        }
    }
)
var RoomModel = mongoose.model("rooms", RoomSchema);
module.exports = RoomModel;
var mongoose = require('mongoose');

var ReservationSchema = mongoose.Schema(
    {
        room: {        
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'rooms' 
        },
        user: {          
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'users' 
        },
        checkInDate:{
            type: Date,
        },
        checkOutDate:{
            type: Date,
        },
        totalPrice: {
            type: String,
        },
    }
)
var ReservationModel = mongoose.model("reservations", ReservationSchema);
module.exports = ReservationModel;
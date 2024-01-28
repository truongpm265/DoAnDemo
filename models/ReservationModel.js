var mongoose = require('mongoose');

var ReservationSchema = mongoose.Schema(
    {
        roomId: {        
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'rooms' 
        },
        userId: {          
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
            type: Number,
        },
    }
)
var ReservationModel = mongoose.model("reservations", ReservationSchema);
module.exports = ReservationModel;
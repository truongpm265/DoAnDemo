var express = require('express');
var router = express.Router();
var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');
var ReservationModel = require('../models/ReservationModel')


router.get('/',async (req, res) => {
    var reservationList = await ReservationModel.find({}).populate('roomId');
       res.render('reservation/index', { reservationList })
 
 });
router.get('/add', async(req, res)=>{
    var roomList = await RoomModel.find({});
    var typeRoomList = await TypeRoomModel.find({});
    res.render('reservation/add', { roomList,typeRoomList});
 });
 router.post('/add', async(req,res) =>{
       var reservation = req.body;
       await ReservationModel.create(reservation);
       res.redirect('/reservation') ;
 });

module.exports = router;

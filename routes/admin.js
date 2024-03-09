var express = require('express');
var router = express.Router();
const checkLoginSession = require('../middlewares/auth');
var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');
const ContactModel = require('../models/ContactModel');
var ReservationModel = require('../models/ReservationModel');


router.get('/', checkLoginSession, async (req, res) => {
    var reservationList = await ReservationModel.find({}).populate('room').populate('user');
    var contactList = await ContactModel.find({});
    var roomList = await RoomModel.find({}).populate('typeRoom');
    res.render('dashboard', { reservationList, contactList, roomList, layout: 'template_layout' });
});
router.get('/manageRoom', async (req, res) => {
    var roomList = await RoomModel.find({}).populate('typeRoom');
    res.render('room/manageRoom', { roomList, layout: 'template_layout' });
});
router.get('/manageTypeRoom', async (req, res) => {
    var typeRoomList = await TypeRoomModel.find({});
    res.render('typeRoom/manageTypeRoom', { typeRoomList, layout: 'template_layout' });
});
router.get('/manageReservation', checkLoginSession, async (req, res) => {
    var reservationList = await ReservationModel.find({}).populate('room').populate('user');
    res.render('reservation/manageReservation', { reservationList, layout: 'template_layout' });
});
router.get('/manageContact', checkLoginSession, async (req, res) => {
    var contactList = await ContactModel.find({});
    res.render('contactList', { contactList, layout: 'template_layout' });
});
module.exports = router;

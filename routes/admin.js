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
    res.render('admin/dashboard', { reservationList, contactList, roomList, layout: 'template_layout' });
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
router.get('/confirm/:id', async (req, res) => {
    
    var id = req.params.id;
    var status = "Confirm";
    await ReservationModel.findByIdAndUpdate(id, { status: status });
    var reservation = await ReservationModel.findById(id);
    var today = new Date();
    var checkOutDate = new Date(reservation.checkOutDate);
    if (today > checkOutDate) {
        await RoomModel.findByIdAndUpdate(reservation.room, { availability: true})
    }else {
        await RoomModel.findByIdAndUpdate(reservation.room, { availability: false})
    }
    res.redirect('/reservation/manageReservation');
 });
 router.get('/cancel/:id', async (req, res) => {
    var id = req.params.id;
    var status = "Cancel";
    await ReservationModel.findByIdAndUpdate(id, { status: status });
    var reservation = await ReservationModel.findById(id);
    await RoomModel.findByIdAndUpdate(reservation.room, { availability: true})
    res.redirect('/reservation/manageReservation');
 });
router.get('/manageContact', checkLoginSession, async (req, res) => {
    var contactList = await ContactModel.find({});
    res.render('admin/contactList', { contactList, layout: 'template_layout' });
});


module.exports = router;

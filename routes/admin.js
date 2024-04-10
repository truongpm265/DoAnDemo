var express = require('express');
var router = express.Router();

var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');
const ContactModel = require('../models/ContactModel');
var ReservationModel = require('../models/ReservationModel');
const {checkAdminSession,checkLoginSession} = require('../middlewares/auth');

router.get('/', checkAdminSession, async (req, res) => {
    var reservationList = await ReservationModel.find({}).populate('room').populate('user');
    var contactList = await ContactModel.find({});
    var roomList = await RoomModel.find({}).populate('typeRoom');
    var cancelReservation = await ReservationModel.find({status: "Cancel"});
    var pendingReservation = await ReservationModel.find({status: "Pending"});
    var confirmReservation = await ReservationModel.find({status: "Confirm"});
    res.render('admin/dashboard', { reservationList, contactList,cancelReservation,pendingReservation, confirmReservation, roomList, layout: 'admin_layout' });
});
router.get('/manageRoom',checkAdminSession, async (req, res) => {
    var roomList = await RoomModel.find({}).populate('typeRoom');
    var typeRoomList = await TypeRoomModel.find({});
    res.render('room/manageRoom', { roomList,typeRoomList, layout: 'admin_layout' });
});
router.get('/manageTypeRoom', checkAdminSession, async (req, res) => {
    var typeRoomList = await TypeRoomModel.find({});
    res.render('typeRoom/manageTypeRoom', { typeRoomList, layout: 'admin_layout' });
});
router.get('/manageReservation', checkAdminSession, async (req, res) => {
    var reservationList = await ReservationModel.find({}).populate('room').populate('user');
    res.render('reservation/manageReservation', { reservationList, layout: 'admin_layout' });
});
router.get('/confirm/:id', checkAdminSession, async (req, res) => {
    
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
    res.redirect('/admin/manageReservation');
 });
 router.get('/cancel/:id', checkAdminSession, async (req, res) => {
    var id = req.params.id;
    var status = "Cancel";
    await ReservationModel.findByIdAndUpdate(id, { status: status });
    var reservation = await ReservationModel.findById(id);
    await RoomModel.findByIdAndUpdate(reservation.room, { availability: true})
    res.redirect('/admin/manageReservation');
 });
router.get('/manageContact', checkAdminSession, async (req, res) => {
    var contactList = await ContactModel.find({});
    res.render('admin/contactList', { contactList, layout: 'template_layout' });
});


module.exports = router;

var express = require('express');
var router = express.Router();
var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');
var ReservationModel = require('../models/ReservationModel');
const checkLoginSession = require('../middlewares/auth');
const CustomerModel = require('../models/CustomerModel');
const UserModel = require('../models/UserModel');
const { body, validationResult } = require('express-validator');


router.get('/',checkLoginSession, async (req, res) => {
    var reservationList = await ReservationModel.find({}).populate('room').populate('user');
    res.render('reservation/index', { reservationList })
});
router.get('/user',checkLoginSession, async (req, res) => {
    const reservations = await ReservationModel.find({ user: req.session.userId }).populate('room').populate('user');
    res.render('reservation/indexUser', { reservations, layout: 'user_layout' });
});
router.get('/user/add', async (req, res) => {
    const userId = req.session.userId; // Assuming the user ID is stored in req.session.userId
    const user = await UserModel.findById(userId);
    const rooms = await RoomModel.find({});
    res.render('reservation/addUser', { rooms, user, layout: 'user_layout' });
});
router.post('/user/add', [
    body('checkInDate')
        .isDate().withMessage('Check-in date is not valid.')
        .custom((value) => {
            const checkInDate = new Date(value);
            const today = new Date();
            if (checkInDate < today) {
                throw new Error('Check-in date cannot be in the past.');
            }
            return true;
        }),
    body('checkOutDate').isDate().withMessage('Check-out date is not valid.')
        .custom((value, { req }) => {
            const checkOutDate = new Date(value);
            const checkInDate = new Date(req.body.checkInDate);
            if (checkOutDate < checkInDate) {
                throw new Error('Check-out date cannot be before Check-in date.');
            }
            return true;
        }),

], async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        const rooms = await RoomModel.find({});
        res.render('reservation/addUser', {
            title: 'Add Reservation',
            reservation: req.body,
            rooms,
            errors: errors.array()
        });
        return;
    }
    const user = await UserModel.findById(req.session.userId);
    if (!user) {
        res.render('reservation/addUser', {
            title: 'Add Reservation',
            reservation: req.body,
            rooms,
            errors: [{ msg: 'User does not exist.' }]
        });
        return;
    }

    const { rooms, checkInDate, checkOutDate } = req.body;
    const userId = req.session.userId;
    const room = await RoomModel.findById(rooms);
    var totalPrice = calculateTotalPrice(room.pricePerNight, checkInDate, checkOutDate);
    const reservation = new ReservationModel({
        room: rooms,
        user: userId,
        checkInDate,
        checkOutDate,
        totalPrice,
    });
    await reservation.save();
    res.redirect('/reservation/user');
});


router.get('/add', async (req, res) => {
    roomId = req.query.roomId;
    const room = await RoomModel.findById(roomId);
    roomName = room.name;
    roomPrice = room.pricePerNight;

    res.render('reservation/add', { roomId, roomName,roomPrice});
});
router.post('/add', async (req, res) => {
    const { checkInDate, checkOutDate } = req.body;
    const roomId = req.query.roomId;
    const userId = req.session.userId;
    const room = await RoomModel.findById(roomId);
    const pricePerNight = room.pricePerNight;
    var totalPrice = calculateTotalPrice(pricePerNight, checkInDate, checkOutDate);
    const reservation = new ReservationModel({
        room: roomId,
        user: userId,
        checkInDate,
        checkOutDate,
        totalPrice,
    });
    await reservation.save();
    res.redirect('/reservation');
});
router.get('/confirmReservation', function (req, res, next) {
    // Render the confirmation page with the reservation data
    const rooms = RoomModel.find({});
    res.render('reservation/confirmReservation', {
        title: 'Confirm Reservation',
        reservation: req.session.reservation,rooms // Assuming the reservation data is stored in the session
    });
});
router.post('/confirmReservation', async function (req, res, next) {
    // Save reservation
    const reservation = new ReservationModel(req.session.reservation);
    await reservation.save();

    // Clear reservation from session
    delete req.session.reservation;

    // Redirect to reservations page
    res.redirect('/reservation');
});
router.get('/addReservation', async (req, res) => {
    const roomId = req.query.roomId;
    const userId = req.session.userId; // Assuming the user ID is stored in req.session.userId
    const user = await UserModel.findById(userId);
    const rooms = await RoomModel.find({});
    res.render('reservation/addReservation', { rooms, user,roomId, layout: 'user_layout' });
});
router.post('/addReservation',
    [
        body('checkInDate')
            .isDate().withMessage('Check-in date is not valid.')
            .custom((value) => {
                const checkInDate = new Date(value);
                const today = new Date();
                if (checkInDate < today) {
                    throw new Error('Check-in date cannot be in the past.');
                }
                return true;
            }),
        body('checkOutDate').isDate().withMessage('Check-out date is not valid.')
            .custom((value, { req }) => {
                const checkOutDate = new Date(value);
                const checkInDate = new Date(req.body.checkInDate);
                if (checkOutDate < checkInDate) {
                    throw new Error('Check-out date cannot be before Check-in date.');
                }
                return true;
            }),

    ], async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            const rooms = await RoomModel.find({});
            res.render('reservation/addReservation', {
                title: 'Add Reservation',
                reservation: req.body,
                rooms,
                errors: errors.array()
            });
            return;
        }
        const user = await UserModel.findById(req.session.userId);
        if (!user) {
            res.render('reservation/addUser', {
                title: 'Add Reservation',
                reservation: req.body,
                rooms,
                errors: [{ msg: 'User does not exist.' }]
            });
            return;
        }
        req.session.reservation = {
            room: req.query.roomId,
            user: req.session.userId, 
            checkInDate: req.body.checkInDate,
            checkOutDate: req.body.checkOutDate,
        };
        res.redirect('/reservation/confirmReservation');
    });

function calculateTotalPrice(pricePerNight, checkInDate, checkOutDate) {
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); //do kết quả của phép tính là sự khác nhau giữa 2 ngày tính bằng mili giây nên phải chia cho số mili giây 1 ngày
    return pricePerNight * nights;
}


module.exports = router;

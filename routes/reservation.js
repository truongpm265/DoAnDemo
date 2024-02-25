var express = require('express');
var router = express.Router();
var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');
var ReservationModel = require('../models/ReservationModel');
const CustomerModel = require('../models/CustomerModel');
const UserModel = require('../models/UserModel');
const { body, validationResult } = require('express-validator');


router.get('/', async (req, res) => {
    var reservationList = await ReservationModel.find({}).populate('room').populate('user');
    res.render('reservation/index', { reservationList })
});
router.get('/user', async (req, res) => {
    toShortDate();
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
    var roomList = await RoomModel.find({});
    res.render('reservation/add', { roomList });
});
router.post('/add', async (req, res) => {
    const { rooms, customers, checkInDate, checkOutDate } = req.body;

    const room = await RoomModel.findById(rooms);
    var totalPrice = calculateTotalPrice(room.pricePerNight, checkInDate, checkOutDate);
    const reservation = new ReservationModel({
        room: rooms,
        customer: customers,
        checkInDate,
        checkOutDate,
        totalPrice,
    });
    await reservation.save();
    res.redirect('/reservation');
});
function calculateTotalPrice(pricePerNight, checkInDate, checkOutDate) {
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); //do kết quả của phép tính là sự khác nhau giữa 2 ngày tính bằng mili giây nên phải chia cho số mili giây 1 ngày
    return pricePerNight * nights;
}
function toShortDate(isoDate) {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
    const day = date.getDate();

    return `${day}/${month}/${year}`;
}

module.exports = router;

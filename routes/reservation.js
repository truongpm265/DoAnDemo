var express = require('express');
var router = express.Router();
var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');
var ReservationModel = require('../models/ReservationModel');
const { checkLoginSession } = require('../middlewares/auth');
const UserModel = require('../models/UserModel');
const { body, validationResult } = require('express-validator');


router.get('/user', checkLoginSession, async (req, res) => {
    const reservations = await ReservationModel.find({ user: req.session.userId }).populate('room').populate('user');
    res.render('reservation/indexUser', { reservations, layout: 'template_layout' });
});

router.get('/add', async (req, res) => {
    roomId = req.query.roomId;
    const room = await RoomModel.findById(roomId);
    roomName = room.name;
    roomPrice = room.pricePerNight;
    roomImage = room.image;
    res.render('reservation/addReservation', { roomId, roomName, roomPrice, roomImage, layout: 'template_layout' });
});
router.post('/add',
    [

        body('roomId').custom(async () => {
            const room = await RoomModel.findById(roomId);
            if (!room) {
                throw new Error('Room does not exist.');
            }
            if (!room.availability) {
                throw new Error('Room is not available.');
            }
            return true;
        }),
        body('userId').custom((value, { req }) => {
            if (!req.session.userId) {
                throw new Error('No user logged in. Please login');
            }
            return true;
        }),
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
                if (checkOutDate <= checkInDate) {
                    throw new Error('Check-out date cannot be before Check-in date.');
                }
                return true;
            }),

    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            const roomId = req.query.roomId;
            const room = await RoomModel.findById(roomId);
            const roomName = room.name;
            const roomPrice = room.pricePerNight;
            const roomImage = room.image;


            res.render('reservation/addReservation', {
                title: 'Add Reservation',
                layout: 'template_layout',
                reservation: req.body,
                rooms: room,
                roomName: roomName,
                roomPrice: roomPrice,
                roomImage: roomImage,
                status: "Pending",
                errors: errors.array()
            });
            return;
        }


        const { checkInDate, checkOutDate } = req.body;
        const roomId = req.query.roomId;
        const userId = req.session.userId;
        const room = await RoomModel.findById(roomId);
        roomName = room.name;
        roomPrice = room.pricePerNight;
        const pricePerNight = room.pricePerNight;
        var totalPrice = calculateTotalPrice(pricePerNight, checkInDate, checkOutDate);
        req.session.reservation = {
            room: roomId,
            user: userId,
            checkInDate: req.body.checkInDate,
            checkOutDate: req.body.checkOutDate,
            totalPrice: totalPrice,
            status: "Pending",
        };
        // await reservation.save();
        res.redirect('/reservation/confirmReservation');

    });


router.get('/confirmReservation', async function (req, res, next) {
    // Render the confirmation page with the reservation data

    res.render('reservation/confirmReservation', {
        title: 'Confirm Reservation',
        reservation: req.session.reservation, // Assuming the reservation data is stored in the session
    });
});
router.post('/confirmReservation', async function (req, res, next) {
    // Update room availability
    const roomId = req.session.reservation.room;
    const room = await RoomModel.findById(roomId);
    room.availability = false;
    await room.save();
    // Save reservation
    const reservation = new ReservationModel(req.session.reservation);
    await reservation.save();

    // Clear reservation from session
    //delete req.session.reservation;

    // Redirect to reservations page
    // res.redirect('/test');
    res.redirect('/reservation/create_payment_url');
});
router.get('/create_payment_url', async function (req, res, next) {
    roomId = req.session.reservation.room;
    var room = await RoomModel.findById(roomId);
    var roomName = room.name;
    var roomPrice = room.pricePerNight;
    var des = 'Thanh toan phong nghi ' + roomName + ' voi gia ' + req.session.reservation.totalPrice + ' VND';
    res.render('order', { reservation: req.session.reservation, roomName, roomPrice, des, layout: 'template_layout' })
});

router.post('/create_payment_url', async function (req, res, next) {
    var ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;




    const room = await RoomModel.findById(req.session.reservation.room);

    var tmnCode = 'T9TJG1NH';
    var secretKey = 'PVURTHUFKBJQLMHUVOVYNQSRPMXOXVXE';
    var vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    // var returnUrl = 'http://localhost:3000/reservation/user';
    var returnUrl = 'https://beehouse-df9t.onrender.com/reservation/user';

    var date = new Date();
    var createDate = dateFormat(date, 'yyyymmddHHmmss');

    var orderId = dateFormat(date, 'yyyymmddHHmmss');

    var amount = req.session.reservation.totalPrice;
    var bankCode = 'NCB';

    var orderInfo = req.session.reservation.user + ' Thanh toan phong nghi ' + room.name + ' voi gia ' + req.session.reservation.totalPrice + ' VND';
    var orderType = 'Thanh toan phong tai BeeHouse';

    var locale = req.body.language;
    if (locale === null || locale === '') {
        locale = 'vn';
    }

    var currCode = 'VND';
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    var querystring = require('qs');
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl)

});



function calculateTotalPrice(pricePerNight, checkInDate, checkOutDate) {
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); //do kết quả của phép tính là sự khác nhau giữa 2 ngày tính bằng mili giây nên phải chia cho số mili giây 1 ngày
    return pricePerNight * nights;
}
function sortObject(obj) {
    var sorted = {};
    var str = [];
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
function dateFormat(date, format) {
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    var seconds = ("0" + date.getSeconds()).slice(-2);

    format = format.replace("yyyy", year);
    format = format.replace("mm", month);
    format = format.replace("dd", day);
    format = format.replace("HH", hours);
    format = format.replace("mm", minutes);
    format = format.replace("ss", seconds);

    return format;
}

module.exports = router;

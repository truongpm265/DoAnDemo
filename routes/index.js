var express = require('express');
var router = express.Router();
const checkLoginSession = require('../middlewares/auth');
var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');
const ContactModel = require('../models/ContactModel');
var ReservationModel = require('../models/ReservationModel');
const nodemailer = require('nodemailer');



router.get('/', async function (req, res) {
  var roomList = await RoomModel.find({}).populate('typeRoom');
      res.render ('HomePage', { layout: 'template_layout',roomList  });
});




module.exports = router;

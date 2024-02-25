var express = require('express');
var router = express.Router();
const checkLoginSession = require('../middlewares/auth');
var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');
const ContactModel = require('../models/ContactModel');

router.get('/', async function (req, res) {
  var roomList = await RoomModel.find({}).populate('typeRoom');
      res.render ('userHome', { layout: 'user_layout',roomList  });
});

router.get('/admin', (req, res) => {
  res.render('admin');
})

router.get('/user', (req, res) => {
  res.render('user', { layout: 'user_layout' });
})


router.get('/contact', function (req, res, next) {
  res.render('contact', { layout: 'user_layout' });
});
router.post('/contact', async function(req, res, next) {
  const contact = new ContactModel({
    name: req.body.name,
    email: req.body.email,
    numberphone: req.body.numberphone,
    message: req.body.message
  });
  try {
    await contact.save();
    console.log('Contact saved');
  } catch (err) {
    console.error('Could not save contact', err);
  }

  res.redirect('/room/user');
});
module.exports = router;

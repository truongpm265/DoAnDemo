var express = require('express');
var router = express.Router();
const checkLoginSession = require('../middlewares/auth');
var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');
const ContactModel = require('../models/ContactModel');
const nodemailer = require('nodemailer');

router.get('/', async function (req, res) {
  var roomList = await RoomModel.find({}).populate('typeRoom');
      res.render ('userHome', { layout: 'user_layout',roomList  });
});

router.get('/test', async function (req, res) {
  var roomList = await RoomModel.find({}).populate('typeRoom');
      res.render ('HomePage', { layout: 'template_layout',roomList  });
});

router.get('/admin', (req, res) => {
  res.render('admin',{ layout: 'admin_layout' });
})

router.get('/user', (req, res) => {
  res.render('user', { layout: 'user_layout' });
})


router.get('/contact', function (req, res, next) {
  res.render('contact', { layout: 'user_layout' });
});
// ...

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
    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'truongsot@gmail.com',
        pass: 'wfffzkwtkxbhamhc',
      }
    });

    const mailOptions = {
      from:'truongsot@gmail.com',
      to: req.body.email,
      subject: 'Bee House - Contact Us',
      text: `Thanks ${req.body.name} for contact for Bee House with message: ${req.body.message}.\n We will contact you as soon as possible via phone number: ${req.body.numberphone}`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.error('Could not send email', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

  } catch (err) {
    console.error('Could not save contact', err);
  }

  res.redirect('/test');
});


module.exports = router;

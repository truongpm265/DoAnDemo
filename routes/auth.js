var express = require('express')
var router = express.Router()
var UserModel = require('../models/UserModel');

//import "bcryptjs" library
var bcrypt = require('bcryptjs');
var salt = 8;                     //random value

router.get('/register', (req, res) => {
   res.render('auth/register', { layout: 'auth_layout' })
});

router.post('/register', async (req, res) => {
   try {
      var userRegistration = req.body;
      if (userRegistration.password === userRegistration.retype) {
         var hashPassword = bcrypt.hashSync(userRegistration.password, salt);
         var user = {
            username: userRegistration.username,
            password: hashPassword,
            role: 'user'
         }
         await UserModel.create(user);
         res.redirect('/auth/login')
      } else {
         res.render('auth/register', { layout: 'auth_layout', error: 'Password and retype do not match' });
      }
   } catch (err) {
      res.send(err)
   }
})

router.get('/login', (req, res) => {
   res.render('auth/login', { layout: 'auth_layout' })
})

router.post('/login', async (req, res) => {
   try {
      var userLogin = req.body;
      var user = await UserModel.findOne({ username: userLogin.username })
      if (user) {
         var hash = bcrypt.compareSync(userLogin.password, user.password)
         if (hash) {
            //initialize session after login success
            req.session.username = user.username;
            req.session.role = user.role;
            req.session.userId = user._id;
            if (user.role == 'admin') {
               res.redirect('/admin');
            }
            else {
               res.redirect('/');
            }
         }
         else {
            res.render('auth/login', { layout: 'auth_layout', error: 'Invalid username or password' });
         }
      } else {
         res.render('auth/login', { layout: 'auth_layout', error: 'Invalid username or password' });
      }
   } catch (err) {
      res.send(err)
   }
});

router.get('/logout', (req, res) => {
   req.session.destroy();
   res.redirect("/auth/login");
});

module.exports = router
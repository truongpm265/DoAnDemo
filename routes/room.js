var express = require('express');
var router = express.Router();
var RoomModel = require('../models/RoomModel');
var TypeRoomModel = require('../models/TypeRoomModel');


router.get('/',async (req, res) => {
   var roomList = await RoomModel.find({}).populate('typeRoom');
      res.render('userHome', { roomList })
});
router.get('/user/',async (req, res) => {
   var roomList = await RoomModel.find({}).populate('typeRoom');
      res.render('userHome', { layout: 'user_layout',roomList  },)
});
router.get('/room', async(req,res)=>{
   var roomList = await RoomModel.find({}).populate('typeRoom');
   res.render('room/index', { roomList, layout: 'admin_layout'});
});

router.get('/add', async(req, res)=>{
   var typeRoomList = await TypeRoomModel.find({});
   res.render('room/add', { typeRoomList });
});
router.post('/add', async(req,res) =>{
      var room = req.body;
      await RoomModel.create(room);
      res.redirect('/room');
});

router.get('/edit/:id', async(req,res)=>{
   var id = req.params.id;
   var typeRoomList = await TypeRoomModel.find({});
   var room = await RoomModel.findById(id);
   res.render('room/edit', { typeRoomList, room });
});
router.post('/edit/:id', async(req,res)=>{
   var id = req.params.id;
   var data = req.body;
   await RoomModel.findByIdAndUpdate(id, data);
   res.redirect('/room');
});
router.get('/delete/:id', async (req, res) => {
   var id = req.params.id;
   await RoomModel.findByIdAndDelete(id);
   res.redirect('/room');
});
router.get('/detail/:id', async(req, res) => {
   var id = req.params.id;
   var typeRoomList = await TypeRoomModel.find({});
   var room = await RoomModel.findById(id).populate('typeRoom');
   res.render('room/info', { typeRoomList, room, layout: 'user_layout'});
});
module.exports = router;
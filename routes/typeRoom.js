var express = require('express');
var router = express.Router();
var TypeRoomModel = require('../models/TypeRoomModel');
const RoomModel = require('../models/RoomModel');


router.get('/', async(req,res)=>{
   var typeRoomList = await TypeRoomModel.find({});
   res.render('typeRoom/index', { typeRoomList, })
});

router.get('/add', async(req, res)=>{
   res.render('typeRoom/add');
});
router.post('/add', async(req,res) =>{
      var typeRoom = req.body;
      await TypeRoomModel.create(typeRoom);
      res.redirect('/typeRoom');
});

router.get('/edit/:id', async(req,res)=>{
   var id = req.params.id;
   var typeRoom = await TypeRoomModel.findById(id);
   res.render('typeRoom/edit', { typeRoom });
});
router.post('/edit/:id', async (req, res) => {
    var id = req.params.id;
    var data = req.body;
    await TypeRoomModel.findByIdAndUpdate(id, data);
    res.redirect('/typeRoom');
 });

 router.get('/detail/:id', async (req, res) => {
    var id = req.params.id;
    var roomList = await RoomModel.find({ typeRoom: id }).populate('typeRoom');
    res.render('room/index', { roomList })
 });
 router.get('/delete/:id', async (req, res) => {
   var id = req.params.id;
   await TypeRoomModel.findByIdAndDelete(id);
   res.redirect('/typeRoom');
});
module.exports = router;
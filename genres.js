const express = require('express');
const router = express();
const Joi = require('joi');
const mongoose = require('mongoose');
const auth = require('./middlewears/auth');
const admin= require('./middlewears/admin');

// Ctrl+K,C for comments
const genreSchema = mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
    },
    _id: {
        type: mongoose.Schema.Types.ObjectId
    }
})

const Genre = mongoose.model('Genre', genreSchema);

function asyncMiddlewear (handler){
    return async (req, res, next)=>{
        try{
            await handler(req, res);
        }
        catch(err){
            next(err);
        }
    }
}

router.get('/', asyncMiddlewear(async (req, res)=>{
    const genres = await Genre.find()
                             .select('name id');
    res.send(genres);
}))

//get specific genre by id
router.get('/:id',  async (req, res)=>{
    const genres = await Genre.find()
                             .select('name id');
    let id = req.params.id;
    const index = genres.findIndex(g => g._id.toString() === id);
    res.send(genres[index]);
});

//post new genre by name
router.post('/', auth, async (req, res)=>{
    const schema = {
        name: Joi.string().min(3).required()
    };
    const result = Joi.validate(req.body, schema);
    if(result.error){
        console.log(result.error);
    }
    const genre = new Genre({
        name: req.body.name
    });
        try{
        res.send(await genre.save());
    }
    catch(err){
        console.log('error saving in db: ', err.message);
    }
})

//put new genre's id by name (modify)
router.put('/:id', async (req,res)=>{
    const genres = await Genre.find()
                             .select('name id');
    let id = req.params.id;
    const index = genres.findIndex(g => g._id.toString() === id);
    const result = await Genre.findByIdAndUpdate(id, {
        $set: {
            name: req.body.name
        }
    }, {new: true})
        try{
        res.send(result);
    }
    catch(err){
        console.log('error saving in db: ', err.message);
}})

//delete new genre by name
router.delete('/:id', [auth, admin], async (req, res)=>{
    const genres = await Genre.find()
                             .select('name id');
    let id = req.params.id;
    const result = await Genre.findByIdAndDelete(id);
    res.send(result);
});

module.exports.router = router;
module.exports.genreSchema = genreSchema;
module.exports.Genre = Genre;
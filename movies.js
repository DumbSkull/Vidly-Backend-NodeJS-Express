const express = require('express');
const router = express();
const Joi = require('joi');
const mongoose = require('mongoose');
const genres = require('./genres.js');
const genreSchema = genres.genreSchema;

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    genre: {type: Array},
    numberInStock: {
        type: Number,
        default: 0
    },
    dailyRentalRate: {
        type: Number,
        default: 0
    }
})

const Genre = mongoose.model('Genre', genreSchema);

const Movie = mongoose.model('Movie', movieSchema);

router.get('/', async (req, res)=>{
    const movies = await Movie.find()
                             .select('title genre dailyRentalRate numberInStock');
    res.send(movies);
})

//get specific genre by id
router.get('/:id', async (req, res)=>{
    const movies = await Movie.find()
                             .select('title genre');
    let id = req.params.id;
    const index = movies.findIndex(g => g._id.toString() === id);
    res.send(movies[index]);
});

//post new movie by name
router.post('/', async (req, res)=>{
    const schema = {
        title: Joi.string().min(3).required(),
        genreId: Joi.array()
    };
    
    const result = Joi.validate(req.body, schema);
    if(result.error){
        console.log(result.error);
    }
    const movie = new Movie({
        title: req.body.title,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    let genre = null;
    for(key in req.body.genreId){
        try{
            genre = await Genre.findById(req.body.genreId[key]);
            movie.genre.push(new Genre({
                name: genre.name,
                _id: genre._id
            }));
            genre = null;
            try{
                res.send(await movie.save());
            }
            catch(err){
                console.log('Error saving in db: ', err.message);
            }
        }
        catch(err){
            console.log('Error:', err.message);
            res.status(400).send('Invalid genre! ');
        }
       
    }
})

//put new genre's id by name (modify)
router.put('/:id', async (req,res)=>{
    const newGenre =[];
    for(key in req.body.genre){
        newGenre.push(new Genre({
            name: req.body.genre[key]}));
    }
    console.log(newGenre);
    console.log('new genre: ', newGenre);
    const result = await Movie.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate
            },
        $push: {
            genre: newGenre
        }
    }, {new: true})
    try{
        res.send(result);
    }
    catch(err){
        console.log('error saving in db: ', err.message);
}})

//delete new genre by name
router.delete('/:id', async (req, res)=>{
    let id = req.params.id;
    const result = await Movie.findByIdAndDelete(id);
    res.send(result);
});

module.exports.router = router;
module.exports.movieSchema = movieSchema;
module.exports.Movie = Movie;
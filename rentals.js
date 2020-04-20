const express = require('express');
const router = express();
const Joi = require('joi');
const mongoose = require('mongoose');
const movies = require('./movies');
const customers = require('./customers');

const customerSchema = customers.customerSchema;
const movieSchema = movies.movieSchema;

const Customer = mongoose.model('Customer', customerSchema);
const Movie = mongoose.model('Movie', movieSchema);

const rentalSchema = new mongoose.Schema({
    customer: {
                    type: new mongoose.Schema({
                    _id: mongoose.Schema.Types.ObjectId,
                    name: {type: String, 
                            required: true},
                    phone: {
                        type: Number, 
                        required: true},
                
                    isGold : {
                        type: Boolean,
                        default: false,
                    }}),
                required: true
        },
    movie: {
        type: new mongoose.Schema({
                    _id: mongoose.Schema.Types.ObjectId,
                    title: {
                        type: String,
                        required: true
                    },
                    dailyRentalRate: {
                        type: Number,
                        default: 0
                    },
        }),
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now()
    },
    endDate: {
        type: Date
    },
    totalRent: {
        type: Number,
        min: 0
    }
});

const Rental = mongoose.model('Rental', rentalSchema);

//get all rentals
router.get('/', async (req, res)=>{
    const rentals = await Rental.find()
                                .sort('-startDate')
                             .select('id customer movie');
    res.send(rentals);
})

//get specific rental by id
router.get('/:id', async (req, res)=>{
    const rentals = await Rental.find()
                             .select('id customer movie');
    let id = req.params.id;
    const index = rentals.findIndex(g => g._id.toString() === id);
    res.send(rentals[index]);
});

//post new rental
router.post('/', async (req, res)=>{
    const schema = {
        customerId: Joi.string().required(),
        movieId: Joi.string().required()
    };
    const result = Joi.validate(req.body, schema);
    if(result.error){
        console.log(result.error);
    }
    try{
        const customer = await Customer.findById(req.body.customerId);
        console.log('customer: ', customer);
        const movie = await Movie.findById(req.body.movieId);
        console.log('movie: ', movie);

        const rental = new Rental({
            customer: {
                    name: customer.name,
                    _id: customer._id,
                    phone: customer.phone,
                    isGold: customer.isGold
            },
            movie: {
                    title: movie.title,
                    _id: movie._id,
                    dailyRentalRate: movie.dailyRentalRate
            },
            startDate: Date.now()
        });
        console.log('rental:', rental);
        res.send(await rental.save());
        try{
            const result = await Movie.findByIdAndUpdate(movie._id, {
                $inc: {
                    numberInStock: -1
                }
        })
        }
        catch(err){
            console.log('Error updating stock number: ', err.message);
        }
    }
    catch(err){
        res.status(400).send(err.message);
    }
});

module.exports.router = router;

module.exports.Rental = Rental;
// const rentalSchema = new mongoose.Schema({
//     customer: {
//                     type: new mongoose.Schema({
//                     _id: mongoose.Schema.Types.ObjectId,
//                     name: {type: String, 
//                             required: true},
//                     phone: {
//                         type: Number, 
//                         required: true},
                
//                     isGold : {
//                         type: Boolean,
//                         default: false,
//                     }}),
//                 required: true
//         },
//     movie: {
//         type: new mongoose.Schema({
//                     _id: mongoose.Schema.Types.ObjectId,
//                     title: {
//                         type: String,
//                         required: true
//                     },
//                     dailyRentalRate: {
//                         type: Number,
//                         default: 0
//                     },
//         }),
//         required: true
//     },
//     startDate: {
//         type: Date,
//         default: Date.now()
//     },
//     endDate: {
//         type: Date
//     },
//     totalRent: {
//         type: Number,
//         min: 0
//     }
// });

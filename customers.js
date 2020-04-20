const mongoose = require('mongoose');
const express = require('express');
const router = express();
const Joi = require('joi');

const customerSchema = mongoose.Schema({
    name: {type: String, 
            required: true},
    phone: {
        type: Number, 
        required: true},

    isGold : {
        type: Boolean,
        default: false,
    }}
);

const Customer = mongoose.model('Customer', customerSchema);

router.get('/', async (req, res)=>{
    const customers = await Customer.find()
                             .select('name phone isGold');
    res.send(customers);
})

//get specific genre by id
router.get('/:id', async (req, res)=>{
    const customers = await Customer.find()
                             .select('name phone isGold');
    console.log(customers);
    console.log(req.params.id)
    let id = req.params.id;
    const index = customers.findIndex(g => g._id.toString() === id);
    res.send(customers[index]);
});

//post new genre by name
router.post('/', async (req, res)=>{
    const schema = {
        name: Joi.string().min(3).required(),
        phone: Joi.number(),
        isGold: Joi.boolean()
    };
    const result = Joi.validate(req.body, schema);
    if(result.error){
        console.log(result.error);
    }
    const customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });
        try{
        res.send(await customer.save());
    }
    catch(err){
        console.log('error saving in db: ', err.message);
    }
})

//put new genre's id by name (modify)
router.put('/:id', async (req,res)=>{
    const customers = await Customer.find()
    .select('name phone isGold');
    let id = req.params.id;
    const index = customers.findIndex(g => g._id.toString() === id);
    const result = await Customer.findByIdAndUpdate(id, {
        $set: {
            name: req.body.name,
            phone: req.body.phone,
            isGold: req.body.isGold
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
    const customers = await Customer.find()
                             .select('name phone isGold');
    let id = req.params.id;
    const result = await Customer.findByIdAndDelete(id);
    res.send(result);
});

module.exports.router = router;
module.exports.customerSchema = customerSchema;
module.exports.Customer = Customer;



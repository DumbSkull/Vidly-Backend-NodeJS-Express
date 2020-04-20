const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('./middlewears/auth');

function validateUser(user){
    const schema = {
        name: Joi.string().min(3).max(55).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(3).max(55).required(),
        isAdmin: Joi.boolean()
    }
    return Joi.validate(user, schema);
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 55
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true, 
        minlength: 3
    },
    isAdmin: {type: Boolean,
        required: true}
});

userSchema.methods.getToken = function(){
    const token = jwt.sign({_id: this._id, email: this.email, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
    return token;
}

module.exports.getToken = userSchema.methods.getToken;

const User = new mongoose.model('User', userSchema);

router.get('/me',  auth, async (req, res)=>{
    const user = await User.findById(req.user._id)
                             .select('-password');
    res.send(user);
});

//register user
router.post('/', async (req, res)=>{
    let result = validateUser(req.body);
    if(result.error)
        return res.status(400).send(result.error.details[0].message);
    result = await User.findOne({email: req.body.email})
    if(result)
        return res.status(400).send('Email already taken! ');

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    
    const user = new User(_.pick(req.body, ['name', 'email', 'isAdmin']));
    user.password = hashedPass;
    try{
        console.log(user);
        const token = user.getToken();
        res.header('x-auth-token', token).send(await user.save());
    }
    catch(err){
        console.log('Error saving in db: ', err.message);
    }
})

module.exports.router = router;
module.exports.user = User;
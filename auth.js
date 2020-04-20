const express = require('express');
const router = express();
const Joi = require('joi');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {user: User} = require('./users');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('./middlewears/auth');

router.post('/', auth, async (req, res)=>{
    const schema = {
        email: Joi.string().min(3).required().email(),
        password: Joi.string().min(3).required()
    };
    const result = Joi.validate(req.body, schema);

    if(result.error)
        return res.status(400).send('Invalid password or email! ');
    
    const user2 = await User.findOne({email: req.body.email})
    console.log('user2', user2);
    console.log('reqbodypw: ', req.body.password);
    const isValidPass = await bcrypt.compare(req.body.password, user2.password);

    const token = user2.getToken();

    if(!isValidPass)
        return res.status(400).send('Invalid password or email! ');
    res.send(token);
    
});

module.exports.router = router;
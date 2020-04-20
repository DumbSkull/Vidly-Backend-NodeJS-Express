const jwt = require('jsonwebtoken');
const config = require('config');

async function admin(req, res, next){
    const {isAdmin}= jwt.decode(req.header('x-auth-token'), config.get('jwtPrivateKey'));

    if(!isAdmin)
        return res.status(403).send('Forbidden');
    next();
}

module.exports = admin;
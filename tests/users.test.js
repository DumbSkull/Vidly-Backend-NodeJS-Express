const {user: User} = require('../users');
const jwt = require('jsonwebtoken');
const config = require('config');

describe('getToken function', ()=>{
    it ('getToken test', ()=>{
        const user = new User({
            name: 'Mosh',
            email: 'moshEmail',
            password: '12345',
            isAdmin: true
        });
        const token = user.getToken();
        const result = jwt.verify(token, config.get('jwtPrivateKey'));
        expect(result).toMatchObject({})
    })
   
})
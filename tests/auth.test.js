const auth = require('../middlewears/auth');
const request = require('supertest');
const server = require('../index');
const {user: User} = require('../users');
const config = require('config');
const mongoose = require('mongoose');

describe('auth', async()=>{
    it ('if token is invalid, then status 401', ()=>{
        let isCalled = 0;
        const user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            email: 'Mosh@email.com',
            isAdmin: true
        }
        const token = new User(user).getToken();
        const req = {header: function(){
            return token;
        }};
        function next(){
            isCalled=1;
            expect(isCalled).toBe(1);
        }
        const res = {};
        auth(req, res, next);
        console.log(req.user);
        console.log(user);
        expect(req.user).toMatchObject(user);
        await server.close();
    })
})

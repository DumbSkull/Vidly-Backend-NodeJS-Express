const {Genre} = require('../../genres');
let server;
const request = require('supertest');
const mongoose = require('mongoose');

describe('/api/genres ', ()=>{
    describe('GET ', ()=>{
        beforeEach(()=>{
            server = require('../../index');    
        });
        afterEach(async ()=>{
            await server.close();
            await Genre.remove({});
        });
        it ('get genre by id', async()=>{
            const oi1 = mongoose.Types.ObjectId(1);
            const oi2 = mongoose.Types.ObjectId(2);
            Genre.collection.insertMany([{_id: oi1,
                                            name: 'genre1'},
                                         {_id: oi2,
                                            name: 'genre2'}]);
            let res = await request(server).get('/api/genres/' + oi1);
            expect(res.status).toEqual(200);
            expect(res.body.name).toBe('genre1');
            res = await request(server).get('/api/genres/' + oi2);
            expect(res.status).toEqual(200);
            expect(res.body.name).toBe('genre2');
        });
        it ('get all genres', async()=>{
            Genre.collection.insertMany([{name: 'genre1'},
                                         {name: 'genre2'}]);
            
            const res = await request(server).get('/api/genres/');
            expect(res.status).toEqual(200);
            expect(res.body.length).toEqual(2);
            expect(res.body.some(g=>g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g=>g.name === 'genre2')).toBeTruthy();
        })
    })
});

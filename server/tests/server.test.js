const path = require('path');
const expect = require('expect');
const request = require('supertest');

const {app} = require(path.join(__dirname, '..', 'server'));
const {Todo} = require(path.join(__dirname, '..', 'models', 'todo'));

const todos = [
    { text: 'Premier test todo' },
    { text: 'Second test todo' }
];

// Preparing db before every request
beforeEach(done => {
    Todo.deleteMany({}).then(() => {
        return Todo.insertMany(todos)
    }).then(() => done());
});

describe('POST /todos', () => {

    it('should create a new Todo', done => {
        var text = 'Test todo text';
        // Making the right POST request
        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        // Checking the db
        .end((err, res) => {
            if(err) { return done(err); }
            Todo.find({text}).then(todos => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch(e => done(e));
        });
    });

    it('should not create Todo with invalid body data', done => {
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) { return done(err); }
            Todo.find().then(todos => {
                expect(todos.length).toBe(2);
                done();
            }).catch(e => done(e));
        });
    });
});

describe('GET /todos', () => {
    it('should get all todos', done => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect(res => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
});
const path = require('path');
const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require(path.join(__dirname, '..', 'server'));
const { Todo } = require(path.join(__dirname, '..', 'models', 'todo'));

const todos = [
    { 
        _id: new ObjectID(),
        text: 'Premier test todo' },
    { 
        _id: new ObjectID(),
        text: 'Second test todo',
        completed: true,
        completedAt: 333           }
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

describe('GET /todos/:id', () => {
    it('should return Todo doc', done => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
            expect(res.body.todo.text).toBe(todos[0].text)
        })
        .end(done)
    });

    it('should return 404 if Todo not found', done => {
        var hexId = new ObjectID().toHexString()

        request(app)
        .get(`/todos/${hexId}`)
        .expect(404)
        .end(done)
    });

    it('should return 404 for non-object ids', done => {
        request(app)
        .get('/todos/123')
        .expect(404)
        .end(done)
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete Todo doc', done => {
        var hexId = todos[1]._id.toHexString();

        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect(res => {
            expect(res.body.todo._id).toBe(hexId)
        })
        .end((err, res) => {
            if (err) return done(err);

            Todo.findById(hexId)
            .then(todo => {
                expect(todo).toBe(undefined || null);
                done();
            })
            .catch(err => done(err));
        });
    });

    it('should return 404 if Todo not found', done => {
        var hexId = new ObjectID().toHexString()

        request(app)
        .delete(`/todos/${hexId}`)
        .expect(404)
        .end(done)
    });

    it('should return 404 if object ID is invalid', done => {
        request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done)
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the Todo', done => {
        var hexId = todos[0]._id.toHexString();
        var text = 'C\'est le nouveau texte';

        request(app)
        .patch(`/todos/${hexId}`)
        .send({
            text,
            completed: true
        })
        .expect(200)
        .expect(res => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(typeof res.body.todo.completedAt).toBe('number');
        })
        .end(done);
    });

    it('should clear completedAt when Todo is not completed', done => {
        var hexId = todos[1]._id.toHexString();
        var text = 'This is updated text';

        request(app)
        .patch(`/todos/${hexId}`)
        .send({
            text,
            completed: false
        })
        .expect(200)
        .expect(res => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBe(undefined || null);
        })
        .end(done);
    });
});
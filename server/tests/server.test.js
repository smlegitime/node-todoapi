const path = require('path');
const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require(path.join(__dirname, '..', 'server'));
const { Todo } = require(path.join(__dirname, '..', 'models', 'todo'));
const { User } = require(path.join(__dirname, '..', 'models', 'user'));
const { todos, populateTodos, users, populateUsers } = require(path.join(__dirname, 'seed', 'seed'));

// Preparing db before every request
beforeEach(populateUsers);
beforeEach(populateTodos);

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
            if(err) return done(err); 
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
            if (err) return done(err);
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

describe('GET /users/me', () => {
    it('should return user if authenticated', done => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return a 401 if not authenticated', done => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect(res => expect(res.body).toEqual({}))
        .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', done => {
        let email = 'example@example.com';
        let password = 'vsre870';

        request(app)
        .post('/users')
        .send({ email, password })
        .expect(200)
        .expect(res => {
            expect(res.headers['x-auth']).toBeTruthy();
            expect(res.body._id).toBeTruthy();
            expect(res.body.email).toBe(email);
        })
        .end(err => {
            if(err) return done(err);

            User.findOne({ email })
            .then(user => {
                expect(user).toBeTruthy();
                expect(user.password).not.toBe(password);
                done();
            })
            .catch(err => done(err));
        });
    });

    it('should return validation errors if request invalid', done => {
        let email = 'mauvais@.com';
        let password = 'nope';

        request(app)
        .post('/users')
        .send({ email, password })
        .expect(400)
        .end(done);
    });

    it('should not create user if email in use', done => {
        request(app)
        .post('/users')
        .send({
            email: users[0].email,
            password: users[0].password
        })
        .expect(400)
        .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', done => {
        request(app)
        .post('/users/login')
        .send({ 
            email: users[1].email,
            password: users[1].password
        })
        .expect(200)
        .expect(res => {
            expect(res.headers['x-auth']).toBeTruthy()
        })
        .end((err, res) => {
            if (err) return done(err);

            User.findById(users[1]._id)
            .then(user => {
                expect(user.tokens[0]).toMatchObject({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
                done();
            })
            .catch(err => done(err));
        });
    });

    it('should reject invalid login', done => {
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: 'non'
        })
        .expect(400)
        .expect(res => {
            expect(res.headers['x-auth']).toBeFalsy()
        })
        .end((err, res) => {
            if(err) return done(err);

            User.findById(users[1]._id)
            .then(user => {
                expect(user.tokens.length).toEqual(0);
                done();
            })
            .catch(err => done(err));
        })
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', done => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
            if(err) return done(err);

            User.findById(users[0]._id)
            .then(user => {
                expect(user.tokens.length).toEqual(0);
                done();
            })
            .catch(err => done(err));
        })
    });
});
const path = require('path');

require(path.join(__dirname, 'config', 'config'));

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const { ObjectID } = require('mongodb');

const { mongoose } = require(path.join(__dirname, 'db', 'mongoose'));
const { Todo } = require(path.join(__dirname, 'models', 'todo'));
const { User } = require(path.join(__dirname, 'models', 'user'));
const { authenticate } = require(path.join(__dirname, 'middleware', 'authenticate'));

const PORT = process.env.PORT;
const app = express();

app.use(bodyParser.json());

/**
 * TODO ROUTES
 */

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text:req.body.text
    });

    todo.save()
    .then((doc) => {
        res.send(doc);
    })
    .catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find()
    .then(todos => {
        res.send({todos})
    })
    .catch(err => res.status(400).send(err));
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findById(id)
    .then(todo => {
        if(!todo){
           return res.status(404).send();
        }
        res.send({todo});
    })
    .catch(err => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
    let id = req.params.id;

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findByIdAndDelete(id)
    .then(todo => {
        if(!todo) {
            return res.status(404).send()
        }
        res.status(200).send({todo});
    })
    .catch(err => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({"_id": {$eq: id}}, {$set: body}, {new: true})
    .then(todo => {
        if(!todo) return res.status(404).send();
        res.send({todo});
    })
    .catch(e => res.status(400).send());
});

/**
 * USERS ROUTES
 */

app.post('/users', (req, res) => {
    var userBody = _.pick(req.body, ['email', 'password'])
    var user = new User(userBody);

    user.save()
    .then(() => user.generateAuthToken())
    .then(token => res.header('x-auth', token).send(user))
    .catch(err => res.status(400).send(err));
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user)
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
    .then(user => {
        return user.generateAuthToken()
        .then(token => res.header('x-auth', token).send(user))
    })
    .catch(err => res.status(400).send(err))
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token)
    .then(() => res.status(200).send())
    .catch(err => res.status(400));
});

app.listen(PORT, () => {
    console.log(`Started on port ${PORT}`)
});

module.exports = {app};
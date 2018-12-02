const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require(path.join(__dirname, 'db', 'mongoose'));
const {Todo} = require(path.join(__dirname, 'models', 'todo'));
const {User} = require(path.join(__dirname, 'models', 'user'));

const PORT = 3000;
const app = express();

app.use(bodyParser.json());

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

app.listen(PORT, () => {
    console.log(`Started on port ${PORT}`)
});

module.exports = {app};
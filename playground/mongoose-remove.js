const path = require('path');
const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require(path.join(__dirname, '..', 'server', 'models', 'todo'));

// Todo.deleteMany({}).then(result => {
//     console.log(result);
// });

// Todo.findOneAndDelete()

Todo.findByIdAndDelete('5c0d769a01f3a4a89a9e254d').then(todo => {
    console.log('Removed Todo:', todo);
});
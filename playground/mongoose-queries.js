const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

var id  = '6c0342f0cdbc15482085a0ac11';

if(!ObjectID.isValid(id)){
    console.log('ID not valid');
}

Todo.find({
    _id: id
}).then((todos) => {
    console.log('Todos', todos)
});

Todo.findOne({
    _id: id
}).then(todo => {
    console.log('Todo', todo)
});

Todo.findById(id)
.then(todo => {
    if(!todo) {
        return console.log('ID not found');
    }
    console.log('Todo By Id', todo);
}).catch(err => console.log(err));
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true});

var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});

var User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});

var newUser = new User({
    email: 'smlegitime@live.com'
});

newUser.save()
.then( doc => console.log('User created', doc))
.catch( err => console.error('Unable to save user', err));

var otherTodo = new Todo({
    text: 'Buy boose',
    completed: true,
    completedAt: 123
});

// otherTodo.save()
// .then(doc => console.log('Saved todo', doc))
// .catch( err => console.log('Unable to save todo', err));
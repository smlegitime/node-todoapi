const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
    if(err) {
        return console.error('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    db.collection('Todos').insertOne({
        text: 'Something to do',
        completed: false
    }, (err, result) => {
        if(err) {
            return console.error('Unable to insert todo', err);
        }
        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    db.collection('Users').insertOne({
        name: 'Sybille',
        age: 22,
        location: '411 Middle Street, Portsmouth NH 03801'
    }, (err, result) => {
        if(err) {
            return console.error('Unable to insert todo', err);
        }
        console.log(result.ops[0]._id.getTimestamp());
    });

    client.close();
});
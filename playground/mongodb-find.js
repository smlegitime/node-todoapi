const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
    if(err) {
        return console.error('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    // db.collection('Todos').find({
    //     _id: new ObjectID('5bdf5deb0b14d52518152cba')
    // }).toArray().then( (docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // })
    // .catch(err => console.log('Unable to fetch todos', err));

    // db.collection('Todos').find().count().then( (count) => {
    //     console.log(`Todo count: ${count}`);
    // })
    // .catch(err => console.log('Unable to fetch todos', err));

    db.collection('Users').find({age: 22}).toArray().then( (docs) => {
        console.log('Users');
        console.log(JSON.stringify(docs, undefined, 2));
    }).catch(err => console.log('Unable to fetch todos', err));

    // client.close();
});
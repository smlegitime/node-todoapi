const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
    if(err) {
        return console.error('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    // deleteMany
    db.collection('Users').deleteMany({age: 22})
    .then( (result) => {
        console.log(result);
    });

    // findOneAndDelete
    db.collection('Users').findOneAndDelete({
        _id: new ObjectID('5bdf6a380e1eeef20487d40f')
    })
    .then( (result) => {
        console.log(result)
    })
    .catch(err => console.error('Unable to delete todo', err));

    // client.close();
});
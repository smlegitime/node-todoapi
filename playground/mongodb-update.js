const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
    if(err) {
        return console.error('Unable to connect to MongoDB');
    }
    console.log('Connected to MongoDB');

    const db = client.db('TodoApp');

    db.collection('Todos').findOneAndUpdate({
        _id: new ObjectID('5bdf84740e1eeef20487dc1b')
    }, {
        $set: {
            completed: true
        }
    }, {
        returnOriginal: false
    }).then(result => console.log(result));

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5bdf8bb00e1eeef20487de35')
    }, {
        $set: { name: 'Sylvia' },
        $inc: { age: 1 }
    }, {
        returnOriginal: false
    })
    .then(result => console.log(result));

    // db.close()
});
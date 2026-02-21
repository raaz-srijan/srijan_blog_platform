const mongoose = require('mongoose');

function connectDb(req, res) {
    try {
        const connect = mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected successfully`);
        return connect;
    } catch (error) {
        console.error(`Error connecting to database`, error);
    }
}


module.exports = connectDb;
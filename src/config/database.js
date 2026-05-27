const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://sachinkbcm_db_user:jr6rGhBHK3dfxAoc@cluster0.b51y2lr.mongodb.net/dev-tinder');
    } catch (err) {
        console.error(err.message);
        // process.exit(1);
    }
};

module.exports = connectDB;
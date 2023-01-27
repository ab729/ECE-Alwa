const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        // unique: true,
        // lowercase: true
    },
    password: {
        required: true,
        type: String,
    },
    stage: {
        required: true,
        type: Number
    },
    thirdName: {
        type: String,
        required: true,
        // unique: true
    },

}, {
    timestamps: {
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    }
});

module.exports = mongoose.model('user', userSchema);
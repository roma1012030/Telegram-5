const {Schema, model} = require('mongoose');
//let Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        maxLength: 50,
        required: true
    }, 
    surname: {
        type: String,
        maxLength: 50,
        required: true
    }, 
    role: {
        type: String,
        maxlength:50
    },
    score: {
        type: Number,
        maxlength:50
    }
});

module.exports = model('trainees', schema);
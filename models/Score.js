const {Schema, model} = require('mongoose');
//let Schema = mongoose.Schema;

const schema = new Schema({
    trainee_name: {
        type: String,
        maxLength: 50,
        required: true
    }, 
    trainee_surname: {
        type: String,
        maxLength: 50,
        required: true
    }, 
    trainee_score: {
        type: Number,
        required: true
    }
}, {timestamps: true});

module.exports = model('score', schema);
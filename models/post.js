const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    imageUrl: {
        type: String,
        require: false
    },
    content: {
        type: String,
        require: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        require: true,
        ref:'User'
    }
}, {
    timestamps: true
});
    
module.exports = mongoose.model('Post', postSchema);
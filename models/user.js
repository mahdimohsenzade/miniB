const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique:true },
    password: { type: String, require: true },
    status: { type: String, require: true, default: 'new user' },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref:'Post'
        }
    ]
})

module.exports = mongoose.model('User', UserSchema);

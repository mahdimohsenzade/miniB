const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {    
            console.log(errors.array());
            return res.status(422).json({
                message: 'validation faild.your enterd data is invalid!',
                errors:errors.array()
            })
        }

        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            email: email,
            password: hashedPassword,
            name: name
        });

        const result = user.save();
        return res.status(201).json({
            message: 'User saved successfully',
            userId:result._id
        })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
    
}

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('User with this email not found!');
            error.statusCode = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('wrong password!');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            { email: user.email, userId: user._id.toString() },
            "zendebaadeyvazi",
            {expiresIn:'1h'}
        );

        res.status(200).json({
            token: token,
            userId:user._id.toString()
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
} 
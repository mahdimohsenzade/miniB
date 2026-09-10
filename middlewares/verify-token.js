const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const error = new Error('Invalid authorization header');
        error.statusCode = 401;
        return next(error);
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'zendebaadeyvazi');
        
    } catch(error) {
        error.statusCode = 500
        throw error;
    }
    
    if (!decodedToken) {
        const error = new Error('Invalid token')
        error.statusCode = 401
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
}

// authMiddleware.js

import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
    console.log(req.headers.authorization.split(' ')[1])
  try {
    // Assuming you're using JWT for authentication
    const token = req.headers.authorization.split(' ')[1]; // Assuming token is sent in the format "Bearer <token>"
    const decoded = jwt.verify(token, "secretkey"); // Assuming you have a JWT secret stored in environment variables
console.log(token)
    // Attach the decoded token to the request for further use
    req.user = decoded;
    console.log(decoded)

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export default authMiddleware;

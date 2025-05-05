import jwt from 'jsonwebtoken'

const isLoggedIn = async (req, res, next) => {

    try {
        // extract token from request cookies api call
        console.log('req.cookies', req.cookies);
        
        const token = req.cookies.jwtToken

        // check if token exists
        if (!token) {
            console.log('token', token);
            
            return res.status(401).json({
                status: false,
                message: 'Unauthorized accessss'
            })
        }

        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Check if user exists
        if (!decoded) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized access'
            })
        }

        // pass the user data to next middleware
        req.user = decoded;
        next()
    } catch (error) {

        console.log('Error verifying token: ',error);
        return res.status(500).json({
            status:false,
            message:'Internal server error'
        })
    }
}

export default isLoggedIn
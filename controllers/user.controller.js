import User from "../models/users.model.js"
import crypto from 'crypto'
import sendVerificationEmail from "../utils/sendMail.utils.js"
import resetPasswordEmail from "../utils/resetPassword.utils.js"
import jwt from 'jsonwebtoken'

const registerUser = async (req, res) => {
    // get the data from request body
    const { email, name, password } = req.body

    // check if data is valid
    if (!email || !name || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        })
    }

    // password length
    if (password.length < 6) {
        return res.status(400).json({
            sucess: false,
            message: "Enter more than 6 digit password"
        })
    }

    // see if user already exists in db.
    // for this we need to access db so we will use try catch to be safe
    try {
        // if existing user
        const existingUser = await User.findOne({
            email
        })
        if (existingUser) {
            return res.status(400).json({
                sucess: false,
                message: "User already exists"
            })
        }

        // now to add user we need to verify. User verification token
        const token = crypto.randomBytes(32).toString('hex')
        const tokenExpriry = Date.now() + 10 * 60 * 60 * 1000

        // create a new user now
        const user = await User.create({
            name,
            email,
            password,
            verificationToken: token,
            verificationTokenExpiry: tokenExpriry
        })

        if (!user) {
            return res.status(200).json({
                success: false,
                message: "User not created"
            })
        }

        // send mail to user for verification
        await sendVerificationEmail(user.email, token)

        return res.status(201).json({
            success: true,
            message: "User registered, Verify your email"
        })

    } catch (error) {
        console.error("User registration failed", error);
        return res.status(500).json({
            status: false,
            message: "User registration failed",
        })
    }
}


// verify user 

const verifyUser = async (req, res) => {
    try {
        // get token from url
        const token = req.params.token

        // get user 
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(200).json({
                success: false,
                message: "token invalid"
            })
        }

        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiry = undefined

        await user.save()
        return res.status(200).json({
            success: true,
            message: "User verified successfully"
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "User registration failed",
        })
    }
}


const loginUser = async (req, res) => {
    // get data
    const { email, password } = req.body

    // validate
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        })
    }

    try {
        const user = await User.findOne({
            email
        })
        // if it exists
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            })
        }

        // if it is verified
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User not verified'
            })
        }

        // match password with db password
        const isPasswordMatch = await user.comparePassword(password)

        // check if it is correct
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Wrong password or email'
            })
        }

        // create a JWT token for the user to access protected routes
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRY,
        });

        // set cookie
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            httpOnly: true,
        };

        res.cookie("jwtToken", jwtToken, cookieOptions);


        // send response
        return res.status(200).json({
            status: true,
            message: "User logged in successfully",
        });

    } catch (error) {
        console.error("User login failed", error);
        return res.status(500).json({
            status: false,
            message: "User login failed",
        });
    }

}

const getProfile = async (req, res) => {
    try {
        // get user id from request object
        const userId = req.user.id;

        // find user by id
        const user = await User.findById(userId).select('-password')

        // check if user exists
        if (!user) {
            return res.status(400).json({
                status: false,
                message: "User not found"
            })
        }

        // send response
        return res.status(200).json({
            status: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role
            }
        })
    } catch (error) {
        console.log('error getting user profile', error);
        return res.status(500).json({
            status: false,
            message: 'Error getting user profile'
        })
    }
}

const logoutUser = async (req, res) => {
    try {

        // clear cookie
        res.cookie("jwtToken", "", {
            expires: new Date(Date.now()), // set the cookie to expire immediately after logout
            httpOnly: true,
        });
        // 3. send response
        return res.status(200).json({
            status: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        console.error("User logout failed", error);
        return res.status(500).json({
            status: false,
            message: "User logout failed",
        });
    }
}

const forgotPassword = async (req, res) => {
    try {

        // get email
        const { email } = req.body

        // check if data is valid
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }

        // find user based on email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User dont exist"
            })
        }

        // set token and expiry for the user
        const token = crypto.randomBytes(32).toString('hex')
        const tokenExpriry = Date.now() + 10 * 60 * 60 * 1000

        user.resetPasswordToken = token
        user.resetPasswordTokenExpiry = tokenExpriry

        await user.save()

        // send mail to user for reset password
        await resetPasswordEmail(user.email, token)

        return res.status(201).json({
            success: true,
            message: "Reset password mail sent!"
        })

    } catch (error) {
        console.error("Reset password failed", error);
        return res.status(500).json({
            status: false,
            message: "Reset password failed",
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        //collect token from params
        // password from req.body
        const token = req.params.token
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid token"
            })
        }

        // set password in user
        user.password = password


        // resetToken, resetExpiry => reset
        user.resetPasswordToken = undefined
        user.resetPasswordTokenExpiry = undefined
        // save
        await user.save()
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Reset password failed",
        })
    }
}


export { registerUser, verifyUser, loginUser, getProfile, logoutUser, forgotPassword, resetPassword }
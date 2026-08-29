const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.models")

/**
 * @name registerUserController
 * @description register a new user, expected username, email and password in the require
 * @access public
 */

async function registerUserController(req, res) {

    const { username , email , password} = req.body

    if (!username || !email || !password){
        return res.status(400).json({
            message : "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email }]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message : "Account already exists with this email address or username"
        })
    }
    
    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password:hash
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        {expiresIn: "1D"}
    )

    res.cookie("token", token)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })


}
/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access public
 */

async function loginUserController(req, res) {
    const {email , password} = req.body
    const user = await userModel.findOne({email})

    if(!user) {
        return res.status(400).json({
            message: "Invalid Email or Password"
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid Email or Password"
        }) 
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        {expiresIn: "1D"}
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "User loggedIn Successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email 
        } 
    })
}


/**
 * @name logoutUserController
 * @description logout a user, clear the token from the cookie and add the token to the blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if (token) {
        await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token");

    res.status(200).json({
        message: "User logged out successfully"
    });
}

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id).select("-password");

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}



    module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
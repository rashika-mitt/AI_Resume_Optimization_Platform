const { Router } = require("express");

const authRouter = Router();

const authcontroller = require("../controllers/auth.controllers");
const authUser = require("../middleware/auth.middleware");

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access public
 */
authRouter.post(
    "/register",
    authcontroller.registerUserController
);

/**
 * @route POST /api/auth/login
 * @description Login user with email and password
 * @access public
 */
authRouter.post(
    "/login",
    authcontroller.loginUserController
);

/**
 * @route GET /api/auth/logout
 * @description Clear token from user cookie and add token to blacklist
 * @access public
 */
authRouter.get(
    "/logout",
    authcontroller.logoutUserController
);

/**
 * @route GET /api/auth/get-me
 * @description Get the current logged-in user details
 * @access private
 */
authRouter.get(
    "/get-me",
    authUser,
    authcontroller.getMeController
);

module.exports = authRouter;
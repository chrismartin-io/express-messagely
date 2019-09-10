const express = require("express");
const User = require("../models/user");
const ExpressError = require('../expressError');
const jwt = require("jsonwebtoken");
const SECRET_KEY = "oh-so-secret";
const JWT_OPTIONS = {
  expiresIn: 60 * 60
};



const router = new express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', function (req, res, next) {
  try {
    const {
      username,
      password
    } = req.body;
    if (User.authenticate(username, password) === true) {
      User.updateLoginTimestamp(username);
      return 'logged in';
    } else {
      throw new ExpressError('invalid user/pssword', 401);
    }
  } catch (err) {
    return next(err);
  }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */


router.post('/register', async function (req, res, next) {
  try {
    const {
      username,
      password,
      first_name,
      last_name,
      phone
    } = req.body;
    
    await User.register(username, password, first_name, last_name, phone);
    await User.updateLoginTimestamp(username);

    // JWT setup
    let payload = {
      username: username
    }

    let token = await jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);

    return res.json({token});
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
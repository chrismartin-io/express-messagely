const express = require("express");
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const SECRET_KEY = "oh-so-secret";

const router = new express.Router();


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    let verifyUser = jwt.verify(tokenFromBody, SECRET_KEY);

    if (verifyUser) {
      let users = await User.all();
      return res.json({
        users: users
      });
    }
  } catch (err) {
    next(err);
  }
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    let verifyUser = jwt.verify(tokenFromBody, SECRET_KEY);

    if (req.params.username === verifyUser.username) {
      let user = await User.get(req.params.username);
      return res.json({
        user: user
      });
    } else {
      next('Not authorized', 400);
    }
  } catch (err) {
    next(err);
  }
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


router.get('/:username/to', async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    let verifyUser = jwt.verify(tokenFromBody, SECRET_KEY);

    if (req.params.username === verifyUser.username) {
      let result = await User.messagesTo(req.params.username);
      return res.json({
        messages: result
      })
    } else {
      next('Not authorized', 400);
    }
  } catch (err) {
    next(err);
  }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    let verifyUser = jwt.verify(tokenFromBody, SECRET_KEY);

    if (req.params.username === verifyUser.username) {
      let result = await User.messagesFrom(req.params.username);
      return res.json({
        messages: result
      })
    } else {
      next('Not authorized', 400);
    }
  } catch (err) {
    next(err);
  }
})




module.exports = router;
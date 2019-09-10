const express = require("express");
const Message = require("../models/message");
const User = require("../models/user");
const ExpressError = require('../expressError');


const router = new express.Router();


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', function (req, res, next) {
  try {
    return {
      users: User.all()
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
    console.log('hi');
    console.log(req.params.username);
    let result = await User.get(req.params.username);
    console.log(result);
    return res.json(result);
  } catch (err) {
    next(err);
  }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


router.get('/:username/to', function (req, res, next) {
  try {
    return {
      messages: User.messagesTo(username)
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

router.get('/:username/from', function (req, res, next) {
  try {
    return {
      messages: User.messagesFrom(username)
    }
  } catch (err) {
    next(err);
  }
})




module.exports = router;
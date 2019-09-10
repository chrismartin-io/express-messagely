const express = require("express");
const Message = require("../models/message");
const User = require("../models/user");
const ExpressError = require('../expressError');


const router = new express.Router();


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', function (req, res, next) {
  try {
    return {
      message: Message.get(id)
    }
  } catch (err) {
    next(err);
  }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', function (req, res, next) {
  try {

    const tokenFromBody = req.body._token;
    let user = jwt.verify(tokenFromBody, SECRET_KEY);
    let to_username = req.body.to_usernamne;
    let body = req.body.body;

    Message.create(user.username, to_username, body);

  } catch (err) {
    next(err);
  }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/






module.exports = router;
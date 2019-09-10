const express = require("express");
const Message = require("../models/message");
const User = require("../models/user");
const ExpressError = require('../expressError');
const jwt = require("jsonwebtoken");
const SECRET_KEY = "oh-so-secret";


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

router.get('/:id', async function (req, res, next) {
  try {

    const tokenFromBody = req.body._token;
    let verifyUser = jwt.verify(tokenFromBody, SECRET_KEY);

    let messageDetails = await Message.get(req.params.id);

    if (verifyUser.username === messageDetails.from_user.username ||
      verifyUser.username === messageDetails.to_user.username) {
      let result = await Message.get(req.params.id);
      return res.json({
        message: result
      });
    }
    else {
      next('Not authorized', 401);
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

router.post('/', async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    let verifyUser = jwt.verify(tokenFromBody, SECRET_KEY);

    if (verifyUser) {
      let to_username = req.body.to_username;
      let from_username = req.body.from_username;
      let body = req.body.body;
      let result = await Message.create(from_username, to_username, body);
      return res.json(result);
    }

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

router.post('/:id/read', async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    let verifyUser = jwt.verify(tokenFromBody, SECRET_KEY);
    let messageInfo = await Message.get(req.params.id)

    if (verifyUser.username === messageInfo.to_user.username) {
      let result = await Message.markRead(req.params.id);
      return res.json(result);
    }

  } catch (err) {
    next(err);
  }
})




module.exports = router;
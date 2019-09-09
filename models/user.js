/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require('bcrypt');
const { SECRET_KEY, BCRYPT_WORK_FACTOR, DB_URI } = require("../config");


/** User of the site. */

class User {

  constructor({ username, password, first_name, last_name, phone, join_at, last_login_at }) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
    this.join_at = join_at;
    this.last_login_at = last_login_at;
  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPw = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        phone, 
        join_at, 
        last_login_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPw, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]);
    const user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
      else return false;
    }

    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    var time = Number(new Date());
    var timestamp = new Date(time);

    const result = await db.query(
      `UPDATE users SET last_login_at=$1
      WHERE username=$2
      RETURNING last_login_at`, [timestamp, username]
    );

    return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone from users`)

    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      from users WHERE username=$1`,
      [username]);

    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const messageResult = await db.query(
      `SELECT id, body, read_at, sent_at
      FROM messages 
      WHERE from_username=$1`,
      [username]);

    const toUser = messageResult.rows[0].to_username

    const userToResult = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users
      WHERE username=$1`, 
      [toUser]
    )

    // messageResult.to_user = userToResult.rows[0]

    return messageResult.rows;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT id, to_username, body, sent_at, read_at, from_username, users.username, users.first_name, users.last_name, users.phone
      FROM messages 
      JOIN users 
      ON messages.from_username = users.username
      WHERE users.username = $1`,
      [username]);
    console.log(result.rows)
    return result.rows;
  }
}


module.exports = User;
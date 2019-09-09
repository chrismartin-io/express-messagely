/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require('../bcrypt');
const { SECRET_KEY, BCRYPT_WORK_FACTOR, DB_URI } = require("../config");


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    
    const hashedPw = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        phone)
        VALUES ($1, $2, $3, $4, $5, current_timestamp)
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
    )

    return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;
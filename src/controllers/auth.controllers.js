import { db } from '../database/database.connection.js'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcrypt'

export async function SignInUser(req, res) {
  const { email, password } = req.body

  try {
    const { rows } = await db.query(`SELECT * FROM users WHERE email = $1`, [
      email
    ])
    const user = rows[0]

    if (bcrypt.compareSync(password, user.password)) {
      const token = uuid()
      await db.query(
        `INSERT INTO sessions (token, "userId") 
    VALUES ($1, $2)`,
        [token, user.id]
      )
      return res.status(200).send({ token: token })
    }
    res.sendStatus(401)
  } catch (err) {
    res.sendStatus(500)
  }
}

export async function signUpUser(req, res) {
  const { name, email, password, confirmPassword } = req.body;

  try {
      const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existingUser.rows.length > 0) return res.status(409).send('E-mail already registered');

      if (password !== confirmPassword) return res.status(422).send('Passwords do not match');

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [
          name.toLowerCase(),
          email.toLowerCase(),
          hashedPassword,
      ]);

      return res.status(201).send('User registered successfully');
  } catch (error) {
      return res.status(500).send('Internal Server Error');
  }
}
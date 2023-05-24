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
  const {name, email, password} = req.body;
    const encryptedPw = bcrypt.hashSync(password, 10)
    try {
        await db.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`, [name, email, encryptedPw])
        res.sendStatus(201)
    } catch (err) {
        console.log(err.message)
    }

}

export async function logout(req, res) {
	const { id } = res.locals.user;
	try {
		await db.query(`DELETE FROM sessions WHERE "userId"=$1;`, [Number(id)]);
		res.send("Usuário desconectado");
	} catch (err) {
		res.status(500).send(err.message);
	}
}

export async function getInfosUser(req, res) {
	const { id } = res.locals.user;
	try {
		const userInfo = await db.query(
      `SELECT users.id, users.name, SUM(links.visits) AS "visitCount",
          json_agg(json_build_object('id',links.id, 'url', links.url, 'shortUrl',links."shortUrl",'visitCount',links.visits))
          AS "shortenedUrls"
          FROM users JOIN links ON links."userId"=$1
          AND users.id=$1 GROUP BY (users.id);`,
      [Number(id)]
    );
		res.status(200).send(userInfo.rows[0]);
	} catch (err) {
		res.status(500).send(err.message);
	}
}

export async function getRanking(req, res) {
	try {
		const ranking = await db.query(
      `SELECT users.id, users.name, COUNT(links) AS "linksCount", SUM(links.visits) AS "visitCount"
          FROM users JOIN links ON links."userId"=users.id GROUP BY (users.id) ORDER BY "visitCount" DESC LIMIT 10;`
    );
		if (ranking.rowCount === 0) return res.sendStatus(404);
		res.status(200).send(ranking.rows);
	} catch (err) {
		res.status(500).send(err.message);
	}
}
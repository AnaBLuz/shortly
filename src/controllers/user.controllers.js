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
	try {
    const userEmail = req.user.email;
    const user = await db.query(
      `
          SELECT id, name, email, "createdAt"
          FROM users
          WHERE email = $1
        `,
      [userEmail]
    );
    const shortenedUrls = await db.query(
      `
        SELECT id, url, "shortUrl", visits as "visitCount"
        FROM links
        WHERE user_email = $1
      `,
      [userEmail]
    );
    let visitCount = shortenedUrls.rows.reduce(
      (sum, url) => sum + url.visitCount,
      0
    );
    console.log(visitCount);
      console.log(shortenedUrls.rows)
    visitCount = visitCount === null ? 0 : visitCount;

    res.status(200).send({
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      visitCount: visitCount,
      shortenedUrls: shortenedUrls.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

export async function ranking(req, res) {
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
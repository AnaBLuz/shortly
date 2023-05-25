import { db } from "../database/database.connection.js";

export async function authorization(req, res, next) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.sendStatus(401)

    try {
        const session = await db.query(`SELECT "userId" FROM sessions WHERE token=$1;`, [token])
        if (session.rowCount === 0) return res.sendStatus(401)
        res.locals.userId = session.rows[0].userId

        next()
    } catch (err) {
        res.status(500).send(err)
    }
}
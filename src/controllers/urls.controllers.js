import { nanoid } from "nanoid";
import { db } from "../database/database.connection.js";

export const shortUrl = async (req, res) => {
    try {
        const { url } = req.body;
        const { userId } = res.locals;

        const shortUrl = nanoid();

        const query = `
            INSERT INTO links (url, "shortUrl", "userId")
            VALUES ($1, $2, $3)
            RETURNING id`;
        const values = [url, shortUrl, userId];

        const result = await db.query(query, values);

        const urlId = result.rows[0].id;

        return res.status(201).send({ id: urlId, shortUrl });
    } catch (error) {
        console.error('Error creating short URL:', error);
        return res.status(500).send('Internal server error.');
    }
};

export const getURLById = async (req, res) => {
    const { id } = req.params;
	try {
		const response = await db.query(`SELECT id, "shortUrl", url FROM links WHERE id=$1;`, [Number(id)]);
		if (response.rowCount === 0) return res.sendStatus(404);

		res.status(200).send(response.rows[0]);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const getShortURL = async (req, res) => {
    const { shortUrl } = req.params;
	try {
		const response = await db.query(`SELECT id, url, visits FROM links WHERE "shortUrl"=$1;`, [shortUrl]);
		if (response.rowCount === 0) return res.sendStatus(404);
		const { id, url, visits } = response.rows[0];
		let visit = visits;
		await db.query(`UPDATE links SET visits=$1 WHERE id=$2`, [(visit += 1), id]);
		res.redirect(url);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const deleteURL = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = res.locals;

        const checkIdQuery = 'SELECT * FROM links WHERE id = $1'
        const response = await db.query(checkIdQuery, [id])

        if (response.rowCount === 0) return res.sendStatus(404)

        const query = 'SELECT * FROM links WHERE id = $1 AND userId = $2';
        const values = [id, userId];

        const result = await db.query(query, values);

        if (result.rows.length === 0) return res.sendStatus(401);

        const deleteQuery = 'DELETE FROM links WHERE id = $1';
        await db.query(deleteQuery, [id]);

        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).send('Internal server error.');
    }
};

export const usersMe = async (req, res) => {
    try {
        const { userId } = res.locals;
        
        const userQuery = 'SELECT * FROM links WHERE id = $1';
        const userValues = [userId];

        const userResult = await db.query(userQuery, userValues);
        const user = userResult.rows[0];

        if (!user) return res.status(404).send('User not found');

        const urlsQuery = 'SELECT * FROM links WHERE userId = $1';
        const urlsValues = [userId];

        const urlsResult = await db.query(urlsQuery, urlsValues);
        const urls = urlsResult.rows;

        const urlsData = urls.map((url) => ({
            id: url.id,
            shortUrl: url.shortenedurl,
            url: url.originalurl,
            visitCount: url.visitcount,
        }));

        const visitCount = urls.reduce((total, url) => total + url.visitcount, 0);

        const responseData = {
            id: user.id,
            name: user.name,
            visitCount: visitCount,
            shortenedUrls: urlsData,
        };

        res.status(200).send(responseData);
    } catch (error) {
        console.log(error)
        res.status(500).send('Failed to retrieve user data');
    }
};

export const ranking = async (req, res) => {
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
};
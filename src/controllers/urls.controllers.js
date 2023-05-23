import { nanoid } from "nanoid";
import { db } from "../database/database.connection.js";

export const shortenUrl = async (req, res) => {
    try {
        const { url } = req.body;
        const { userId } = res.locals;

        const shortUrl = nanoid();

        const query = `
            INSERT INTO links (originalUrl, shortenedUrl, user_id)
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

export const findURLById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT id, shortenedUrl as "shortUrl", originalUrl as url
            FROM links WHERE id = $1`;
        const values = [id];

        const result = await db.query(query, values);

        if (result.rowCount === 0) return res.status(404).send('Shortened URL not found.');

        return res.status(200).send(result.rows[0]);
    } catch (error) {
        
        return res.status(500).send('Internal server error.');
    }
};

export const getShortURL = async (req, res) => {
    try {
        const { shortUrl } = req.params;

        const query = 'SELECT originalUrl FROM links WHERE shortenedUrl = $1';
        const values = [shortUrl];

        const result = await db.query(query, values);

        if (result.rowCount === 0) return res.sendStatus(404);
        
        const originalUrl = result.rows[0].originalurl;

        const updateQuery = 'UPDATE links SET visitCount = visitCount + 1 WHERE shortenedUrl = $1';
        await db.query(updateQuery, [shortUrl]);

        return res.redirect(originalUrl);
    } catch (error) {
        return res.status(500).send('Internal server error.');
    }
};

export const deleteURL = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = res.locals;

        const checkIdQuery = 'SELECT * FROM links WHERE id = $1'
        const response = await db.query(checkIdQuery, [id])

        if (response.rowCount === 0) return res.sendStatus(404)

        const query = 'SELECT * FROM links WHERE id = $1 AND user_id = $2';
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

        const urlsQuery = 'SELECT * FROM links WHERE user_id = $1';
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

export const getRanking = async (req, res) => {
    try {
        const rankingQuery =
            `SELECT users.id, users.name, 
            COUNT(links.id) AS linksCount, SUM(links.visitcount) AS visitCount 
            FROM users LEFT JOIN urls ON users.id = urls.user_id 
            GROUP BY users.id ORDER BY visitCount DESC LIMIT 10`;
        const rankingResult = await db.query(rankingQuery);

        const ranking = rankingResult.rows.map((row) => ({
            id: row.id,
            name: row.name,
            linksCount: row.linkscount || 0,
            visitCount: row.visitcount || 0,
        }));

        res.status(200).send(ranking);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};
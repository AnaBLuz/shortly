import jwt from 'jsonwebtoken';
import { db } from '../database/database.connection.js';

export const authorization = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Token de autenticação não fornecido ou inválido.');
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'mysecret', async (err, user) => {
        if (err) {
            return res.status(401).send('Token de autenticação inválido.');
        }
        req.user = user;

        const { rows: [userId] } = await db.query(`SELECT * FROM users WHERE email = $1`, [user.email.toLowerCase()])

        res.locals.userId = userId.id

        next();
    });
};
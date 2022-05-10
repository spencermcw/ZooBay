import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.token;
    if (!token)
        return res.sendStatus(403);

    try {
        jwt.verify(token, process.env.JWT_SECRET!);
    } catch (e) {
        return res.send(403);
    }

    return next();
}

export const sign = (req: Request, res: Response, next: NextFunction) => {
    const token = jwt.sign({ data: req.body.payload! }, process.env.JWT_SECRET!);
    return res.send(token);
}


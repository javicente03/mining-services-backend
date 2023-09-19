import config from "../config";
import prisma from "./prismaClient";
import jwt from "jsonwebtoken";

const verifyAdmin = (req: any, res: any, next: any) => {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        jwt.verify(req.token, config.SECRET_KEY_JWT || 'secretKey', async (err: any, authData: any) => {
            if(err) {
                res.status(401).json({error: 'No Autorizado'})
            } else {
                const isUser = await prisma.user.findUnique({
                    where: {
                        id: authData.id
                    }
                })
                if (!isUser) return res.status(401).json({error: 'No Autorizado'})
                if (isUser.role !== 'admin') return res.status(401).json({error: 'No Autorizado'})
                next();
            }
        })

    } else {
        res.status(401).json({error: 'No Autorizado'})
    }
}

export default verifyAdmin;
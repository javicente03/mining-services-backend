import jwt from 'jsonwebtoken';
import config from '../config';

const ObtainUser = async (req: any) => {
    const bearerHeader = req.headers['authorization'];
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    const token = bearerToken;
    let user = {
        id: 0,
        iat: 0,
        exp: 0,
        role: ''
    };

    await jwt.verify(token, config.SECRET_KEY_JWT || 'secretKey', (err: any, authData: any) => {
        user = authData;
    })
    return user;
}

export default ObtainUser;
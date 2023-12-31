import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { v4 as uuidv4 } from "uuid";
import { EmailForgotPasswordTemplate } from "../helpers/email/templates";
import EmailSender from "../helpers/email/sendEmail";
import s3Aws from "../utils/aws";

export const Login = async (req: Request, res: Response) => {
    try {
        const { rut, password } = req.body;

        if (!rut || !password) throw new Error('Faltan datos requeridos');

        const user = await prisma.user.findFirst({
            where: {
                rut: rut
            }
        });

        if (!user) throw new Error('Usuario no encontrado');

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) throw new Error("La contraseña no es válida");

        if (!user.active) throw new Error("Usuario inactivo");
        
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            nombre: user.name + ' ' + user.lastname,
            rut: user.rut,
            type_user: user.role,
        }, config.SECRET_KEY_JWT || 'secret_key', {expiresIn: '30d'});

        user.thumbnail = user.thumbnail ? `${config.DOMAIN_BUCKET_AWS}${user.thumbnail}` : null;

        return res.status(200).json({ token, user });

    } catch (error: any) {
        return res.status(400).json({error: error.message});
    }
}

export const ForgotPassword = async (req: Request, res: Response) => {
    try {

        const { rut } = req.body;

        if (!rut) throw new Error('Faltan datos requeridos');

        const user = await prisma.user.findFirst({ where: { rut: rut } });
        if (!user) throw new Error('Usuario no encontrado');

        await prisma.recover_Password.deleteMany({ where: { userId: user.id } });

        const forgotPassword = await prisma.recover_Password.create({
            data: {
                userId: user.id,
                token: uuidv4()
            }
        });

        // Armar correo de recuperación
        const link_forgot = `${config.DOMAIN_FRONTEND}/reset-password/${forgotPassword.token}/${user.id}`;
        const template = EmailForgotPasswordTemplate(user.name + " " + user.lastname, link_forgot);
        
        // Enviar correo de recuperación
        await EmailSender({
            html: template,
            subject: "Mining Services - Recuperar contraseña",
            to: user.email,
            from: '',
            text: "Recuperar contraseña"
        })

        return res.status(200).json({message: 'Correo enviado', email: user.email});
    } catch (error: any) {
        return res.status(400).json({error: error.message});
    }
}

export const ResetPassword = async (req: Request, res: Response) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) throw new Error('Faltan datos requeridos');
        if (new_password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

        const rp = await prisma.recover_Password.findFirst({ where: { token: token } });
        if (!rp) throw new Error('Token no encontrado');

        const user = await prisma.user.findFirst({ where: { id: rp.userId || 0 } });
        if (!user) throw new Error('Usuario no encontrado');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(new_password, salt);

        await prisma.user.update({ where: { id: user.id }, data: { password: hash } });

        await prisma.recover_Password.delete({ where: { id: rp.id } });

        return res.status(200).json({message: 'Contraseña actualizada'});

    } catch (error: any) {
        return res.status(400).json({error: error.message});
    }
}

// export const RefreshToken = async (req: any, res: any) => {
//     try {
//         const bearerHeader = req.headers['authorization'];

//         if (typeof bearerHeader !== 'undefined') {
//             const bearer = bearerHeader.split(' ');
//             const bearerToken = bearer[1];
//             req.token = bearerToken;

//             jwt.verify(req.token, config.SECRET_KEY_JWT || 'secretKey', async (err: any, authData: any) => {
//                 if(err) {
//                     res.status(200).json({refresh: false})
//                 } else {
//                     // Generar un nuevo token solo si  el token actual es valido y ya han transcurrido 40 minutos
//                     if (moment(authData.exp * 1000).diff(moment(), 'minutes') <= 20) {
//                         const newToken = jwt.sign({
//                             id: authData.id,
//                             email: authData.email,
//                             nombre: authData.nombre,
//                             rut: authData.rut,
//                             type_user: authData.type_user,
//                         }, config.SECRET_KEY_JWT || 'secret_key', {expiresIn: '30d'});
//                         res.status(200).json({token: newToken, refresh: true})
//                     } else {
//                         res.status(200).json({refresh: false})
//                     }
//                 }
//             })

//         } else {
//             res.status(200).json({refresh: false})
//         }
//     } catch (error: any) {
//         res.status(200).json({refresh: false})
//     }
// }

// Test Create
export const CreateUsersTest = async (req: Request, res: Response) => {
    try {
        
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('123456', salt);

        await prisma.user.createMany({
            data: [
                {
                    name: 'Admin',
                    lastname: 'Admin',
                    rut: '11.111.111-1',
                    email: 'javicentego@gmail.com',
                    password: hash,
                    role: 'admin',
                },
                {
                    name: 'Javier',
                    lastname: 'Gerardo',
                    rut: '22.222.222-2',
                    email: 'javicentego2@gmail.com',
                    password: hash,
                    role: 'user'
                },
                {
                    name: 'Danilo',
                    lastname: 'Lopez',
                    email: 'dlopez@ejesoft.cl',
                    rut: '33.333.333-3',
                    password: hash,
                    role: 'user'
                }
            ]
        });

        return res.status(200).json({ message: 'Usuarios Creados' })

    } catch (error: any) {
        return res.status(400).json({error: error.message});
    }
}

// Test Create Image
export const CreateImageTest = async (req: Request, res: Response) => {
    try {
        const { img } = req.body;
        if (!img) throw new Error('Faltan datos requeridos');

        // Esta llegando el base64 puro
        const base64Data = Buffer.alloc(img.length, img, 'base64');
        const name = uuidv4();

        const data = await s3Aws.upload({
            // Bucket hace referencia al nombre del bucket que creamos en AWS
            Bucket: config.BUCKET_NAME_AWS || '',
            // Key hace referencia al nombre del archivo que vamos a guardar en el bucket
            Key: `images/ot/1/${name}.png`,
            Body: base64Data
        }).promise();

        return res.status(200).json({ message: 'Imagen subida', url: data.Location });

    } catch (error: any) {
        return res.status(400).json({error: error.message});
    }
}

export const LeerImagenesEnBucket = async (req: Request, res: Response) => {
    try {
        const data = await s3Aws.listObjects({
            Bucket: config.BUCKET_NAME_AWS || '',
            Prefix: 'images/ot/1/'
        }).promise();

        return res.status(200).json({ data });

    } catch (error: any) {
        return res.status(400).json({error: error.message});
    }
}
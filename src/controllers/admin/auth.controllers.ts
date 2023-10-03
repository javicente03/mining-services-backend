import { Request, Response } from "express";
import prisma from "../../utils/prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";

export const LoginWeb = async (req: Request, res: Response) => {
    try {
        const { rut, password } = req.body;

        if (!rut || !password) throw new Error('Faltan datos requeridos');

        const user = await prisma.user.findFirst({
            where: {
                rut: rut
            }
        });

        if (!user) throw new Error('Usuario no encontrado');

        // if (user.role !== 'admin') throw new Error('Usuario no autorizado');

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
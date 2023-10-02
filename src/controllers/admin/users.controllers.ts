import { Request, Response } from 'express';
import prisma from '../../utils/prismaClient';
import bcrypt from 'bcrypt';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { skip, limit, companyId, search } = req.query;

        const users = await prisma.user.findMany({
            skip: Number(skip) || 0,
            take: Number(limit) || undefined,
            where: {
                role: 'user',
                ...(companyId && { companyId: Number(companyId) }),
                ...(search && {
                    OR: [
                        {name: {contains: String(search)}},
                        {lastname: {contains: String(search)}},
                    ]
                }),
            },
            include: {
                company: true,
            }
        });

        const total = await prisma.user.count({ where: { ...(companyId && { companyId: Number(companyId) }), ...(search && {
            OR: [
                {name: {contains: String(search)}},
                {lastname: {contains: String(search)}},
            ]
        }),
            role: 'user'
        , } });

        return res.status(200).json({ data: users, total });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const CreateUsersTest = async (req: Request, res: Response) => {
    try {
        const company1 = await prisma.company.findFirst()
        const company2 = await prisma.company.findFirst({ skip: 1 })

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123456', salt);

        await prisma.user.createMany({
            data: [
                {
                    name: 'Jose',
                    lastname: 'Perez',
                    email: 'joseperez@gmail.com',
                    password,
                    role: 'user',
                    companyId: company1?.id,
                    rut: '44.444.444-4',
                },
                {
                    name: 'Juan',
                    lastname: 'Perez',
                    email: 'juanperez@gmail.com',
                    password,
                    role: 'user',
                    companyId: company1?.id,
                    rut: '55.555.555-5',
                },
                {
                    name: 'Pedro',
                    lastname: 'Perez',
                    email: 'pedroperez@gmail.com',
                    password,
                    role: 'user',
                    companyId: company1?.id,
                    rut: '66.666.666-6',
                },
                {
                    name: 'Maria',
                    lastname: 'Gonzalez',
                    email: 'mariagonzalez@gmail.com',
                    password,
                    role: 'user',
                    companyId: company2?.id,
                    rut: '77.777.777-7',
                },
                {
                    name: 'Ana',
                    lastname: 'Gonzalez',
                    email: 'anagonzalez@gmail.com',
                    password,
                    role: 'user',
                    companyId: company2?.id,
                    rut: '88.888.888-8',
                },
                {
                    name: 'Carla',
                    lastname: 'Acosta',
                    email: 'carlaacosta@gmail.com',
                    password,
                    role: 'user',
                    companyId: company2?.id,
                    rut: '99.999.999-9',
                }
            ]
        });

        return res.status(200).json({ data: 'ok' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
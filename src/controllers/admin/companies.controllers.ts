import { Request, Response } from 'express';
import prisma from '../../utils/prismaClient';

export const getCompanies = async (req: Request, res: Response) => {
    try {
        const { skip, limit, search } = req.query;

        const companies = await prisma.company.findMany({
            skip: Number(skip) || 0,
            take: Number(limit) || undefined,
            where: {
                ...(search && {
                    OR: [
                        {razon_social: {contains: String(search)}},
                    ]
                }),
            },
        });

        const total = await prisma.company.count({ where: { ...(search && {
            OR: [
                {razon_social: {contains: String(search)}},
            ]
        }), } });

        return res.status(200).json({ data: companies, total });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const CreateCompaniesTest = async (req: Request, res: Response) => {
    try {
        const company1 = await prisma.company.create({
            data: {
                razon_social: 'Empresa 1',
                rut: '123456789',
                direccion: 'Direccion 1',
                telefono: '123456789',
            }
        });

        const company2 = await prisma.company.create({
            data: {
                razon_social: 'Empresa 2',
                rut: '123456789',
                direccion: 'Direccion 2',
                telefono: '123456789',
            }
        });

        const users = await prisma.user.findMany({ where: { companyId: null, role: 'user' } });

        for (const user of users) {
            if (user.id % 2 === 0) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { companyId: company1.id },
                });
            } else {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { companyId: company2.id },
                });
            }
        }

        return res.status(200).json({ data: 'ok' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
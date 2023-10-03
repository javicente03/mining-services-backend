import { Request, Response } from 'express';
import config from '../../config';
import prisma from '../../utils/prismaClient';
import { UploadArchiveToS3 } from '../../utils/UploadArchiveToS3';

export const getCompanies = async (req: Request, res: Response) => {
    try {
        const { skip, limit, search, list } = req.query;

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

        if (list) {
            for (let index = 0; index < companies.length; index++) {
                const element = companies[index];
                element.logo = element.logo ? `${config.DOMAIN_BUCKET_AWS}${element.logo}` : null;
            }
        }

        return res.status(200).json({ data: companies, total });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const company = await prisma.company.findUnique({ where: { id: Number(id) } });

        return res.status(200).json({ data: company });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const createCompany = async (req: Request, res: Response) => {
    try {
        const { razon_social, rut, direccion, telefono, logo, logo_format } = req.body;

        if (!razon_social || !rut || !direccion || !telefono) throw new Error('Faltan datos requeridos');

        if (razon_social.trim() === '') throw new Error('La razón social no puede estar vacía');
        if (rut.trim() === '') throw new Error('El rut no puede estar vacío');
        if (direccion.trim() === '') throw new Error('La dirección no puede estar vacía');
        if (telefono.trim() === '') throw new Error('El teléfono no puede estar vacío');

        await prisma.company.findFirst({ where: { rut: rut } }).then((company) => { if (company) throw new Error('Ya existe una empresa con este rut') });

        const company = await prisma.company.create({
            data: {
                razon_social: razon_social.trim(),
                rut: rut.trim(),
                direccion: direccion.trim(),
                telefono: telefono.trim(),
            }
        });

        if (logo && logo !== '') {
            const upload = await UploadArchiveToS3(logo, 'images/companies/logos/', logo_format)
            
            if (upload) {
                await prisma.company.update({
                    where: { id: company.id },
                    data: {
                        logo: upload.path
                    }
                });
            }
        }

        return res.status(200).json({ data: company });

    }
    catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const UpdateCompany = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { razon_social, rut, direccion, telefono, logo, logo_format } = req.body;

        if (!razon_social || !rut || !direccion || !telefono) throw new Error('Faltan datos requeridos');

        if (razon_social.trim() === '') throw new Error('La razón social no puede estar vacía');
        if (rut.trim() === '') throw new Error('El rut no puede estar vacío');
        if (direccion.trim() === '') throw new Error('La dirección no puede estar vacía');
        if (telefono.trim() === '') throw new Error('El teléfono no puede estar vacío');

        const company = await prisma.company.findFirst({ where: { id: Number(id) } });
        if (!company) throw new Error('Empresa no encontrada');

        await prisma.company.findFirst({ where: { rut: rut, id: { not: Number(id) } } }).then((company) => { if (company) throw new Error('Ya existe una empresa con este rut') });

        await prisma.company.update({
            where: { id: Number(id) },
            data: {
                razon_social: razon_social.trim(),
                rut: rut.trim(),
                direccion: direccion.trim(),
                telefono: telefono.trim(),
            }
        });

        if (logo && logo !== '') {
            const upload = await UploadArchiveToS3(logo, 'images/companies/logos/', logo_format)
            
            if (upload) {
                await prisma.company.update({
                    where: { id: Number(id) },
                    data: {
                        logo: upload.path
                    }
                });
            }
        }

        return res.status(200).json({ data: 'ok' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

// CREATE TEST
export const CreateCompaniesTest = async (req: Request, res: Response) => {
    try {
        const company1 = await prisma.company.create({
            data: {
                razon_social: 'Empresa 1',
                rut: '68950347-0',
                direccion: 'Direccion 1',
                telefono: '123456789',
            }
        });

        const company2 = await prisma.company.create({
            data: {
                razon_social: 'Empresa 2',
                rut: '50589494-4',
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
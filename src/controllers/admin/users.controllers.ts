import { Request, Response } from 'express';
import prisma from '../../utils/prismaClient';
import bcrypt from 'bcrypt';
import { UploadArchiveToS3 } from '../../utils/UploadArchiveToS3';
import config from '../../config';

export const getUsersUser = async (req: Request, res: Response) => {
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

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { skip, limit, companyId, role, search } = req.query;

        const users = await prisma.user.findMany({
            skip: Number(skip) || 0,
            take: Number(limit) || undefined,
            where: {
                ...(role && { role: String(role) }),
                ...(companyId && Number(companyId) !== 0 && { companyId: Number(companyId) }),
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

        const total = await prisma.user.count({ 
            where: {
                ...(role && { role: String(role) }),
                ...(companyId && Number(companyId) !== 0 && { companyId: Number(companyId) }),
                ...(search && {
                    OR: [
                        {name: {contains: String(search)}},
                        {lastname: {contains: String(search)}},
                    ]
                }),
            }
        });

        for (let index = 0; index < users.length; index++) {
            const element = users[index];
            
            element.thumbnail = element.thumbnail ? `${config.DOMAIN_BUCKET_AWS}${element.thumbnail}` : null;
        }

        return res.status(200).json({ data: users, total });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                company: true,
            }
        });

        return res.status(200).json({ data: user });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, lastname, email, password, role, companyId, cargo, rut, phone, thumbnail, thumbnail_format } = req.body;

        if (!name || !lastname || !email || !password || !rut || !phone) throw new Error('Faltan campos por completar');

        if (role !== 'user' && role === 'gestor' && role === 'admin') throw new Error('El rol no es válido');

        await prisma.user.findFirst({ where: { email } }).then((user) => { if (user) throw new Error('El email ya está en uso') });
        await prisma.user.findFirst({ where: { rut } }).then((user) => { if (user) throw new Error('El rut ya está en uso') });

        // password min 6 caracteres
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

        if (role === 'user') {
            if (!companyId) throw new Error('No se ha seleccionado una empresa');
            const company = await prisma.company.findUnique({ where: { id: Number(companyId) } });
            if (!company) throw new Error('La empresa no existe');
            if (!cargo) throw new Error('Falta el cargo');

            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash('123456', salt);

            await prisma.user.create({
                data: {
                    name,
                    lastname,
                    email,
                    password,
                    role,
                    companyId: Number(companyId),
                    cargo,
                    rut,
                    phone,
                }
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash('123456', salt);

            await prisma.user.create({
                data: {
                    name,
                    lastname,
                    email,
                    password,
                    role,
                    rut,
                    phone,
                }
            });
        }

        if (thumbnail && thumbnail !== '' && thumbnail_format && thumbnail_format !== '') {
            const upload = await UploadArchiveToS3(thumbnail, 'images/users', thumbnail_format);

            if (upload) {
                const last_user = await prisma.user.findFirst({ orderBy: { id: 'desc' } });
                await prisma.user.update({
                    where: { id: last_user?.id },
                    data: {
                        thumbnail: upload.path,
                    }
                });
            }
        }

        return res.status(200).json({ data: 'ok' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, lastname, email, password, cargo, rut, phone, thumbnail, thumbnail_format, active } = req.body;

        if (!name || !lastname || !email || !rut || !phone) throw new Error('Faltan campos por completar');

        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) throw new Error('El usuario no existe');

        await prisma.user.findFirst({ where: { email, id: { not: Number(id) } } }).then((user) => { if (user) throw new Error('El email ya está en uso') });
        await prisma.user.findFirst({ where: { rut, id: { not: Number(id) } } }).then((user) => { if (user) throw new Error('El rut ya está en uso') });

        if (password && password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

        if (user.role === 'user') {
            if (!cargo) throw new Error('Falta el cargo');

            await prisma.user.update({
                where: { id: Number(id) },
                data: {
                    name,
                    lastname,
                    email,
                    cargo,
                    rut,
                    phone,
                    active: active ? true : false,
                }
            });
        } else {
            await prisma.user.update({
                where: { id: Number(id) },
                data: {
                    name,
                    lastname,
                    email,
                    rut,
                    phone,
                    active: active ? true : false,
                }
            });
        }

        if (password && password !== '') {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            await prisma.user.update({
                where: { id: Number(id) },
                data: {
                    password: passwordHash,
                }
            });
        }

        if (thumbnail && thumbnail !== '' && thumbnail_format && thumbnail_format !== '') {
            const upload = await UploadArchiveToS3(thumbnail, 'images/users', thumbnail_format);

            if (upload) {
                await prisma.user.update({
                    where: { id: Number(id) },
                    data: {
                        thumbnail: upload.path,
                    }
                });
            }
        }

        return res.status(200).json({ data: 'ok' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const CleanRuts = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const rut = user.rut.replace(/\./g, '');
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    rut,
                }
            });
        }

        return res.status(200).json({ data: 'ok' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

// DATA TEST
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
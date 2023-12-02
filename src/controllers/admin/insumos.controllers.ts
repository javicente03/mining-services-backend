import { Request, Response } from 'express';
import config from '../../config';
import prisma from '../../utils/prismaClient';
import { UploadArchiveToS3 } from '../../utils/UploadArchiveToS3';

export const CreateInsumo = async (req: Request, res: Response) => {
    try {

        const { title, description, marca, modelo, nro_componente, stock, year, image, format_image } = req.body;

        if (!title || !description || !marca || !modelo || !nro_componente || !stock || !year) throw new Error('Faltan datos');
        if (!image || !format_image) throw new Error('Faltan datos');

        if (isNaN(Number(stock)) || isNaN(Number(year))) throw new Error('Los datos no son correctos');
        if (stock < 0 || year < 0) throw new Error('Los datos no son correctos');
        if (nro_componente < 0) throw new Error('Los datos no son correctos');

        if (title.trim() === '' || description.trim() === '' || marca.trim() === '' || modelo.trim() === '') throw new Error('Los datos no son correctos');

        const upload = await UploadArchiveToS3(image, 'images/insumos', format_image);
        if (!upload) throw new Error('Error al subir la imagen');
        
        await prisma.insumos.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                marca: marca.trim(),
                modelo: modelo.trim(),
                nro_componente,
                stock,
                year,
                image: upload.path
            }
        })

        return res.status(200).json({ message: 'Insumo creado correctamente' });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

export const UpdateInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, marca, modelo, nro_componente, stock, year, image, format_image } = req.body;

        if (!title || !description || !marca || !modelo || !nro_componente || !stock || !year) throw new Error('Faltan datos');

        if (isNaN(Number(stock)) || isNaN(Number(year))) throw new Error('Los datos no son correctos');
        if (stock < 0 || year < 0) throw new Error('Los datos no son correctos');
        if (nro_componente < 0) throw new Error('Los datos no son correctos');

        if (title.trim() === '' || description.trim() === '' || marca.trim() === '' || modelo.trim() === '') throw new Error('Los datos no son correctos');

        const insumo = await prisma.insumos.findUnique({ where: { id: Number(id) } });
        if (!insumo) throw new Error('El insumo no existe');
        if (insumo.deleted) throw new Error('El insumo ya fue eliminado');

        let upload: any = null;
        if (image && format_image) {
            upload = await UploadArchiveToS3(image, 'images/insumos', format_image);
            if (!upload) throw new Error('Error al subir la imagen');
        }


        await prisma.insumos.update({
            where: {
                id: Number(id)
            },
            data: {
                title: title.trim(),
                description: description.trim(),
                marca: marca.trim(),
                modelo: modelo.trim(),
                nro_componente,
                stock,
                year,
                image: upload ? upload.path : insumo.image
            }
        })

        return res.status(200).json({ message: 'Insumo actualizado correctamente' });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const DeleteInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const insumo = await prisma.insumos.findUnique({ where: { id: Number(id) } });
        if (!insumo) throw new Error('El insumo no existe');
        if (insumo.deleted) throw new Error('El insumo ya fue eliminado');

        await prisma.insumos.update({
            where: {
                id: Number(id)
            },
            data: {
                deleted: true
            }
        })

        return res.status(200).json({ message: 'Insumo eliminado correctamente' });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const GetInsumos = async (req: Request, res: Response) => {
    try {
        const { skip, limit, year, order, search } = req.query;

        const insumos = await prisma.insumos.findMany({
            where: {
                deleted: false,
                ...(year && { year: Number(year) }),
                ...(search && { 
                    OR: [
                        { title: { contains: search.toString() } },
                        { description: { contains: search.toString() } },
                        { marca: { contains: search.toString() } },
                        { modelo: { contains: search.toString() } },
                    ]
                })
            },
            skip: Number(skip) || 0,
            take: Number(limit) || undefined,
            orderBy: {
                ...(order && { id: order === 'asc' ? 'asc' : 'desc' })
            },
        })

        const total = await prisma.insumos.count({
            where: {
                deleted: false,
                ...(year && { year: Number(year) }),
                ...(search && { 
                    OR: [
                        { title: { contains: search.toString() } },
                        { description: { contains: search.toString() } },
                        { marca: { contains: search.toString() } },
                        { modelo: { contains: search.toString() } },
                    ]
                })
            }
        })

        for (let i = 0; i < insumos.length; i++) {
            const element = insumos[i];
            element.image = `${config.DOMAIN_BUCKET_AWS}${element.image}`;
        }

        return res.status(200).json({ data: insumos, total });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const GetInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const insumo = await prisma.insumos.findUnique({ where: { id: Number(id) } });
        if (!insumo) throw new Error('El insumo no existe');
        if (insumo.deleted) throw new Error('El insumo ya fue eliminado');

        insumo.image = `${config.DOMAIN_BUCKET_AWS}${insumo.image}`;

        return res.status(200).json({ data: insumo });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
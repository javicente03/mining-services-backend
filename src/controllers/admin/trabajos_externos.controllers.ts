import { Request, Response } from 'express'
import prisma from '../../utils/prismaClient';

export const GetTrabajosExternos = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;

        const ot = await prisma.solicitud.findUnique({ where: { id: Number(id) } });
        if (!ot) throw new Error('No se ha encontrado la OT');
        if (!ot.isOT) throw new Error('La solicitud no es una OT');

        const trabajosExternos = await prisma.trabajo_Externo_OT.findMany({
            where: {
                otId: Number(id)
            },
            include: {
                items: true
            },
            orderBy: {
                id: 'desc'
            }
        });

        return res.status(200).json({ data: trabajosExternos });

    } catch (error: any) {
        return res.status(400).json({ error: error.message })
    }
}

export const PostTrabajoExterno = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;
        const { type, code_type, items } = req.body;

        if (!type || !code_type) throw new Error('Tipo de trabajo externo inválido');        
        if (!items || items.length === 0) throw new Error('No se ha enviado información de los trabajos externos');

        const ot = await prisma.solicitud.findUnique({ where: { id: Number(id) } });
        if (!ot) throw new Error('No se ha encontrado la OT');
        if (!ot.isOT) throw new Error('La solicitud no es una OT');

        // Si text esta vacio, se da error
        if (items.find((item: any) => !item.text)) throw new Error('No se ha enviado información de los trabajos externos');
        if (items.find((item: any) => item.text.trim() === '')) throw new Error('No se ha enviado información de los trabajos externos');

        const there =  await prisma.trabajo_Externo_OT.findFirst({
            where: {
                otId: Number(id),
                code_type: code_type
            }
        });

        if (there) {
            await prisma.trabajo_Externo_Item.deleteMany({
                where: {
                    trabajoExternoId: there.id
                }
            });
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item.code || !item.name || !item.text) continue;                
                await prisma.trabajo_Externo_Item.create({
                    data: {
                        trabajoExternoId: there.id,
                        code: item.code,
                        name: item.name,
                        text: item.text,
                    }
                });
            }
        } else {
            const newTrabajoExterno = await prisma.trabajo_Externo_OT.create({
                data: {
                    type: type,
                    code_type: code_type,
                    otId: Number(id)
                }
            });
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item.code || !item.name || !item.text) continue;                
                await prisma.trabajo_Externo_Item.create({
                    data: {
                        trabajoExternoId: newTrabajoExterno.id,
                        code: item.code,
                        name: item.name,
                        text: item.text,
                    }
                });
            }
        }

        return res.status(200).json({ message: 'Trabajo externo actualizado correctamente' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message })
    }
}
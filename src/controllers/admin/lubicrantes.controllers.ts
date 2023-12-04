import { Request, Response } from "express";
import prisma from "../../utils/prismaClient";

export const GetLubricantesOT = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;

        const ot = await await prisma.solicitud.findUnique({ where: { id: Number(id) } });
        if (!ot) throw new Error("La OT no existe");
        if (!ot.isOT) throw new Error("La solicitud no es una OT");

        const lubcricantes = await prisma.lubicrantes_OT.findMany({
            where: {
                otId: Number(id)
            },
        });

        return res.json({ data: lubcricantes });

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const CheckLubricante = async (req: Request, res: Response) => {
    try {
        
        const { code, name, otId } = req.body;

        if (!code || !name || !otId) throw new Error("Faltan datos");

        const ot = await await prisma.solicitud.findUnique({ where: { id: Number(otId) }, include: { lubricantes_ot: true } });
        if (!ot) throw new Error("La OT no existe");

        if (ot.lubricantes_ot.find((l) => l.code === code)) {
            await prisma.lubicrantes_OT.deleteMany({
                where: {
                    code: code
                }
            })
        } else {
            await prisma.lubicrantes_OT.create({
                data: {
                    code: code,
                    name: name,
                    otId: otId
                }
            })
        }

        return res.json({ message: "Lubricante actualizado" });

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

export const UpdateLtsLubricante = async (req: Request, res: Response) => {
    try {
        
        const { code, lts, id } = req.body;

        if (!code || !lts) throw new Error("Faltan datos");

        const lub = await prisma.lubicrantes_OT.findFirst({ where: { code: code, otId: Number(id) } });
        if (!lub) throw new Error("El lubricante no ha sido agregado a la OT");

        if (isNaN(Number(lts))) throw new Error("Los litros deben ser un número");
        if (Number(lts) < 0) throw new Error("Los litros deben ser mayor a 0");

        await prisma.lubicrantes_OT.updateMany({
            where: {
                code: code,
                otId: Number(id)
            },
            data: {
                lts: Number(lts)
            }
        })

        return res.json({ message: "Lubricante actualizado" });
        

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
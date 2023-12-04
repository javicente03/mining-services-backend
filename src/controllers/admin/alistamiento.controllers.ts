import { Request, Response } from "express";
import prisma from "../../utils/prismaClient";

export const GetAlistamientoOT = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;

        const ot = await await prisma.solicitud.findUnique({ where: { id: Number(id) } });
        if (!ot) throw new Error("La OT no existe");
        if (!ot.isOT) throw new Error("La solicitud no es una OT");

        const alistamiento = await prisma.alistamiento_OT.findMany({
            where: {
                otId: Number(id)
            },
        });

        return res.json({ data: alistamiento });

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const CheckAlistamiento = async (req: Request, res: Response) => {
    try {
        
        const { code, name, otId } = req.body;

        if (!code || !name || !otId) throw new Error("Faltan datos");

        const ot = await await prisma.solicitud.findUnique({ where: { id: Number(otId) }, include: { alistamiento_ot: true } });
        if (!ot) throw new Error("La OT no existe");

        if (ot.alistamiento_ot.find((l) => l.code === code)) {
            await prisma.alistamiento_OT.deleteMany({
                where: {
                    code: code
                }
            })
        } else {
            await prisma.alistamiento_OT.create({
                data: {
                    code: code,
                    name: name,
                    otId: otId
                }
            })
        }

        return res.json({ message: "Alistamiento actualizado" });

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
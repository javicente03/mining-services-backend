import prisma from "../../utils/prismaClient";
import { Request, Response } from "express";

export const GetTiposComponentes = async (req: Request, res: Response) => {
    try {
        const tiposComponentes = await prisma.opciones_Componente_Solicitud.findMany({
            where: {
                componente_solicitud: {
                    name: 'Tipo de Componente'
                }
            }
        });

        return res.status(200).json({ data: tiposComponentes });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
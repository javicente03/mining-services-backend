import { Request, Response } from "express";
import prisma from "../../utils/prismaClient";

export const GetSolicitudes = async (req: Request, res: Response) => {
    try {
        
        const { skip, limit } = req.query;

        const requests = await prisma.solicitud.findMany({
            include: {
                tipos_trabajos_solicitud: {
                    select: {
                        description: true,
                        tipoTrabajoId: true,
                        tipoTrabajo: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        name: true,
                        lastname: true,
                        email: true,
                        rut: true,
                        id: true
                    }
                }
            },
            skip: skip ? Number(skip) : 0,
            take: limit ? Number(limit) : 0,
            orderBy: {
                id: 'desc'
            }
        })

        const total = await prisma.solicitud.count()

        return res.json({ data: requests, total: total })

    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}

export const GetSolicitud = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;

        const request = await prisma.solicitud.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                tipos_trabajos_solicitud: {
                    select: {
                        description: true,
                        tipoTrabajoId: true,
                        tipoTrabajo: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        name: true,
                        lastname: true,
                        email: true,
                        rut: true,
                        id: true
                    }
                }
            }
        })

        return res.json({ data: request })

    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}

export const ResponseSolicitud = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;
        const { response } = req.body;

        if (response !== 'approved' && response !== 'rejected') throw new Error('La respuesta debe ser aprobada o rechazada')

        const request = await prisma.solicitud.findUnique({
            where: {
                id: Number(id)
            }
        })

        if (!request) throw new Error('Solicitud no encontrada')
        if (request.status !== 'pending') throw new Error('La solicitud ya fue atendida')

        await prisma.solicitud.update({
            where: {
                id: Number(id)
            },
            data: {
                status: response
            }
        })

        return res.json({ message: 'Solicitud atendida', status: response })

    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}
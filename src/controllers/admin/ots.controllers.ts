import { Request, Response } from 'express'
import prisma from '../../utils/prismaClient'

// OT's methods --------------------------------------------------------------------------------------------
export const GetOTs = async (req: Request, res: Response) => {
    try {
        const { skip, limit } = req.query;

        const requests = await prisma.solicitud.findMany({
            where: { status_ot: { not: null } },
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
                equipo_trabajo_solicitud: {
                    select: {
                        description: true,
                        equipoTrabajoId: true,
                        equipoTrabajo: {
                            select: {
                                name: true, type_field: true
                            }
                        },
                        idOpcion: true,
                        opcion: { select: { name: true } }
                    }
                },
                componente_solicitud: {
                    select: {
                        description: true,
                        componenteId: true,
                        componente: {
                            select: {
                                name: true, type_field: true
                            }
                        },
                        idOpcion: true,
                        opcion: { select: { name: true } }
                    }
                },
                servicio_terreno_solicitud: {
                    select: {
                        description: true,
                        servicioTerrenoId: true,
                        servicioTerreno: {
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
                },
                motivo_rechazo_solicitud: true
            },
            skip: skip ? Number(skip) : 0,
            take: limit ? Number(limit) : undefined,
            orderBy: {
                id: 'desc'
            }
        })

        const total = await prisma.solicitud.count({ where: { status_ot: { not: null } } })

        return res.json({ data: requests, total })

    } catch (error: any) {
        return res.status(400).json({error: error.message})   
    }
}
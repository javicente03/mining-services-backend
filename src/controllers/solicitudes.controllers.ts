import { Request, Response } from "express";
import ObtainUser from "../utils/obtainUser";
import prisma from "../utils/prismaClient";

export const CreateSolicitud = async (req: Request, res: Response) => {
    try {
        const {
            works, description
        } = req.body;
        const idUser = await ObtainUser(req);
        const user = await prisma.user.findUnique({ where: { id: idUser.id } });

        if (!user) throw new Error("Usuario no encontrado");
        if (!works) throw new Error("Debe enviar los trabajos a realizar");
        if (!description || description.trim() === "") throw new Error("Debe enviar una descripción de la solicitud");

        if (!Array.isArray(works)) throw new Error("Debe enviar un arreglo de trabajos");
        if (works.length === 0) throw new Error("Debe enviar al menos un trabajo");

        const solicitud = await prisma.solicitud.create({
            data: {
                description: description.trim(),
                userId: user.id
            }
        });

        for (let i = 0; i < works.length; i++) {

            const work = works[i];
            if (!work.id) continue;
            if (!work.description || work.description.trim() === "") continue;

            const type = await prisma.tipos_Trabajos_Solicitud.findUnique({ where: { id: works[i].id } });
            if (!type) continue;

            await prisma.solicitud_Tipos_Trabajos.create({
                data: {
                    description: work.description,
                    solicitudId: solicitud.id,
                    tipoTrabajoId: type.id
                }
            });
        }

        const newSolicitud = await prisma.solicitud.findFirst({
            where: {
                id: solicitud.id
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
            }
        })

        return res.status(200).json({ message: "Solicitud creada correctamente", solicitud: newSolicitud });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const GetSolicitudes = async (req: Request, res: Response) => {
    try {
        const { skip, limit } = req.query;
        const idUser = await ObtainUser(req);
        const user = await prisma.user.findUnique({ where: { id: idUser.id } })

        if (!user) throw new Error("Usuario no encontrado");

        const requests = await prisma.solicitud.findMany({
            where: {
                userId: user.id
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
            },
            skip: skip ? Number(skip) : 0,
            take: limit ? Number(limit) : 0,
            orderBy: {
                id: 'desc'
            }
        })

        const total = await prisma.solicitud.count({
            where: {
                userId: idUser.id
            },
        })

        return res.json({
            data: requests, total: total
        })

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const GetSolicitud = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idUser = await ObtainUser(req);
        const user = await prisma.user.findUnique({ where: { id: idUser.id } })

        if (!user) throw new Error("Usuario no encontrado");

        const request = await prisma.solicitud.findFirst({
            where: {
                id: Number(id),
                userId: user.id
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
            }
        })

        if (!request) throw new Error("Solicitud no encontrada");

        return res.json({
            data: request
        })

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

// Retornar los tipos de trabajos disponibles
export const GetTiposTrabajos = async (req: Request, res: Response) => {
    try {
        const tiposTrabajos = await prisma.tipos_Trabajos_Solicitud.findMany({
            where: { deleted: false }
        });
        return res.status(200).json({ data: tiposTrabajos });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const GetFormEquipos = async (req: Request, res: Response) => {
    try {
        const equipos = await prisma.equipo_Trabajo_Solicitud.findMany({ where: { deleted: false } });

        return res.status(200).json({ data: equipos });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const GetFormComponentes = async (req: Request, res: Response) => {
    try {
        const componentes = await prisma.componente_Solicitud.findMany({ where: { deleted: false }, include: { opciones_componente_solicitud: {
            where: { deleted: false }
        } } });

        return res.status(200).json({ data: componentes });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const GetFormServiciosTerreno = async (req: Request, res: Response) => {
    try {
        const servicios = await prisma.servicio_Terreno_Solicitud.findMany({ where: { deleted: false } });

        return res.status(200).json({ data: servicios });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

// TEST CREATE
export const CreateTestTypes = async (req: Request, res: Response) => {
    try {
        const tiposTrabajos = await prisma.tipos_Trabajos_Solicitud.createMany({
            data: [
                {
                    name: "Soldadura",
                },
                {
                    name: "Rectificado",
                },
                {
                    name: "Fresado",
                },
                {
                    name: "Relleno y rectificado",
                },
                {
                    name: "Tornería",
                },
                {
                    name: "Confeción de piezas",
                },
                {
                    name: "Pulido",
                },
                {
                    name: "Extracción de pernos",
                },
            ]
        });

        return res.status(200).json({ message: "Tipos de trabajos creados correctamente" });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const CreateEquiposTest = async (req: Request, res: Response) => {
    try {
        const equipos = await prisma.equipo_Trabajo_Solicitud.createMany({
            data: [
                {
                    name: 'Marca',
                },
                {
                    name: 'Modelo',
                },
                {
                    name: 'Serie',
                },
                {
                    name: 'N° Interno',
                },
                {
                    name: 'N° Interno del Cliente',
                },
                {
                    name: 'Horometro',
                }
            ]
        });

        return res.status(200).json({ message: "Equipos creados correctamente" });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const CreateComponentesTest = async (req: Request, res: Response) => {
    try {
        const componentes = await prisma.componente_Solicitud.createMany({
            data: [
                {
                    name: 'Marca',
                },
                {
                    name: 'Tipo de Componente',
                    type_field: 'select',
                },
                {
                    name: 'Serie',
                },
                {
                    name: 'N° Interno',
                },
                {
                    name: 'N° Interno del Cliente',
                },
            ]
        });

        const field_type = await prisma.componente_Solicitud.findFirst({ where: { name: 'Tipo de Componente' } });

        const tiposComponentes = await prisma.opciones_Componente_Solicitud.createMany({
            data: [
                {
                    name: 'Motor',
                    componente_solicitudId: field_type?.id
                },
                {
                    name: 'Convertidor',
                    componente_solicitudId: field_type?.id
                },
                {
                    name: 'Transmisión',
                    componente_solicitudId: field_type?.id
                },
                {
                    name: 'Eje Diferencial Delantero',
                    componente_solicitudId: field_type?.id
                },
                {
                    name: 'Eje Diferencial Trasero',
                    componente_solicitudId: field_type?.id
                },
                {
                    name: 'Mando Final',
                    componente_solicitudId: field_type?.id
                }
            ]
        });

        return res.status(200).json({ message: "Componentes creados correctamente" });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const CreateServicioTerrenoTest = async (req: Request, res: Response) => {
    try {
        const servicios = await prisma.servicio_Terreno_Solicitud.createMany({
            data: [
                {
                    name: 'Diagnóstico de fallas',
                },
                {
                    name: 'Testeo Instrumental',
                },
                {
                    name: 'Mantención',
                },
                {
                    name: 'Otros'
                }
            ]
        });

        return res.status(200).json({ message: "Servicios creados correctamente" });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
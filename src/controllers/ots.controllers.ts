import { Request, Response } from 'express';import config from '../config';
import ObtainUser from '../utils/obtainUser';
import prisma from '../utils/prismaClient';

export const GetMyOts = async (req: Request, res: Response) => {
    try {
        const idUser = await ObtainUser(req);
        const usuario = await prisma.user.findUnique({ where: { id: idUser.id } });

        const { skip, limit } = req.query;

        if (!usuario) throw new Error('Usuario no encontrado');

        const ots = await prisma.solicitud.findMany({
            where: {
                userId: idUser.id,
                isOT: true,
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
                motivo_rechazo_solicitud: true,
                presupuestoOt: true,
                registro_fotografico_solicitud: true,
                user: {
                    select: {
                        name: true,
                        lastname: true,
                        rut: true,
                        email: true,
                        phone: true,
                        thumbnail: true,
                    }
                },
                ot_actividades_relation: {
                    where: {
                        deleted: false
                    },
                    include: {
                        actividad: true,
                        otSubActividadesRelation: {
                            include: {
                                subActividad: true
                            }
                        }
                    }
                },
                tecnicos_ot: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                lastname: true,
                                thumbnail: true,
                                rut: true,
                                email: true,
                                cargo: true,
                            }
                        }
                    }
                }
            },
            skip: skip ? Number(skip) : 0,
            take: limit ? Number(limit) : undefined,
            orderBy: {
                id: 'desc',
            },
        });

        for (let i = 0; i < ots.length; i++) {
            const request = ots[i];
            if (request.registro_fotografico_solicitud) {
                for (let j = 0; j < request.registro_fotografico_solicitud.length; j++) {
                    const img = request.registro_fotografico_solicitud[j];
                    img.url = `${config.DOMAIN_BUCKET_AWS}${img.url}`
                }
            }

            if (request.user) {
                request.user.thumbnail = request.user.thumbnail ? `${config.DOMAIN_BUCKET_AWS}${request.user.thumbnail}` : null;
            }

            for (let j = 0; j < request.tecnicos_ot.length; j++) {
                const tec = request.tecnicos_ot[j];
                if (tec.user) {
                    tec.user.thumbnail = tec.user.thumbnail ? `${config.DOMAIN_BUCKET_AWS}${tec.user.thumbnail}` : null;
                }
            }
        } 

        const total = await prisma.solicitud.count({ where: { userId: idUser.id, isOT: true } });

        return res.status(200).json({ data: ots, total });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const GetMyOtById = async (req: Request, res: Response) => {
    try {
        const idUser = await ObtainUser(req);
        const usuario = await prisma.user.findUnique({ where: { id: idUser.id } });

        const { id } = req.params;

        if (!usuario) throw new Error('Usuario no encontrado');

        const ot = await prisma.solicitud.findUnique({
            where: {
                id: Number(id),
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
                motivo_rechazo_solicitud: true,
                presupuestoOt: true,
                registro_fotografico_solicitud: true,
            },
        });

        if (!ot) throw new Error('OT no encontrada');

        if (ot.userId !== idUser.id) throw new Error('No tienes permisos para ver esta OT');

        if (ot.registro_fotografico_solicitud) {
            for (let j = 0; j < ot.registro_fotografico_solicitud.length; j++) {
                const img = ot.registro_fotografico_solicitud[j];
                img.url = `${config.DOMAIN_BUCKET_AWS}${img.url}`
            }
        }

        return res.status(200).json({ data: ot });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
import { Request, Response } from "express";
import config from "../../config";
import EmailSender from "../../helpers/email/sendEmail";
import { EmailSolicitudRechazadaTemplate } from "../../helpers/email/templates";
import prisma from "../../utils/prismaClient";

export const GetSolicitudes = async (req: Request, res: Response) => {
    try {
        
        const { skip, limit } = req.query;

        const requests = await prisma.solicitud.findMany({
            where: { status_ot: null },
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
                motivo_rechazo_solicitud: true,
                registro_fotografico_solicitud: true,
            },
            skip: skip ? Number(skip) : 0,
            take: limit ? Number(limit) : undefined,
            orderBy: {
                id: 'desc'
            }
        })

        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            if (request.registro_fotografico_solicitud) {
                for (let j = 0; j < request.registro_fotografico_solicitud.length; j++) {
                    const img = request.registro_fotografico_solicitud[j];
                    img.url = `${config.DOMAIN_BUCKET_AWS}${img.url}`
                }
            }
        }

        const total = await prisma.solicitud.count({ where: { status_ot: null } })

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
                motivo_rechazo_solicitud: true,
                registro_fotografico_solicitud: true,
            }
        })

        if (!request) throw new Error('Solicitud no encontrada')

        if (request.registro_fotografico_solicitud) {
            for (let i = 0; i < request.registro_fotografico_solicitud.length; i++) {
                const img = request.registro_fotografico_solicitud[i];
                img.url = `${config.DOMAIN_BUCKET_AWS}${img.url}`
            }
        }

        return res.json({ data: request })

    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}

export const ResponseSolicitud = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;
        const { response, motivo } = req.body;

        if (response !== 'approved' && response !== 'rejected') throw new Error('La respuesta debe ser aprobada o rechazada')

        if (response === 'rejected' && (!motivo || motivo.trim() === '')) throw new Error('Debe ingresar un motivo de rechazo')

        const request = await prisma.solicitud.findUnique({
            where: {
                id: Number(id)
            }, include: { user: true }
        })

        if (!request) throw new Error('Solicitud no encontrada')
        if (request.isOT) throw new Error('La solicitud ya fue convertida en OT')
        if (request.status !== 'pending') throw new Error('La solicitud ya fue atendida')

        await prisma.solicitud.update({
            where: {
                id: Number(id)
            },
            data: {
                status: response,
                status_ot: response === 'approved' ? 'pending' : null,
                // isOT: response === 'approved' ? true : false
            }
        })

        if (response === 'rejected') {
            await prisma.motivo_Rechazo_Solicitud.create({ data: { description: motivo.trim(), solicitudId: Number(id) } })

            const html = EmailSolicitudRechazadaTemplate(request)
            const dataEmail: Models.Email = {
                to: request.user?.email || 'javicentego@gmail.com',
                subject: 'Mining Service - Solicitud rechazada',
                html,
                from: config.SMTP_FROM || '',
                text: 'Mining Service - Solicitud rechazada'
            }
            await EmailSender(dataEmail);
        }

        return res.json({ message: 'Solicitud atendida', status: response })

    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}
import { Request, Response } from 'express'
import config from '../../config';
import EmailSender from '../../helpers/email/sendEmail';
import { EmailSolicitudAprobadaPresupuestoTemplate, EmailSolicitudRechazadaTemplate } from '../../helpers/email/templates';
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
                motivo_rechazo_solicitud: true,
                presupuestoOt: true,
                motivo_rechazo_solicitud_cliente: true,
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

        const total = await prisma.solicitud.count({ where: { status_ot: { not: null } } })

        return res.json({ data: requests, total })

    } catch (error: any) {
        return res.status(400).json({error: error.message})   
    }
}

export const GetOT = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const request = await prisma.solicitud.findUnique({
            where: { id: Number(id) },
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
                presupuestoOt: true,
                motivo_rechazo_solicitud_cliente: true,
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

export const AssingBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, date, cost, motivo_rechazo, lavado, evaluacion, desarme_evaluacion, informe_tecnico, tipo_componente } = req.body;

        if (status !== 'approved' && status !== 'rejected') throw new Error('Estado no válido')
        // La fecha debe ser mayor o igual a la fecha actual

        const ot = await prisma.solicitud.findUnique({ where: { id: Number(id) }, include: { user: true } })
        if (ot?.status === 'pending') throw new Error('Solicitud no ha sido aprobada para asignar presupuesto')
        if (ot?.status === 'rejected') throw new Error('La solicitud fue rechazada')
        
        if (status === 'approved') {
            // el costo debe ser mayor a 0 y numero
            if (isNaN(cost) || cost <= 0) throw new Error('Costo no válido')

            if (ot?.presupuestoOtId) {
                await prisma.presupuesto_OT.delete({ where: { id: ot.presupuestoOtId } })
            }
            if (!date) throw new Error('Fecha no válida')
            if (new Date(date) < new Date()) throw new Error('Fecha no válida')
            if (!informe_tecnico || informe_tecnico.trim().length === 0) throw new Error('Informe técnico no válido')

            const budget = await prisma.presupuesto_OT.create({
                data: {
                    tipo_componente,
                    lavado: lavado ? true : false,
                    cost: Number(cost),
                    date: new Date(date),
                    desarme_evaluacion: desarme_evaluacion ? true : false,
                    evaluacion: evaluacion ? true : false,
                    informe_tecnico,
                }
            })

            await prisma.solicitud.update({ where: { id: Number(id) }, data: { presupuestoOtId: budget.id, status_ot: 'approved' } })

            const html = EmailSolicitudAprobadaPresupuestoTemplate(ot)
            const emailData: Models.Email = {
                from: config.SMTP_FROM || '',
                to: ot?.user?.email || 'javicentego@gmail.com',
                subject: 'Mining Service - Solicitud aprobada',
                html,
                text: 'Mining Service - Solicitud aprobada'
            }
            await EmailSender(emailData);
        } else {
            if (!motivo_rechazo) throw new Error('Motivo no válido')
            if (ot?.presupuestoOtId) {
                await prisma.presupuesto_OT.delete({ where: { id: ot.presupuestoOtId } })
            }
            const budget = await prisma.presupuesto_OT.create({
                data: {
                    motivo_rechazo: motivo_rechazo,
                }
            })

            await prisma.solicitud.update({ where: { id: Number(id) }, data: { presupuestoOtId: budget.id, status: 'rejected', status_ot: 'rejected' } })
            
            const html = EmailSolicitudRechazadaTemplate(ot)
            const emailData: Models.Email = {
                from: config.SMTP_FROM || '',
                to: ot?.user?.email || 'javicentego@gmail.com',
                subject: 'Mining Service - Solicitud rechazada',
                html,
                text: 'Mining Service - Solicitud rechazada'
            }
            await EmailSender(emailData);
        }
        
        return res.json({ message: 'Presupuesto asignado correctamente' })

    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}
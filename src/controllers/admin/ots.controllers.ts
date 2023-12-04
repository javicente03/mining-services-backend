import { Request, Response } from 'express'
import config from '../../config';
import EmailSender from '../../helpers/email/sendEmail';
import { EmailNuevaOTGeneradaAdminTemplate, EmailOTAprobadaPresupuestoTemplate, EmailSolicitudAprobadaClientePresupuestoTemplate, EmailSolicitudAprobadaPresupuestoTemplate, EmailSolicitudRechazadaClientePresupuestoTemplate, EmailSolicitudRechazadaTemplate } from '../../helpers/email/templates';
import ObtainUser from '../../utils/obtainUser';
import prisma from '../../utils/prismaClient'
import { UploadArchiveToS3 } from '../../utils/UploadArchiveToS3';

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
                        id: true,
                        thumbnail: true
                    }
                },
                motivo_rechazo_solicitud: true,
                presupuestoOt: true,
                motivo_rechazo_solicitud_cliente: true,
                registro_fotografico_solicitud: true,
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
                tecnicos_ot: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                lastname: true,
                                email: true,
                                id: true
                            }
                        }
                    }
                },
                motivo_rechazo_solicitud: true,
                presupuestoOt: true,
                motivo_rechazo_solicitud_cliente: true,
                registro_fotografico_solicitud: true,
                insumos_ot: {
                    include: {
                        insumo: true
                    }
                },
                lubricantes_ot: true,
                alistamiento_ot: true,
                trabajo_externo_ot: true,
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
        const { status, date, cost, motivo_rechazo, lavado, evaluacion, desarme_evaluacion, informe_tecnico, tipo_componenteId } = req.body;

        if (status !== 'approved' && status !== 'rejected') throw new Error('Estado no válido')
        if (status === 'approved') {
            if (!tipo_componenteId || isNaN(Number(tipo_componenteId))) throw new Error('Tipo de componente no válido')
            const tipo_componente = await prisma.opciones_Componente_Solicitud.findUnique({ where: { id: Number(tipo_componenteId) } })
            if (!tipo_componente) throw new Error('Tipo de componente no encontrado')
        }
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
                    tipo_componenteId: status === 'approved' ? Number(tipo_componenteId) : null,
                    lavado: lavado ? true : false,
                    cost: Number(cost),
                    date: new Date(date),
                    desarme_evaluacion: desarme_evaluacion ? true : false,
                    evaluacion: evaluacion ? true : false,
                    informe_tecnico,
                }
            })

            await prisma.solicitud.update({ where: { id: Number(id) }, data: { presupuestoOtId: budget.id, status_ot: 'approved' } })

            let html = ''
            if (ot?.createdByAdmin) {
                html = EmailOTAprobadaPresupuestoTemplate(ot)
            } else {
                html = EmailSolicitudAprobadaPresupuestoTemplate(ot)
            }

            const emailData: Models.Email = {
                from: config.SMTP_FROM || '',
                to: ot?.user?.email || 'javicentego@gmail.com',
                subject: ot?.createdByAdmin ? 'Mining Service - Presupuesto Asignado' : 'Mining Service - Solicitud aprobada',
                html,
                text: ot?.createdByAdmin ? 'Mining Service - Presupuesto Asignado' : 'Mining Service - Solicitud aprobada'
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

export const CreateOt0 = async (req: Request, res: Response) => {
    try {
        const {
            works, description, form_equipos, form_components, form_terreno, type_work, img, img_format, companyId, userId, fecha_ingreso, numero_gd
        } = req.body;
        const idUser = await ObtainUser(req);

        if (!companyId || isNaN(Number(companyId))) throw new Error('Empresa no válida')
        if (!userId || isNaN(Number(userId))) throw new Error('Usuario no válido')
        const company = await prisma.company.findUnique({ where: { id: Number(companyId) } })
        if (!company) throw new Error('Empresa no encontrada')
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } })
        if (!user) throw new Error('Usuario no encontrado')
        if (user.companyId !== Number(companyId)) throw new Error('Usuario no pertenece a la empresa')

        // fecha_ingreso debe ser mayor o igual a la fecha actual
        if (!fecha_ingreso) throw new Error('Fecha no válida')
        if (new Date(fecha_ingreso) < new Date()) throw new Error('Fecha no válida')
        // numero_gd debe ser obligatorio
        if (!numero_gd) throw new Error('Número GD no válido')

        if (!works) throw new Error("Debe enviar los trabajos a realizar");
        if (!description || description.trim() === "") throw new Error("Debe enviar una descripción de la solicitud");

        if (type_work !== 'equipo' && type_work !== 'maestranza' && type_work !== 'componente' && type_work !== 'servicio_terreno' && type_work !== 'null') throw new Error("Debe enviar un tipo de trabajo válido");

        // Tipo de trabajo: Equipo ----------------------------------------------
        if (type_work === 'equipo') {
            if (!img) throw new Error("Debe enviar una imagen");
            if (!img_format) throw new Error("Debe enviar el formato de la imagen");

            if (!form_equipos) throw new Error("Data inválida");
            if (!Array.isArray(form_equipos)) throw new Error("Data inválida");
            const fields = await prisma.equipo_Trabajo_Solicitud.findMany({ where: { deleted: false }, include: { opciones_equipo_trabajo_solicitud: { where: { deleted: false } } } });

            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];

                // Si no existe el campo en la data enviada
                if (!form_equipos.find((item: any) => item.id === field.id)) throw new Error(`No se envio información del campo ${field.name}`);
                if (field.type_field === 'text') {
                    // Si existe el campo pero no tiene valor o el valor está vacío
                    if (!form_equipos.find((item: any) => item.id === field.id).description || form_equipos.find((item: any) => item.id === field.id).description.trim() === "") throw new Error(`Debe enviar una descripción para el campo ${field.name}`);
                } else if (field.type_field === 'select') {
                    // Si existe el campo pero no tiene valor o el valor no es un número
                    if (!form_equipos.find((item: any) => item.id === field.id).opcion_componente_solicitud_id || isNaN(form_equipos.find((item: any) => item.id === field.id).opcion_componente_solicitud_id)) throw new Error(`Debe enviar una opción válida para el campo ${field.name}`);
                    // Si el valor no existe en la base de datos
                    let value_opt = Number(form_equipos.find((item: any) => item.id === field.id).opcion_componente_solicitud_id);
                    if (!field.opciones_equipo_trabajo_solicitud.find((item: any) => item.id === value_opt)) throw new Error(`Debe enviar una opción válida para el campo ${field.name}`);
                }
            }
        }

        // Tipo de trabajo: Componente ----------------------------------------------
        if (type_work === 'componente') {
            if (!img) throw new Error("Debe enviar una imagen");
            if (!img_format) throw new Error("Debe enviar el formato de la imagen");

            if (!form_components) throw new Error("Data inválida");
            if (!Array.isArray(form_components)) throw new Error("Data inválida");
            const fields = await prisma.componente_Solicitud.findMany({ where: { deleted: false }, include: { opciones_componente_solicitud: { where: { deleted: false } } } });

            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];

                // Si no existe el campo en la data enviada
                if (!form_components.find((item: any) => item.id === field.id)) throw new Error(`No se envio información del campo ${field.name}`);
                if (field.type_field === 'text') {
                    // Si existe el campo pero no tiene valor o el valor está vacío
                    if (!form_components.find((item: any) => item.id === field.id).description || form_components.find((item: any) => item.id === field.id).description.trim() === "") throw new Error(`Debe enviar una descripción para el campo ${field.name}`);
                } else if (field.type_field === 'select') {
                    // Si existe el campo pero no tiene valor o el valor no es un número
                    if (!form_components.find((item: any) => item.id === field.id).opcion_componente_solicitud_id || isNaN(form_components.find((item: any) => item.id === field.id).opcion_componente_solicitud_id)) throw new Error(`Debe enviar una opción válida para el campo ${field.name}`);
                    // Si el valor no existe en la base de datos
                    let value_opt = Number(form_components.find((item: any) => item.id === field.id).opcion_componente_solicitud_id);
                    if (!field.opciones_componente_solicitud.find((item: any) => item.id === value_opt)) throw new Error(`Debe enviar una opción válida para el campo ${field.name}`);
                }
            }
        }

        const solicitud = await prisma.solicitud.create({
            data: {
                description: description.trim(),
                userId: user.id,
                type_work: type_work,
                status: 'approved',
                status_ot: 'pending',
                fecha_ingreso: new Date(fecha_ingreso),
                numero_gd: numero_gd,
                createdByAdmin: true,
                createdById: idUser.id
            }
        });

        // Tipo de trabajo: Equipo ----------------------------------------------
        if (type_work === 'equipo') {
            for (let i = 0; i < form_equipos.length; i++) {
                const field = form_equipos[i];
                await prisma.solicitud_Equipo_Trabajo.create({
                    data: {
                        description: field.type_field === 'text' ? field.description : '',
                        solicitudId: solicitud.id,
                        equipoTrabajoId: field.id,
                        idOpcion: field.type_field === 'select' ? field.opcion_componente_solicitud_id : null
                    }
                });
            }

            const upload = await UploadArchiveToS3(img, 'images/ot/' + solicitud.id, img_format);
            if (upload) {
                await prisma.registro_Fotografico_Solicitud.create({ 
                    data: {
                        solicitudId: solicitud.id,
                        url: upload.path
                    }
                });
            }
        }

        // Tipo de trabajo: Componente ----------------------------------------------
        if (type_work === 'componente') {
            for (let i = 0; i < form_components.length; i++) {
                const field = form_components[i];
                await prisma.solicitud_Componente.create({
                    data: {
                        description: field.type_field === 'text' ? field.description : '',
                        solicitudId: solicitud.id,
                        componenteId: field.id,
                        idOpcion: field.type_field === 'select' ? field.opcion_componente_solicitud_id : null
                    }
                });
            }

            const upload = await UploadArchiveToS3(img, 'images/ot/' + solicitud.id, img_format);
            if (upload) {
                await prisma.registro_Fotografico_Solicitud.create({ 
                    data: {
                        solicitudId: solicitud.id,
                        url: upload.path
                    }
                });
            }
        }

        // Tipo de trabajo: Maestranza ----------------------------------------------
        if (type_work === 'maestranza') {
            if (!Array.isArray(works)) throw new Error("Debe enviar un arreglo de trabajos");
            if (works.length === 0) throw new Error("Debe enviar al menos un trabajo");
    
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
        }

        // Tipo de trabajo: Servicio de terreno ----------------------------------------------
        if (type_work === 'servicio_terreno') {
            if (!form_terreno) throw new Error("Data inválida");
            if (!Array.isArray(form_terreno)) throw new Error("Data inválida");
            
            for (let i = 0; i < form_terreno.length; i++) {

                const field = form_terreno[i];
                if (!field.id) continue;
                if (!field.description || field.description.trim() === "") continue;

                const type = await prisma.servicio_Terreno_Solicitud.findUnique({ where: { id: field.id } });
                if (!type) continue;

                await prisma.solicitud_Servicio_Terreno.create({
                    data: {
                        description: field.description,
                        solicitudId: solicitud.id,
                        servicioTerrenoId: type.id
                    }
                });
            }
        }

        const newSolicitud = await prisma.solicitud.findFirst({
            where: {
                id: solicitud.id
            },
            include: {
                user: true,
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
                }
            }
        })

        const html = EmailNuevaOTGeneradaAdminTemplate(newSolicitud);
        const emailData: Models.Email = {
            from: config.SMTP_FROM || '',
            to: user.email,
            html: html,
            subject: 'Mining Service - Nueva OT',
            text: 'Mining Service - Nueva OT'
        }

        await EmailSender(emailData);

        return res.status(200).json({ message: "OT creada correctamente", solicitud: newSolicitud });

    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}

export const ChangeDateBeginEnd = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { date_begin, date_end } = req.body;

        if (!date_begin) throw new Error('Fecha de inicio no válida')
        if (!date_end) throw new Error('Fecha de término no válida')

        // Las fechas deben ser mayor o igual a la fecha actual y la fecha de fin debe ser mayor a la fecha de inicio
        // Obtener la fecha actual pero a las 00:00:00
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        if (new Date(date_begin) < new Date()) throw new Error('Fecha de inicio no válida')
        if (new Date(date_end) < new Date()) throw new Error('Fecha de término no válida')
        if (new Date(date_end) < new Date(date_begin)) throw new Error('Fecha de término no válida')

        const ot = await prisma.solicitud.findUnique({ where: { id: Number(id) } })
        if (!ot) throw new Error('OT no encontrada')

        await prisma.solicitud.update({ where: { id: Number(id) }, data: { date_begin: new Date(date_begin), date_end: new Date(date_end) } })

        return res.json({ message: 'Fechas actualizadas correctamente' })

    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}

export const AceptOrRejectBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, motivo_rechazo } = req.body;

        const solicitud = await prisma.solicitud.findFirst({ where: { id: Number(id) }, include: { user: true } });
        if (!solicitud) throw new Error("Solicitud no encontrada");
        if (solicitud.status_ot !== 'approved') throw new Error("La solicitud no tiene un presupuesto aprobado");

        if (status !== 'approved' && status !== 'rejected') throw new Error("Debe enviar un estado válido");

        if (status === 'rejected' && (!motivo_rechazo || motivo_rechazo.trim() === "")) throw new Error("Debe enviar un motivo de rechazo");

        await prisma.solicitud.update({ where: { id: solicitud.id }, data: { status_ot: status === 'approved' ? 'in_process' : 'rejected',
            isOT: status === 'approved' ? true : false
        } });

        if (status === 'rejected') {
            await prisma.motivo_Rechazo_Solicitud_Cliente.create({
                data: {
                    description: motivo_rechazo,
                    solicitudId: solicitud.id
                }
            });

            await prisma.solicitud.update({ where: { id: solicitud.id }, data: { status: 'rejected' } });
        }

        const emailsAdmin = await prisma.user.findMany({ where: { role: 'admin' } });
        const emailsTo = [];
        for (let i = 0; i < emailsAdmin.length; i++) {
            const admin = emailsAdmin[i];
            emailsTo.push(admin.email);
        }
        if (status === 'approved') {
            const html = EmailSolicitudAprobadaClientePresupuestoTemplate(solicitud);
            const emailData: Models.Email = {
                from: config.SMTP_FROM || '',
                to: emailsTo,
                html: html,
                subject: 'Mining Service - Presupuesto aceptado',
                text: 'Mining Service - Presupuesto aceptado'
            }
    
            await EmailSender(emailData);
        } else {
            const html = EmailSolicitudRechazadaClientePresupuestoTemplate(solicitud);
            const emailData: Models.Email = {
                from: config.SMTP_FROM || '',
                to: emailsTo,
                html: html,
                subject: 'Mining Service - Solicitud rechazada',
                text: 'Mining Service - Solicitud rechazada'
            }
    
            await EmailSender(emailData);
        }

        return res.status(200).json({ message: "Solicitud actualizada correctamente", status: status });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
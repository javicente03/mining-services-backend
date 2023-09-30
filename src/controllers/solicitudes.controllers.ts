import { Request, Response } from "express";
import config from "../config";
import EmailSender from "../helpers/email/sendEmail";
import { EmailNuevaSolicitudTemplate, EmailSolicitudAprobadaClientePresupuestoTemplate, EmailSolicitudRechazadaClientePresupuestoTemplate } from "../helpers/email/templates";
import ObtainUser from "../utils/obtainUser";
import prisma from "../utils/prismaClient";

// export const CreateSolicitudRespaldo = async (req: Request, res: Response) => {
//     try {
//         const {
//             works, description
//         } = req.body;
//         const idUser = await ObtainUser(req);
//         const user = await prisma.user.findUnique({ where: { id: idUser.id } });

//         if (!user) throw new Error("Usuario no encontrado");
//         if (!works) throw new Error("Debe enviar los trabajos a realizar");
//         if (!description || description.trim() === "") throw new Error("Debe enviar una descripción de la solicitud");

//         if (!Array.isArray(works)) throw new Error("Debe enviar un arreglo de trabajos");
//         if (works.length === 0) throw new Error("Debe enviar al menos un trabajo");

//         const solicitud = await prisma.solicitud.create({
//             data: {
//                 description: description.trim(),
//                 userId: user.id
//             }
//         });

//         for (let i = 0; i < works.length; i++) {

//             const work = works[i];
//             if (!work.id) continue;
//             if (!work.description || work.description.trim() === "") continue;

//             const type = await prisma.tipos_Trabajos_Solicitud.findUnique({ where: { id: works[i].id } });
//             if (!type) continue;

//             await prisma.solicitud_Tipos_Trabajos.create({
//                 data: {
//                     description: work.description,
//                     solicitudId: solicitud.id,
//                     tipoTrabajoId: type.id
//                 }
//             });
//         }

//         const newSolicitud = await prisma.solicitud.findFirst({
//             where: {
//                 id: solicitud.id
//             },
//             include: {
//                 tipos_trabajos_solicitud: {
//                     select: {
//                         description: true,
//                         tipoTrabajoId: true,
//                         tipoTrabajo: {
//                             select: {
//                                 name: true
//                             }
//                         }
//                     }
//                 },
//             }
//         })

//         return res.status(200).json({ message: "Solicitud creada correctamente", solicitud: newSolicitud });

//     } catch (error: any) {
//         return res.status(400).json({ error: error.message });
//     }
// }

export const CreateSolicitud = async (req: Request, res: Response) => {
    try {
        const {
            works, description, form_equipos, form_components, form_terreno, type_work
        } = req.body;
        const idUser = await ObtainUser(req);
        const user = await prisma.user.findUnique({ where: { id: idUser.id } });

        if (!user) throw new Error("Usuario no encontrado");
        if (!works) throw new Error("Debe enviar los trabajos a realizar");
        if (!description || description.trim() === "") throw new Error("Debe enviar una descripción de la solicitud");

        if (type_work !== 'equipo' && type_work !== 'maestranza' && type_work !== 'componente' && type_work !== 'servicio_terreno' && type_work !== 'null') throw new Error("Debe enviar un tipo de trabajo válido");

        // Tipo de trabajo: Equipo ----------------------------------------------
        if (type_work === 'equipo') {
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
                type_work: type_work
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

        const admins = await prisma.user.findMany({ where: { role: 'admin' } });
        const emailsTo = [];

        for (let i = 0; i < admins.length; i++) {
            const admin = admins[i];
            emailsTo.push(admin.email);
        }

        const html = EmailNuevaSolicitudTemplate(newSolicitud);
        const emailData: Models.Email = {
            from: config.SMTP_FROM || '',
            to: emailsTo,
            html: html,
            subject: 'Mining Service - Nueva solicitud',
            text: 'Mining Service - Nueva solicitud'
        }

        await EmailSender(emailData);

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
                userId: user.id, isOT: false
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
                motivo_rechazo_solicitud_cliente: true
            },
            skip: skip ? Number(skip) : 0,
            take: limit ? Number(limit) : 0,
            orderBy: {
                id: 'desc'
            }
        })

        const total = await prisma.solicitud.count({
            where: {
                userId: idUser.id, isOT: false
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
                motivo_rechazo_solicitud_cliente: true
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

export const AceptOrRejectBudget = async (req: Request, res: Response) => {
    try {
        const idUser = await ObtainUser(req);
        const user = await prisma.user.findUnique({ where: { id: idUser.id } })
        const { id } = req.params;
        const { status, motivo_rechazo } = req.body;

        if (!user) throw new Error("Usuario no encontrado");

        const solicitud = await prisma.solicitud.findFirst({ where: { id: Number(id) }, include: { user: true } });
        if (!solicitud) throw new Error("Solicitud no encontrada");
        if (solicitud.userId !== user.id) throw new Error("No tienes permisos para realizar esta acción");
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
                {
                    name: 'Horometro',
                }
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
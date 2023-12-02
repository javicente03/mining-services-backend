import { Request, Response } from 'express';
import prisma from '../../utils/prismaClient';

export const getActivities = async (req: Request, res: Response) => {
    try {
        
        const { skip, limit } = req.query;

        const activities = await prisma.actividades_OT.findMany({
            skip: skip ? Number(skip) : 0,
            take: limit ? Number(limit) : undefined,
            include: {
                subActividades: {
                    where: {
                        deleted: false
                    }
                },
            },
            where: {
                deleted: false,
            },
        });

        for (let index = 0; index < activities.length; index++) {
            const element = activities[index];
            // La suma de las horas hombre de las subactividades
            const horas_hombre = element.subActividades.reduce((a: any, b: any) => a + b.horas_hombre, 0);
            // @ts-ignore
            element.horas_hombre = horas_hombre;
        }

        const total_horas_hombre = await prisma.subActividades_OT.aggregate({
            _sum: {
                horas_hombre: true
            },
            where: {
                deleted: false
            }
        });
        const total = await prisma.actividades_OT.count({ where: { deleted: false } });

        return res.status(200).json({ data: activities, total, total_horas_hombre: total_horas_hombre._sum.horas_hombre });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }        
}

export const getActivitiesById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const activity = await prisma.actividades_OT.findUnique({ where: { id: Number(id) }, include: {
            subActividades: {
                where: {
                    deleted: false
                }
            },
        } });

        if (!activity) throw new Error('Actividad no encontrada');

        return res.status(200).json({ data: activity });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const createActivity = async (req: Request, res: Response) => {
    try {
        const { name, subActividades } = req.body;

        if (!name) throw new Error('Faltan datos requeridos');
        if (!subActividades) throw new Error('Debe agregar al menos una subactividad');
        if (!Array.isArray(subActividades)) throw new Error('El campo subActividades es incorrecto');
        if (subActividades.length === 0) throw new Error('Debe agregar al menos una subactividad');
        if (name.trim() === '') throw new Error('Los campos no pueden estar vacíos');

        // Si alguna subactividad no tiene horas hombre o la descripción está vacía
        if (subActividades.some((subActividad: any) => !subActividad.horas_hombre || subActividad.description.trim() === '')) throw new Error('Las subactividades deben tener horas hombre y descripción');

        const activity = await prisma.actividades_OT.create({
            data: {
                name: name.trim(),
            }
        });

        for (let index = 0; index < subActividades.length; index++) {
            const element = subActividades[index];
            await prisma.subActividades_OT.create({
                data: {
                    description: element.description.trim(),
                    actividadId: activity.id,
                    horas_hombre: element.horas_hombre
                }
            });
        }

        return res.status(200).json({ data: activity });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const updateActivity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) throw new Error('Faltan datos requeridos');
        if (name.trim() === '') throw new Error('Los campos no pueden estar vacíos');

        await prisma.actividades_OT.findUnique({ where: { id: Number(id) } }).then((activity) => { if (!activity) throw new Error('Actividad no encontrada') });

        const activity = await prisma.actividades_OT.update({
            where: { id: Number(id) },
            data: {
                name: name.trim(),
            }
        });

        return res.status(200).json({ data: activity });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const AddSubActivity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, horas_hombre } = req.body;

        if (!name || !description) throw new Error('Faltan datos requeridos');
        if (name.trim() === '' || description.trim() === '') throw new Error('Los campos no pueden estar vacíos');
        if (!horas_hombre) throw new Error('Debe agregar las horas hombre');

        await prisma.actividades_OT.findUnique({ where: { id: Number(id) } }).then((activity) => { if (!activity) throw new Error('Actividad no encontrada') });

        const subActivity = await prisma.subActividades_OT.create({
            data: {
                description: description.trim(),
                actividadId: Number(id),
                horas_hombre
            }
        });

        return res.status(200).json({ data: subActivity });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const updateSubActivities = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { subActividades } = req.body;

        if (!subActividades) throw new Error('Faltan datos requeridos');
        if (!Array.isArray(subActividades)) throw new Error('El campo subActividades es incorrecto');
        if (subActividades.length === 0) throw new Error('Debe agregar al menos una subactividad');

        // Si alguna subactividad no tiene horas hombre o la descripción está vacía
        if (subActividades.some((subActividad: any) => !subActividad.horas_hombre || subActividad.description.trim() === '')) throw new Error('Las subactividades deben tener horas hombre y descripción');

        await prisma.actividades_OT.findUnique({ where: { id: Number(id) } }).then((activity) => { if (!activity) throw new Error('Actividad no encontrada') });

        // Eliminar las subactividades que no se enviaron
        await prisma.subActividades_OT.updateMany({
            where: {
                actividadId: Number(id),
                NOT: {
                    id: {
                        in: subActividades.map((subActividad: any) => subActividad.id)
                    }
                }
            },
            data: {
                deleted: true
            }
        });
        for (let index = 0; index < subActividades.length; index++) {
            const element = subActividades[index];
            if (element.id !== 0) {
                await prisma.subActividades_OT.update({
                    where: { id: Number(element.id) },
                    data: {
                        description: element.description.trim(),
                        horas_hombre: element.horas_hombre
                    }
                });
            } else {
                await prisma.subActividades_OT.create({
                    data: {
                        description: element.description.trim(),
                        actividadId: Number(id),
                        horas_hombre: element.horas_hombre
                    }
                });
            }
        }

        return res.status(200).json({ message: 'Subactividades actualizadas correctamente' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const updateSubActivity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, horas_hombre } = req.body;

        if (!name || !description) throw new Error('Faltan datos requeridos');
        if (name.trim() === '' || description.trim() === '') throw new Error('Los campos no pueden estar vacíos');
        if (!horas_hombre) throw new Error('Debe agregar las horas hombre');

        await prisma.subActividades_OT.findUnique({ where: { id: Number(id) } }).then((subActivity) => { if (!subActivity) throw new Error('SubActividad no encontrada') });

        const subActivity = await prisma.subActividades_OT.update({
            where: { id: Number(id) },
            data: {
                description: description.trim(),
                horas_hombre
            }
        });

        return res.status(200).json({ data: subActivity });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const deleteActivity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.actividades_OT.findUnique({ where: { id: Number(id) } }).then((activity) => { if (!activity) throw new Error('Actividad no encontrada') });

        const activity = await prisma.actividades_OT.update({
            where: { id: Number(id) },
            data: {
                deleted: true
            }
        });

        return res.status(200).json({ data: activity });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const AsociateActivityToOt = async (req: Request, res: Response) => {
    try {
        const { otId, activityId } = req.body;

        if (!otId || !activityId) throw new Error('Faltan datos requeridos');
        
        const ot = await prisma.solicitud.findUnique({ where: { id: Number(otId) } });
        if (!ot) throw new Error('OT no encontrada');
        if (!ot.isOT) throw new Error('La solicitud no es una OT');

        const activity = await prisma.actividades_OT.findUnique({ where: { id: Number(activityId), deleted: false }, include: {
            subActividades: {
                where: { deleted: false }
            }
        } });
        if (!activity) throw new Error('Actividad no encontrada');

        const existRelation = await prisma.oT_Actividades_Relation.findFirst({
            where: {
                actividadId: Number(activityId),
                otId: Number(otId)
            }
        })
        if (existRelation) throw new Error('La actividad ya está asociada a esta OT');
        const relation = await prisma.oT_Actividades_Relation.create({
            data: {
                actividadId: Number(activityId),
                otId: Number(otId),
            }
        });

        for (let index = 0; index < activity.subActividades.length; index++) {
            const element = activity.subActividades[index];
            await prisma.oT_SubActividades_Relation.create({
                data: {
                    otActividadRelationId: relation.id,
                    horas_hombre: element.horas_hombre,
                    subActividadId: element.id
                }
            });
        }

        return res.status(200).json({ message: 'Actividades asociadas correctamente' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const AsociateActivitiesToOt = async (req: Request, res: Response) => {
    try {
        const { otId, activities } = req.body;

        if (!otId || !activities) throw new Error('Faltan datos requeridos');
        if (!Array.isArray(activities)) throw new Error('El campo activities es incorrecto');
        if (activities.length === 0) throw new Error('Debe agregar al menos una actividad');

        const ot = await prisma.solicitud.findUnique({ where: { id: Number(otId) } });
        if (!ot) throw new Error('OT no encontrada');
        if (!ot.isOT) throw new Error('La solicitud no es una OT');

        await prisma.oT_Actividades_Relation.updateMany({ where: { otId: Number(otId) }, data: { deleted: true } });
        for (let index = 0; index < activities.length; index++) {
            const element = activities[index];
            const activity = await prisma.actividades_OT.findUnique({ where: { id: Number(element.id), deleted: false }, include: {
                subActividades: {
                    where: { deleted: false }
                }
            } });
            if (!activity) continue;

            const existRelation = await prisma.oT_Actividades_Relation.findFirst({
                where: {
                    actividadId: Number(element.id),
                    otId: Number(otId)
                }
            })
            if (existRelation) continue;
            const relation = await prisma.oT_Actividades_Relation.create({
                data: {
                    actividadId: Number(element.id),
                    otId: Number(otId),
                }
            });

            for (let index = 0; index < activity.subActividades.length; index++) {
                const element = activity.subActividades[index];
                await prisma.oT_SubActividades_Relation.create({
                    data: {
                        otActividadRelationId: relation.id,
                        horas_hombre: element.horas_hombre,
                        subActividadId: element.id
                    }
                });
            }
        }

        return res.status(200).json({ message: 'Actividades asociadas correctamente' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}


export const getActivitiesByOt = async (req: Request, res: Response) => {
    try {
        const { otId } = req.params;
        const { skip, limit } = req.query;

        const activities = await prisma.oT_Actividades_Relation.findMany({
            where: {
                otId: Number(otId),
                deleted: false
            },
            include: {
                actividad: true,
                otSubActividadesRelation: {
                    include: {
                        subActividad: true
                    }
                },
            },
            skip: skip ? Number(skip) : 0,
            take: limit ? Number(limit) : undefined,
        });

        const total = await prisma.oT_Actividades_Relation.count({ where: { otId: Number(otId), deleted: false } });

        return res.status(200).json({ data: activities, total });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const deleteActivityByOt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) throw new Error('Faltan datos requeridos');

        await prisma.oT_Actividades_Relation.findUnique({ where: { id: Number(id) } }).then((relation) => { if (!relation) throw new Error('Relación no encontrada') });

        const relation = await prisma.oT_Actividades_Relation.update({
            where: { id: Number(id) },
            data: {
                deleted: true
            }
        });

        return res.status(200).json({ message: 'Actividades desasociadas correctamente' });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export const CheckActivity = async (req: Request, res: Response) => {
    try {
        const { id, tiempo_real } = req.body;

        if (!id) throw new Error('Faltan datos requeridos');
        if (!tiempo_real) throw new Error('Debe agregar el tiempo real');
        if (isNaN(Number(tiempo_real))) throw new Error('El tiempo real debe ser un número');
        if (Number(tiempo_real) < 0) throw new Error('El tiempo real no puede ser menor a 0 horas');

        const activity = await prisma.oT_SubActividades_Relation.findUnique({ where: { id: Number(id) } });
        if (!activity) throw new Error('Actividad no encontrada');

        await prisma.oT_SubActividades_Relation.update({
            where: { id: Number(id) },
            data: {
                finished: activity.finished ? false : true,
                tiempo_real: activity.finished ? 0 : Number(tiempo_real)
            }
        });

        return res.status(200).json({ message: activity.finished ? 'Actividad desmarcada correctamente' : 'Actividad marcada correctamente' });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
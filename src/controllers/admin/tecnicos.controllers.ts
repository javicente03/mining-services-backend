import { Request, Response } from 'express'
import prisma from '../../utils/prismaClient'

export const GetTecnicos = async (req: Request, res: Response) => {
    try {
        const { skip, limit } = req.query
        const tecnicos = await prisma.user.findMany({
            where: {
                role: 'technical'
            },
            skip: Number(skip) || 0,
            take: Number(limit) || undefined
        })

        const total = await prisma.user.count({
            where: {
                role: 'technical'
            }
        })

        return res.status(200).json({data: tecnicos, total})

    } catch (error: any) {
        return res.status(400).json({error: error.message})   
    }        
}

export const AddTecnicoToOt = async (req: Request, res: Response) => {
    try {
        const { idOt, idTecnico } = req.body
        
        if (!idOt || !idTecnico) throw new Error('Faltan datos')
        if (isNaN(Number(idOt)) || isNaN(Number(idTecnico))) throw new Error('Los datos no son correctos')

        const ot = await prisma.solicitud.findUnique({ where: { id: Number(idOt) } })
        if (!ot) throw new Error('La OT no existe')

        const tecnico = await prisma.user.findUnique({ where: { id: Number(idTecnico) } })
        if (!tecnico) throw new Error('El tecnico no existe')

        const otTecnico = await prisma.tecnicos_OT.findFirst({ where: { otId: Number(idOt), userId: Number(idTecnico) } })
        if (otTecnico) throw new Error('El tecnico ya esta asignado a esta OT')

        await prisma.tecnicos_OT.create({
            data: {
                otId: Number(idOt),
                userId: Number(idTecnico)
            }
        })

        return res.status(200).json({message: 'Tecnico asignado correctamente'})
        
    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}

export const RemoveTecnicoFromOt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const otTecnico = await prisma.tecnicos_OT.findUnique({ where: { id: Number(id) } })
        if (!otTecnico) throw new Error('El tecnico no esta asignado a esta OT')

        await prisma.tecnicos_OT.delete({ where: { id: Number(id) } })

        return res.status(200).json({message: 'Tecnico removido correctamente'})
        
    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}
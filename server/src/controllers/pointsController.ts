import {Request, Response} from 'express';
import knex from '../database/connection';

class PointsController {

    async index(req: Request, res: Response) {
        let { city, uf, items } = req.query;
        let parsedItems = String(items)
                            .split(',')
                            .map(item => Number(item.trim()));

        let points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        return res.json(points);
    }

    /**
     * RETORNO DE UM PONTO DE COLETA ESPECIFICO
     * @param {Request} req 
     * @param {Response} res 
     * @returns {Object JSON} point, items
     */
    async show(req: Request, res: Response) {
        let { id } = req.params;
        let point = await knex('points').where('id', id).first();

        if (!point) return res.status(400).json({ message: 'Ponto de coleta não encontrado.'});

        let items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.id')
            .where('point_items.point_id', id)
            .select('items.title');

        return res.json({ point, items });

    }

    /**
     * CRIA UM PONTO DE COLETA
     * @param {Request} req 
     * @param {Response} res
     * @returns {Object JSON} id, ...point
     */
    async create(req: Request, res: Response) {
        // usando desestruturacao do ES6
        let {
            name,
            email,
            wapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;
    
        // TRANSACTION
        const trx = await knex.transaction();
        
        // short sintaxe
        const point = {
            image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            wapp,
            latitude,
            longitude,
            city,
            uf
        }
        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
        const pointItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id,
            }
        });
    
        await trx('point_items').insert(pointItems);
        
        // PARA COMMITAR AS MUDANCAS NO BANCO QDO UTILIZAMOS TRANSACTION
        await trx.commit();

        return res.json({ 
            id: point_id,
            ...point
         });
    
    }
}

export default PointsController;
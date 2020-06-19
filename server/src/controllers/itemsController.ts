import {Request, Response} from 'express';
import knex from '../database/connection';

class ItemsController {
    async index(req : Request, res : Response) {
        let items = await knex('items').select('*');
        let serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image: `http://192.168.126.129:3333/uploads/${item.image}`,
            }
        });
        return res.json(serializedItems);
    }
}
 export default ItemsController;
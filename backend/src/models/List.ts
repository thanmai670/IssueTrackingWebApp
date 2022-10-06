import { Mongo } from '../../deps.ts';
import { Model } from '../types.ts';

export interface ListSchema {
    _id: Mongo.ObjectId;
    name: string;
    boardId: Mongo.ObjectId;
    order: string;
}

export function List(db: Mongo.Database): Model<ListSchema> {
    const name = 'List';
    const lowerName = name.toLowerCase();

    return {
        name,
        lowerName,
        schema: db.collection<ListSchema>(name),
    };
}

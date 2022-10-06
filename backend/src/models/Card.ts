import { Mongo } from '../../deps.ts';
import { Model } from '../types.ts';

export interface CardSchema {
    _id: Mongo.ObjectId;
    name: string;
    order: number;
    listId: Mongo.ObjectId;
    boardId: Mongo.ObjectId;
}

export function Card(db: Mongo.Database): Model<CardSchema> {
    const name = 'Card';
    const lowerName = name.toLowerCase();

    return {
        name,
        lowerName,
        schema: db.collection<CardSchema>(name),
    };
}

import { Mongo } from '../../deps.ts';
import { Model } from '../types.ts';

export interface BoardSchema {
    _id: Mongo.ObjectId;
    name: string;
    image: {
        color: string;
        thumbnail: string;
        full: string;
    };
    userId: Mongo.ObjectId;
}

export function Baord(db: Mongo.Database): Model<BoardSchema> {
    const name = 'Board';
    const lowerName = name.toLowerCase();

    return {
        name,
        lowerName,
        schema: db.collection<BoardSchema>(name),
    };
}

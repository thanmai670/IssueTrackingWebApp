import { Mongo } from '../../deps.ts';
import { Model } from '../types.ts';

export type UserRole = 'user' | 'admin';

export interface UserSchema {
    _id: Mongo.ObjectId;
    username: string;
    email: string;
    password: string;
    role?: UserRole;
}

export function User(db: Mongo.Database): Model<UserSchema> {
    const name = 'User';
    const lowerName = name.toLowerCase();

    return {
        name,
        lowerName,
        schema: db.collection<UserSchema>(name),
    };
}

import { Mongo, Oak } from '../deps.ts';

export interface Model<T> {
    name: string;
    lowerName: string;
    schema: Mongo.Collection<T>;
}

export type Router = Oak.Router<Record<string, any>>;
export type Context = Oak.Context<Record<string, any>, Record<string, any>>;
export type RouterContext<T> = T;
export type Next = () => Promise<unknown>;

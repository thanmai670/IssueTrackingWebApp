import { Oak } from '../../deps.ts';
import { Context, Next } from '../types.ts';

export const error = async (ctx: Context, next: Next) => {
    try {
        await next();
    } catch (error) {
        const { message, name, path, type, details } = error;
        const status = error.status || error.statusCode || Oak.Status.InternalServerError;
        ctx.response.status = status;
        const body = { message, name, path, type, status };

        if (details != null) {
            Object.assign(body, { details });
        }
        ctx.response.body = body;
    }
};

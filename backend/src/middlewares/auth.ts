// deno-lint-ignore-file
import { Status, verify } from '../../deps.ts';
import { key } from '../controllers/UserController.ts';
import { db } from '../main.ts';
import { User } from '../models/User.ts';
import { Context, Next } from '../types.ts';
import { decodeJwtFromHeader } from '../util.ts';

export const authMiddleware = async (ctx: Context, next: Next) => {
    const Headers = ctx.request.headers;
    const authHeader = Headers.get('Authorization');

    ctx.assert(authHeader != null, Status.Unauthorized, 'Unauthorized!');
    const jwt = authHeader.split(' ')[1];
    ctx.assert(jwt != null, Status.Unauthorized);
    const data = await verify(jwt, key);
    ctx.assert(data != null, Status.Unauthorized);

    await next();
};

export const adminMiddleware = async (ctx: Context, next: Next) => {
    const Headers = ctx.request.headers;
    const authHeader = Headers.get('Authorization');

    ctx.assert(authHeader != null, Status.BadRequest, 'No token supplied!');
    const { email } = decodeJwtFromHeader(authHeader);
    ctx.assert(typeof email === 'string', Status.BadRequest, 'Wrong token-payload!');

    const user = await User(db).schema.findOne({ email });
    ctx.assert(user != null, Status.BadRequest, 'User from token not found!');
    ctx.assert(user.role != null, Status.Unauthorized, 'User is not admin!');
    ctx.assert(user.role === 'admin', Status.Unauthorized, 'User is not admin!');

    await next();
};

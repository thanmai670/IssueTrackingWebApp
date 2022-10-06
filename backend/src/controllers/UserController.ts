import { create, getNumericDate, Status, dayjs, V, crypt, Mongo } from '../../deps.ts';
import { adminMiddleware, authMiddleware } from '../middlewares/auth.ts';
import { UserSchema } from '../models/User.ts';
import { Context, Model, Router } from '../types.ts';
import { decodeJwtFromHeader, oakAssert } from '../util.ts';

const exported = Deno.env.get('JWK');

export const key =
    exported === undefined
        ? await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-512' }, true, ['sign', 'verify'])
        : await crypto.subtle.importKey(
              'jwk',
              JSON.parse(exported.replaceAll(`'`, '')),
              { name: 'HMAC', hash: 'SHA-512' },
              true,
              ['sign', 'verify']
          );

export function registerUser(router: Router, user: Model<UserSchema>) {
    router.post('/register', async (ctx: Context) => {
        const body = ctx.request.body();
        const content = await body.value;
        const { password, passwordCheck, username, email } = content;

        const [passes, errors] = await V.validate(content, {
            username: V.required,
            password: [V.required, V.minLength(5)],
            passwordCheck: V.required,
            email: [V.required, V.isEmail],
        });
        ctx.assert(passes, Status.BadRequest, undefined, { details: errors });
        ctx.assert(password === passwordCheck, Status.BadRequest, `Password don't match 👿`);

        const existingUser = await user.schema.findOne({ email });

        ctx.assert(existingUser == null, Status.FailedDependency, 'User already exists, think of something unique 🦄');

        const passwordHash = await crypt.hash(password);
        const newUserId = await user.schema.insertOne({ username, email, password: passwordHash, role: 'user' });

        ctx.response.body = {
            message: `User "${username}" registered.`,
            _id: newUserId,
            username,
            email,
            passwordHash,
            _links: {
                me: { href: `${ctx.state.baseUrl}/me`, description: meDescription },
                login: { href: `${ctx.state.baseUrl}/login`, description: loginDescription },
            },
        };
    });
}

const loginDescription = 'Returns a new JWT. [Request (POST): Valid email and password present in request-body]';
export function loginUser(router: Router, user: Model<UserSchema>) {
    router.post('/login', async (ctx: Context) => {
        const Headers = ctx.request.headers;
        const authHeader = Headers.get('Authorization');

        const body = ctx.request.body();
        const content = await body.value;
        const { email, password, stayLoggedIn } = content;

        ctx.assert(email != null && password != null, Status.BadRequest, 'Please provide an email and a password!');

        const u = await user.schema.findOne({ email });
        ctx.assert(u != null, Status.FailedDependency, `No User with E-Mail: ${email} found!`);
        ctx.assert(crypt.verify(password, u.password), Status.BadRequest, 'Incorrect password!');

        const expDate = stayLoggedIn != null && stayLoggedIn === true ? dayjs().add(99, 'year') : dayjs().add(1, 'day');
        const exp = getNumericDate(expDate.toDate());
        const iat = getNumericDate(dayjs().toDate());

        const jwt =
            authHeader == null
                ? await create(
                      { alg: 'HS512', typ: 'JWT' },
                      { exp, iss: { _id: u._id.toString(), email: u.email, username: u.username }, iat },
                      key
                  )
                : authHeader;

        ctx.response.body = {
            message: `Logged in as "${u.username}"`,
            ...u,
            jwt,
            _links: {
                me: { href: `${ctx.state.baseUrl}/me`, description: meDescription },
            },
        };
    });
}

const meDescription = 'Returns the user-object. [Request (POST): Valid JWT present in authorization-header]';
export function me(router: Router, user: Model<UserSchema>) {
    router.get('/me', authMiddleware, async (ctx: Context) => {
        const Headers = ctx.request.headers;
        const authHeader = Headers.get('Authorization');

        ctx.assert(authHeader != null, Status.BadRequest, 'No token supplied!');

        const { email } = decodeJwtFromHeader(authHeader);

        ctx.assert(typeof email === 'string', Status.BadRequest, 'Wrong token-payload!');

        const u = await user.schema.findOne({ email });
        ctx.assert(u != null, Status.BadRequest, 'User from token not found!');

        if (u.role != null && u.role === 'admin') {
            ctx.response.body = {
                message: `User "${u.username}" retrieved.`,
                _links: {
                    users: {
                        href: `${ctx.state.baseUrl}/${user.lowerName}s`,
                        description: usersDescription,
                    },
                    deleteUser: {
                        href: `${ctx.state.baseUrl}/${user.lowerName}/:id`,
                        description: deleteUserDescription,
                    },
                },
                me: u,
            };
        } else {
            ctx.response.body = {
                message: `User "${u.username}" retrieved.`,
                me: u,
            };
        }
    });
}

const usersDescription = 'Returns all users. [Request (GET): Valid admin-JWT present in authorization-header]';
export function users(router: Router, user: Model<UserSchema>) {
    router.get(`/${user.lowerName}s`, adminMiddleware, async (ctx: Context) => {
        const users = await user.schema.find().toArray();

        ctx.response.body = {
            message: `Users retrieved.`,
            _links: {
                deleteUser: { href: `${ctx.state.baseUrl}/${user.lowerName}/:id`, description: deleteUserDescription },
            },
            users,
        };
    });
}

const deleteUserDescription =
    'Deletes a user. [Request (DELETE): Valid admin-JWT present in authorization-header and ObjectId of user in URL]';
export function deleteUser(router: Router, user: Model<UserSchema>) {
    router.delete(`/${user.lowerName}/:id`, adminMiddleware, async (ctx) => {
        const id = ctx.params.id;
        oakAssert(ctx, id != null, Status.BadRequest, 'No userId supplied in url.');
        const _id = new Mongo.ObjectId(ctx.params.id);
        await user.schema.deleteOne({ _id });

        ctx.response.body = { message: `User with the id: ${_id} deleted.` };
    });
}

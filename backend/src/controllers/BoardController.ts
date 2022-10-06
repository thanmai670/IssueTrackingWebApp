import { Context, Model, Router } from '../types.ts';
import { authMiddleware } from '../middlewares/auth.ts';
import { Mongo, Status, V } from '../../deps.ts';
import { BoardSchema } from '../models/Board.ts';
import { ActivitySchema } from '../models/Activity.ts';
import { CardSchema } from '../models/Card.ts';
import { ListSchema } from '../models/List.ts';
import { UserSchema } from '../models/User.ts';
import { decodeJwtFromHeader, oakAssert } from '../util.ts';
import { createListDescription } from './ListController.ts';
import { createActivityDescription } from './ActivityController.ts';
import { createCardDescription } from './CardController.ts';

// Create board using userId
const createBoardDescription =
    'Creates a new board. [Request (POST): Valid name, image and uId (userId) present in request-body]';
export function createBoard(router: Router, board: Model<BoardSchema>, user: Model<UserSchema>) {
    router.post(`/${board.lowerName}`, authMiddleware, async (ctx: Context) => {
        const body = ctx.request.body();
        const content = await body.value;

        const { name, image, uId } = content;

        const [passes, errors] = await V.validate(content, {
            name: V.required,
            image: V.required,
            uId: V.required,
        });
        oakAssert(ctx, passes, Status.BadRequest, undefined, { details: errors });

        const userId = new Mongo.ObjectId(uId);

        const u = await user.schema.findOne({ _id: userId });
        ctx.assert(u != null, Status.FailedDependency, 'User not found!');

        const _id = await board.schema.insertOne({ name, image, userId });

        ctx.response.body = {
            board: { _id, name, image },
            message: `${board.name} created!`,
            _links: {
                updateBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: updateBoardContentDescription,
                },
                deleteBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: deleteBoardDescription,
                },
                getBoards: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}s/:userId`,
                    description: getBoardsDescription,
                },
                getBoard: { href: `${ctx.state.baseUrl}/${board.lowerName}/:id`, description: getBoardDescription },
                getListsByBoardId: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}s/:boardId`,
                    description: getListsByBoardIdDescription,
                },
                getCardsByBoardId: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/cards/:boardId`,
                    description: getCardsByBoardIdDescription,
                },
                getActivitysByBoardId: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/activitys/:id`,
                    description: getActivitysByBoardIdDescription,
                },
            },
        };
    });
}

// Get all boards for a user
const getBoardsDescription = 'Gets all board by userId. [Request (GET): Valid userId present in request-url]';
export function getBoards(router: Router, board: Model<BoardSchema>) {
    router.get(`/${board.lowerName}s/:userId`, authMiddleware, async (ctx) => {
        const userId = new Mongo.ObjectId(ctx.params.userId);
        const b = await board.schema.find({ userId }).toArray();

        ctx.response.body = {
            message: `${board.name} retrieved!`,
            board: b,
            _links: {
                createList: { href: `${ctx.state.baseUrl}/list`, description: createListDescription },
                createBoard: { href: `${ctx.state.baseUrl}/${board.lowerName}`, description: createBoardDescription },
                updateBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: updateBoardContentDescription,
                },
                deleteBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: deleteBoardDescription,
                },
            },
        };
    });
}

// Get a Board based on id of a user
const getBoardDescription = 'Gets a board by its id. [Request (GET): Valid id present in request-url]';
export function getBoard(router: Router, board: Model<BoardSchema>) {
    router.get(`/${board.lowerName}/:id`, authMiddleware, async (ctx) => {
        const _id = new Mongo.ObjectId(ctx.params.id);
        const b = await board.schema.findOne({ _id });

        oakAssert(ctx, b != null, Status.BadRequest, 'Board not found!');

        ctx.response.body = {
            message: `${board.name} retrieved!`,
            board: b,
            _links: {
                createList: { href: `${ctx.state.baseUrl}/list`, description: createListDescription },
                createBoard: { href: `${ctx.state.baseUrl}/${board.lowerName}`, description: createBoardDescription },
                updateBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: updateBoardContentDescription,
                },
                deleteBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: deleteBoardDescription,
                },
            },
        };
    });
}

// Get lists based on boardId
const getListsByBoardIdDescription = 'Gets lists by boardId. [Request (GET): Valid boardId present in request-url]';
export function getlistsByBoardId(router: Router, board: Model<BoardSchema>, list: Model<ListSchema>) {
    router.get(`/${board.lowerName}/lists/:boardId`, authMiddleware, async (ctx) => {
        const _id = new Mongo.ObjectId(ctx.params.boardId);

        const b = await board.schema.findOne({
            _id,
        });

        oakAssert(ctx, b != null, Status.BadRequest, 'No boards found to fetch the list!');

        const lists = await list.schema.find({ boardId: _id }).toArray();

        oakAssert(ctx, lists.length !== 0, Status.BadRequest, 'No lists found to fetch!');

        ctx.response.body = {
            message: 'Lists present in this board!',
            lists,
            _links: {
                createList: { href: `${ctx.state.baseUrl}/list`, description: createListDescription },
                createBoard: { href: `${ctx.state.baseUrl}/${board.lowerName}`, description: createBoardDescription },
                updateBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: updateBoardContentDescription,
                },
                deleteBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: deleteBoardDescription,
                },
            },
        };
    });
}

// GetCards based on BoardID
const getCardsByBoardIdDescription = 'Gets cards by boardId. [Request (GET): Valid boardId present in request-url]';
export function getCardsByBoardId(router: Router, board: Model<BoardSchema>, card: Model<CardSchema>) {
    router.get(`/${board.lowerName}/cards/:boardId`, authMiddleware, async (ctx) => {
        const Headers = ctx.request.headers;
        const authHeader = Headers.get('Authorization');

        oakAssert(ctx, authHeader != null, Status.BadRequest, 'No token supplied!');

        const { _id } = decodeJwtFromHeader(authHeader);
        oakAssert(ctx, typeof _id === 'string', Status.BadRequest, 'Wrong token-payload!');

        const boardId = new Mongo.ObjectId(ctx.params.boardId);
        const userId = new Mongo.ObjectId(_id);

        const b = await board.schema.findOne({ _id: boardId, userId });

        oakAssert(ctx, b != null, Status.BadRequest, 'No boards found to fetch the cards!');

        const cards = await card.schema.find({ boardId }).toArray();

        ctx.response.body = {
            message: 'Cards retrieved.',
            _links: {
                createCard: {
                    href: `${ctx.state.baseUrl}/card`,
                    description: createCardDescription,
                },
                createBoard: { href: `${ctx.state.baseUrl}/${board.lowerName}`, description: createBoardDescription },
                updateBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: updateBoardContentDescription,
                },
                deleteBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: deleteBoardDescription,
                },
            },
            cards,
        };
    });
}

// Fetch all activities based on boardid
const getActivitysByBoardIdDescription =
    'Gets activities by boardId. [Request (GET): Valid boardId present in request-url]';
export function getActivitysByBoardId(router: Router, board: Model<BoardSchema>, activity: Model<ActivitySchema>) {
    router.get(`/${board.lowerName}/activitys/:id`, authMiddleware, async (ctx) => {
        const _id = new Mongo.ObjectId(ctx.params.id);

        const b = await board.schema.findOne({
            _id,
        });
        oakAssert(ctx, b != null, Status.BadRequest, 'No boards found to fetch the list!');

        const activities = await activity.schema.find({ boardId: _id }).toArray();
        oakAssert(ctx, activities.length !== 0, Status.BadRequest, 'No activities found to fetch!');

        ctx.response.body = {
            message: 'Activities present in this board retrieved.',
            _links: {
                createActivity: {
                    href: `${ctx.state.baseUrl}/activity`,
                    description: createActivityDescription,
                },
                createBoard: { href: `${ctx.state.baseUrl}/${board.lowerName}`, description: createBoardDescription },
                updateBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: updateBoardContentDescription,
                },
                deleteBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: deleteBoardDescription,
                },
            },
            activities,
        };
    });
}

// Update board based on boardid
const updateBoardContentDescription =
    'Updates board-content by boardId. [Request (PUT): Valid id present in request-url and name and image present in request-body]';
export function updateBoardContent(router: Router, board: Model<BoardSchema>) {
    router.put(`/${board.lowerName}/:id`, authMiddleware, async (ctx) => {
        const body = ctx.request.body();
        const content = await body.value;
        const { name, image } = content;
        const _id = new Mongo.ObjectId(ctx.params.id);

        const [passes, errors] = await V.validate(content, {
            name: V.required,
            image: V.required,
        });
        oakAssert(ctx, passes, Status.BadRequest, undefined, { details: errors });

        const _b = await board.schema.updateOne(
            { _id },
            {
                $set: { name, image },
            }
        );

        ctx.response.body = {
            message: 'Board updated.',
            board: { _id, name, image },
            _links: {
                deleteBoard: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/:id`,
                    description: deleteBoardDescription,
                },
                getBoards: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}s/:userId`,
                    description: getBoardsDescription,
                },
                getBoard: { href: `${ctx.state.baseUrl}/${board.lowerName}/:id`, description: getBoardDescription },
                getListsByBoardId: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}s/:boardId`,
                    description: getListsByBoardIdDescription,
                },
                getCardsByBoardId: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/cards/:boardId`,
                    description: getCardsByBoardIdDescription,
                },
                getActivitysByBoardId: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}/activitys/:id`,
                    description: getActivitysByBoardIdDescription,
                },
            },
        };
    });
}

// Delete board based on boardId
const deleteBoardDescription = 'Deletes a board. [Request (DELETE): Valid ObjectId present in URL]';
export function deleteBoard(router: Router, board: Model<BoardSchema>) {
    router.delete(`/${board.lowerName}/:id`, authMiddleware, async (ctx) => {
        const _data = await board.schema.deleteOne({
            _id: new Mongo.ObjectId(ctx.params.id),
        });
        ctx.response.body = {
            message: `${board.name} deleted!`,
            _links: {
                getBoards: {
                    href: `${ctx.state.baseUrl}/${board.lowerName}s/:userId`,
                    description: getBoardsDescription,
                },
            },
        };
    });
}

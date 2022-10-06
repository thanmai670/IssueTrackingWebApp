import { Mongo, Status, V } from '../../deps.ts';
import { authMiddleware } from '../middlewares/auth.ts';
import { BoardSchema } from '../models/Board.ts';
import { CardSchema } from '../models/Card.ts';
import { ListSchema } from '../models/List.ts';
import { Model, Router } from '../types.ts';
import { oakAssert } from '../util.ts';
import { createCardDescription, updateCardContentDescription } from './CardController.ts';

export const createListDescription =
    'Creates a new board. [Request (POST): Valid name, order and bId (boardId) present in request-body]';
export function createList(router: Router, list: Model<ListSchema>, board: Model<BoardSchema>) {
    router.post(`/${list.lowerName}`, authMiddleware, async (ctx) => {
        const body = ctx.request.body();
        const content = await body.value;
        const { name, order, bId } = content;

        const [passes, errors] = await V.validate(content, {
            name: V.required,
            order: V.required,
            bId: V.required,
        });
        oakAssert(ctx, passes, Status.BadRequest, undefined, { details: errors });

        const boardId = new Mongo.ObjectId(bId);

        const b = board.schema.findOne({ _id: boardId });

        oakAssert(ctx, b != null, Status.BadRequest, 'Board not found!');

        const _id = await list.schema.insertOne({ name, boardId, order });

        ctx.response.body = {
            message: `${list.name} created!`,
            list: { _id, name, order },
            _links: {
                updateList: {
                    href: `${ctx.state.baseUrl}/${list.lowerName}/:id`,
                    description: updateListContentDescription,
                },
                deleteList: { href: `${ctx.state.baseUrl}/${list.lowerName}/:id`, description: deleteListDescription },
                getList: { href: `${ctx.state.baseUrl}/${list.lowerName}/:id`, description: getListDescription },
                getListsByBoardId: {
                    href: `${ctx.state.baseUrl}/${list.lowerName}s/:boardId`,
                    description: getListsByBoardIdDescription,
                },
                getCardsByListId: {
                    href: `${ctx.state.baseUrl}/${list.lowerName}/:id/cards`,
                    description: getCardsByListIdDescription,
                },
            },
        };
    });
}

// Get all lists based on boardId
const getListsByBoardIdDescription = 'Gets a list by boardId. [Request (GET): Valid boardId present in request-url]';
export function getListsByBoardId(router: Router, list: Model<ListSchema>) {
    router.get(`/${list.lowerName}s/:boardId`, authMiddleware, async (ctx) => {
        const boardId = new Mongo.ObjectId(ctx.params.boardId);
        const lists = await list.schema.find({ boardId }).toArray();

        ctx.response.body = {
            message: `Lists retrieved!`,
            _links: {
                createList: { href: `${ctx.state.baseUrl}/${list.lowerName}`, description: createListDescription },
                updateList: {
                    href: `${ctx.state.baseUrl}/${list.lowerName}/:id`,
                    description: updateListContentDescription,
                },
                deleteList: { href: `${ctx.state.baseUrl}/${list.lowerName}/:id`, description: deleteListDescription },
            },
            lists,
        };
    });
}

// Get a list based on listId
const getListDescription = 'Gets a list by id. [Request (GET): Valid id present in request-url]';
export function getList(router: Router, list: Model<ListSchema>) {
    router.get(`/${list.lowerName}/:id`, authMiddleware, async (ctx) => {
        const _id = new Mongo.ObjectId(ctx.params.id);
        const l = await list.schema.findOne({
            _id,
        });

        oakAssert(ctx, l != null, Status.BadRequest, 'List not found!');

        ctx.response.body = {
            message: `"${list.name}" retrieved`,
            list: l,
            _links: {
                createList: { href: `${ctx.state.baseUrl}/${list.lowerName}`, description: createListDescription },
                updateList: {
                    href: `${ctx.state.baseUrl}/${list.lowerName}/:id`,
                    description: updateListContentDescription,
                },
                deleteList: { href: `${ctx.state.baseUrl}/${list.lowerName}/:id`, description: deleteListDescription },
            },
        };
    });
}

// Fetch cards based on list-id
const getCardsByListIdDescription = 'Gets cards by listId. [Request (GET): Valid id present in request-url]';
export function getCardsByListId(router: Router, list: Model<ListSchema>, card: Model<CardSchema>) {
    router.get(`/${list.lowerName}/:id/cards`, authMiddleware, async (ctx) => {
        const _id = new Mongo.ObjectId(ctx.params.id);

        const l = await list.schema.findOne({ _id });
        const cards = await card.schema.find({ listId: _id }).toArray();

        // deno-lint-ignore ban-ts-comment
        // @ts-ignore
        ctx.assert(
            l != null && cards != null,
            Status.FailedDependency,
            'No lists or Cards found (with that ObjectId)!'
        );

        ctx.response.body = {
            message: 'Cards present in this list retrieved',
            _links: {
                createCard: {
                    href: `${ctx.state.baseUrl}/card`,
                    description: createCardDescription,
                },
                updateCardContent: {
                    href: `${ctx.state.baseUrl}/card/:id`,
                    description: updateCardContentDescription,
                },
                deleteCard: {
                    href: `${ctx.state.baseUrl}/card/:id`,
                    description: createCardDescription,
                },
            },
            cards,
        };
    });
}

// Update list content based on id
const updateListContentDescription =
    'Updates list-content by listId. [Request (PUT): Valid id present in request-url and name and order present in request-body]';
export function updateListContent(router: Router, list: Model<ListSchema>) {
    router.put(`/${list.lowerName}/:id`, authMiddleware, async (ctx) => {
        const body = ctx.request.body();
        const content = await body.value;
        const { name, order } = content;
        const _id = new Mongo.ObjectId(ctx.params.id);

        const [passes, errors] = await V.validate(content, {
            name: V.required,
            order: V.required,
        });
        oakAssert(ctx, passes, Status.BadRequest, undefined, { details: errors });

        const _l = await list.schema.updateOne(
            { _id },
            {
                $set: { name, order },
            }
        );

        ctx.response.body = {
            message: `List "${name}" updated.`,
            list: { _id, name, order },
            _links: {
                deleteList: { href: `${ctx.state.baseUrl}/${list.lowerName}/:id`, description: deleteListDescription },
                getList: { href: `${ctx.state.baseUrl}/${list.lowerName}/:id`, description: getListDescription },
                getListsByBoardId: {
                    href: `${ctx.state.baseUrl}/${list.lowerName}s/:boardId`,
                    description: getListsByBoardIdDescription,
                },
                getCardsByListId: {
                    href: `${ctx.state.baseUrl}/${list.lowerName}/:id/cards`,
                    description: getCardsByListIdDescription,
                },
            },
        };
    });
}

// Delete list based on listId
const deleteListDescription = 'Deletes a list by listId. [Request (DELETE): Valid id present in request-url]';
export function deleteList(router: Router, list: Model<ListSchema>) {
    router.delete(`/${list.lowerName}/:id`, authMiddleware, async (ctx) => {
        const _data = await list.schema.deleteOne({
            _id: new Mongo.ObjectId(ctx.params.id),
        });
        ctx.response.body = {
            message: `"${list.name}" deleted!`,
            _links: {
                createList: { href: `${ctx.state.baseUrl}`, description: createListDescription },
                getListsByBoardId: {
                    href: `${ctx.state.baseUrl}/${list.lowerName}s/:boardId`,
                    description: getListsByBoardIdDescription,
                },
            },
        };
    });
}

import { Mongo, Status, V } from '../../deps.ts';
import { Model, Router } from '../types.ts';
import { authMiddleware } from '../middlewares/auth.ts';
import { CardSchema } from '../models/Card.ts';
import { BoardSchema } from '../models/Board.ts';
import { ListSchema } from '../models/List.ts';
import { ActivitySchema } from '../models/Activity.ts';
import { oakAssert } from '../util.ts';

export const createCardDescription =
    'Creates a new card. [Request (POST): Valid name, order, bId (boardId) and lId (listId) present in request-body]';
export function createCard(
    router: Router,
    card: Model<CardSchema>,
    board: Model<BoardSchema>,
    list: Model<ListSchema>
) {
    router.post(`/${card.lowerName}`, authMiddleware, async (ctx) => {
        const body = ctx.request.body();
        const content = await body.value;

        const { name, order, bId, lId } = content;

        const [passes, errors] = await V.validate(content, {
            name: V.required,
            order: V.required,
            bId: V.required,
            lId: V.required,
        });
        oakAssert(ctx, passes, Status.BadRequest, undefined, { details: errors });

        const boardId = new Mongo.ObjectId(bId);
        const listId = new Mongo.ObjectId(lId);

        const b = await board.schema.findOne({ _id: boardId });
        const l = await list.schema.findOne({ _id: listId });

        oakAssert(ctx, b != null && l != null, Status.FailedDependency, 'Relationships unclear! [Board and List]');

        const _id = await card.schema.insertOne({
            name,
            boardId: new Mongo.ObjectId(boardId),
            listId: new Mongo.ObjectId(listId),
            order,
        });

        ctx.response.body = {
            message: `${card.name} created!`,
            card: { _id, name, order },
            _links: {
                updateCardContent: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}/:id`,
                    description: updateCardContentDescription,
                },
                deleteCard: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}/:id`,
                    description: deleteCardDescription,
                },
                getCard: { href: `${ctx.state.baseUrl}/${card.lowerName}/:id`, description: getCardDescription },
                getActivitysBycardId: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}/:id/activitys`,
                    description: getActivitysBycardIdDescription,
                },
            },
        };
    });
}

// Get a card based on ID
const getCardDescription = 'Gets a card by its id. [Request (GET): Valid id present in request-url]';
export function getCard(router: Router, card: Model<CardSchema>) {
    router.get(`/${card.lowerName}/:id`, authMiddleware, async (ctx) => {
        const _id = new Mongo.ObjectId(ctx.params.id);
        const c = await card.schema.findOne({
            _id,
        });

        oakAssert(ctx, c != null, Status.BadRequest, 'Card not found!');

        ctx.response.body = {
            message: `${card.name} retrieved`,
            card: c,
            _links: {
                createCard: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}`,
                    description: createCardDescription,
                },
                updateCardContent: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}/:id`,
                    description: updateCardContentDescription,
                },
                deleteCard: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}/:id`,
                    description: deleteCardDescription,
                },
            },
        };
    });
}

// Fetch activities based on card-id
const getActivitysBycardIdDescription =
    'Gets activities by cardId. [Request (GET): Valid id (cardId) present in request-url]';
export function getActivitysBycardId(router: Router, card: Model<CardSchema>, activity: Model<ActivitySchema>) {
    router.get(`/${card.lowerName}/:id/activitys`, authMiddleware, async (ctx) => {
        const _id = new Mongo.ObjectId(ctx.params.id);

        const c = await card.schema.findOne({ _id });
        const activities = await activity.schema.find({ cardId: _id }).toArray();

        oakAssert(
            ctx,
            c != null && activities != null,
            Status.FailedDependency,
            'No cards found to fetch the activities!'
        );

        ctx.response.body = {
            message: 'Activities present in this card retrieved.',
            _links: {
                createCard: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}`,
                    description: createCardDescription,
                },
                updateCardContent: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}/:id`,
                    description: updateCardContentDescription,
                },
                deleteCard: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}/:id`,
                    description: deleteCardDescription,
                },
            },
            activities,
        };
    });
}

// Update card content based on id
export const updateCardContentDescription =
    'Updates card-content by boardId. [Request (PUT): Valid id present in request-url and name and order present in request-body]';
export function updateCardContent(router: Router, card: Model<CardSchema>) {
    router.put(`/${card.lowerName}/:id`, authMiddleware, async (ctx) => {
        const body = ctx.request.body();
        const content = await body.value;
        const _id = new Mongo.ObjectId(ctx.params.id);
        const { name, order } = content;

        const [passes, errors] = await V.validate(content, {
            name: V.required,
            order: V.required,
        });
        oakAssert(ctx, passes, Status.BadRequest, undefined, { details: errors });

        const _c = await card.schema.updateOne(
            { _id },
            {
                $set: { name, order },
            }
        );

        ctx.response.body = {
            message: 'Card updated.',
            list: { _id, name, order },
            _links: {
                deleteCard: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}/:id`,
                    description: deleteCardDescription,
                },
                getCard: { href: `${ctx.state.baseUrl}/${card.lowerName}/:id`, description: getCardDescription },
                getActivitysBycardId: {
                    href: `${ctx.state.baseUrl}/${card.lowerName}/:id/activitys`,
                    description: getActivitysBycardIdDescription,
                },
            },
        };
    });
}

// Delete card based on cardid
export const deleteCardDescription = 'Deletes a card. [Request (DELETE): Valid ObjectId present in URL]';
export function deleteCard(router: Router, card: Model<CardSchema>) {
    router.delete(`/${card.lowerName}/:id`, authMiddleware, async (ctx) => {
        const _data = await card.schema.deleteOne({
            _id: new Mongo.ObjectId(ctx.params.id),
        });

        ctx.response.body = {
            message: `${card.name} deleted!`,
            _links: {
                getCard: { href: `${ctx.state.baseUrl}/${card.lowerName}/:id`, description: getCardDescription },
            },
        };
    });
}

import { Mongo, Status, V } from '../../deps.ts';
import { Context, Model, Router } from '../types.ts';
import { authMiddleware } from '../middlewares/auth.ts';
import { ActivitySchema } from '../models/Activity.ts';
import { BoardSchema } from '../models/Board.ts';
import { CardSchema } from '../models/Card.ts';
import { oakAssert } from '../util.ts';

// Creates activity based on given rquest body
export const createActivityDescription =
    'Creates an activity. [Request (POST): text, bId (boardId) and cId (cardId) present in request-body]';
export function createActivity({
    router,
    activity,
    board,
    card,
}: {
    router: Router;
    activity: Model<ActivitySchema>;
    board: Model<BoardSchema>;
    card: Model<CardSchema>;
}) {
    router.post(`/${activity.lowerName}`, authMiddleware, async (ctx: Context) => {
        const body = ctx.request.body();
        const content = await body.value;

        const { text, bId, cId } = content;

        const [passes, errors] = await V.validate(content, {
            text: V.required,
            bId: V.required,
            cId: V.required,
        });
        oakAssert(ctx, passes, Status.BadRequest, undefined, { details: errors });

        const cardId = new Mongo.ObjectId(cId);
        const boardId = new Mongo.ObjectId(bId);

        const b = await board.schema.findOne({ _id: boardId });
        const c = await card.schema.findOne({ _id: cardId });

        ctx.assert(b != null && c != null, Status.BadRequest, 'Supplied board or card not found!');

        const _id = await activity.schema.insertOne({ text, boardId, cardId });
        ctx.response.body = {
            message: `${activity.name} created!`,
            _links: {
                deleteAcitivity: {
                    href: `${ctx.state.baseUrl}/${activity.lowerName}/:id`,
                    description: deleteActivityDescription,
                },
            },
            activity: { _id, text },
        };
    });
}

// Deletes activity based on given activity ObjectId
const deleteActivityDescription = 'Deletes an activity. [Request (DELETE): Valid ObjectId present in URL]';
export function deleteAcitivity(router: Router, activity: Model<ActivitySchema>) {
    router.delete(`/${activity.lowerName}/:id`, authMiddleware, async (ctx) => {
        const _data = await activity.schema.deleteOne({
            _id: new Mongo.ObjectId(ctx.params.id),
        });
        ctx.response.body = {
            message: `${activity.name} deleted!`,
            _links: {
                createActivity: {
                    href: `${ctx.state.baseUrl}/${activity.lowerName}`,
                    description: createActivityDescription,
                },
            },
        };
    });
}

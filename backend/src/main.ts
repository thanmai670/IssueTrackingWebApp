import { Oak, Mongo, oakCors } from '../deps.ts';
import { Baord } from './models/Board.ts';
import { User } from './models/User.ts';
import { Activity } from './models/Activity.ts';
// import { crudFactory } from './util.ts';
import { List } from './models/List.ts';
import { Card } from './models/Card.ts';
import { createActivity, deleteAcitivity } from './controllers/ActivityController.ts';
import {
    createBoard,
    updateBoardContent,
    deleteBoard,
    getActivitysByBoardId,
    getCardsByBoardId,
    getlistsByBoardId,
    getBoard,
    getBoards,
} from './controllers/BoardController.ts';
import {
    createList,
    deleteList,
    getCardsByListId,
    getList,
    getListsByBoardId,
    updateListContent,
} from './controllers/ListController.ts';
import {
    createCard,
    deleteCard,
    getActivitysBycardId,
    getCard,
    updateCardContent,
} from './controllers/CardController.ts';
import { registerUser, loginUser, me, deleteUser, users } from './controllers/UserController.ts';
import { error } from './middlewares/error.ts';

const port = Number(Deno.env.get('APP_PORT')) || 1234;
const baseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost';
const connectString = Deno.env.get('MONGODB_CONNECT_STRING') || 'mongodb://127.0.0.1:27017';

const appName = 'the-secret-ingredient';
const client = new Mongo.MongoClient();

await client.connect(connectString);

export const db = client.database(appName);

const app = new Oak.Application({ state: { baseUrl } });
export const router = new Oak.Router();

const board = Baord(db);
const activity = Activity(db);
const list = List(db);
const card = Card(db);
const user = User(db);

router.get('/', (ctx) => {
    ctx.response.body = 'Server started :)';
});

// crudFactory({ router, model: board });

// Auth End points
registerUser(router, user);
loginUser(router, user);
me(router, user);
users(router, user);
deleteUser(router, user);

//End Points for Board
createBoard(router, board, user);
getBoards(router, board);
getBoard(router, board);
updateBoardContent(router, board);
deleteBoard(router, board);

//End points for List
createList(router, list, board);
getListsByBoardId(router, list);
getList(router, list);
getlistsByBoardId(router, board, list);
updateListContent(router, list);
deleteList(router, list);

//End points for cards
createCard(router, card, board, list);
getCardsByBoardId(router, board, card);
getCardsByListId(router, list, card);
getCard(router, card);
updateCardContent(router, card);
deleteCard(router, card);

//End Points for Activities
createActivity({ router, activity, board, card });
getActivitysByBoardId(router, board, activity);
getActivitysBycardId(router, card, activity);
deleteAcitivity(router, activity);

app.use(error);
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Server started at: ${baseUrl} (Port: ${port})`);

app.listen({ port });

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { getGeneric, userID } from '../ViewModels/Get';
import { postGeneric } from '../ViewModels/Post';
import {
    DragDropContext,
    Draggable,
    DraggingStyle,
    Droppable,
    DropResult,
    NotDraggingStyle,
} from 'react-beautiful-dnd';
import produce from 'immer';
import { useNavigate } from 'react-router-dom';
import { idText } from 'typescript';
import { parseJwt } from '../util';
import { settingUPDone, SetSettingUPDone, setIsWaitingResponse } from '../Views/Board';

import axios from 'axios';
import { setIn } from 'immutable';
let k = Math.floor(Math.random() * 20);
const page = Math.floor(Math.random() * 100) + 1;
const query = 'landscape';
const BASE_URL = `https://api.unsplash.com/search/photos?page=${page}&query=${query}&client_id=${process.env.REACT_APP_CLIENT_KEY}`;

export interface BoardViewModel {
    _id: string;
    name: string;
    image: {
        color: string;
        thumbnail: string;
        full: string;
    };
}

export interface IssueListTemp {
    name: string;
    content: Issue[];
}

export interface Issue {
    id: string;
    content: string;
}

export var movementIdSwapFailed = false;

export const dragReducer = produce((state: any, action: any) => {
    switch (action.type) {
        case 'MOVE': {
            state[action.from] = state[action.from] || [];
            state[action.to] = state[action.to] || [];
            const [removed] = state[action.from].splice(action.fromIndex, 1);
            state[action.to].splice(action.toIndex, 0, removed);
            return;
        }
        case 'MOVEUPDATE': {
            if (action.swapId) {
                console.log(currentCardId);
                if (currentCardId == '' || currentCardId == undefined || currentCardId == null) {
                    movementIdSwapFailed = true;
                    return;
                }
                movementIdSwapFailed = false;
                setIsWaitingResponse(false);
                state[action.to][action.toIndex].id = currentCardId;
            }
            return state;
        }
        case 'ADDITEM': {
            console.log(action.addThis);
            state[issueListsNames[action.myIndex]].push(action.addThis);
            return state;
        }
        case 'UPDATE': {
            state = initialState;
            return state;
        }
        case 'DELETEISSUE': {
            deleteCardFromIssueList(
                action.deleteMe,
                issueListsMIds[action.myIndex],
                state[issueListsNames[action.myIndex]].length
            );
            let newA: Issue[] = new Array();

            var i = 0;
            state[issueListsNames[action.myIndex]].map((item: Issue, index: number) => {
                if (item.id != action.deleteMe) {
                    newA[i] = item;
                }
                i++;
            });

            console.log(action.myIndex);
            console.log(newA);
            console.log(state[issueListsNames[action.myIndex]]);
            state[issueListsNames[action.myIndex]] = newA;

            return state;
        }
        case 'DELETEISSUELIST': {
            let i = 0;
            var newIssueListsMIds = new Array();

            issueListsNames.map((item, index) => {
                if (index === action.deleteMe) {
                    newIssueListsMIds[i] = issueListsMIds[index];
                    state['items' + i.toString()] = null;
                    return item;
                } else {
                    state['items' + i.toString()] = state[item];
                    newIssueListsMIds[i] = issueListsMIds[index];
                    i++;
                    return item;
                }
            });

            issueListsNames.pop();
            newIssueListsMIds.pop();
            issueListsMIds = newIssueListsMIds;

            return state;
        }
        case 'UPDATELISTS': {
            let i = 0;

            issueListsNames.map((item, index) => {
                if (i == issueListsNames.length - 1) {
                    state[item] = new Array();
                } else {
                    state[item] = state[item];
                    i++;
                }
            });

            return state;
        }
        case 'UPDATESTATETEXT': {
            state[issueListsNames[action.numV]][action.listV].content = action.eventV;
            return state;
        }
        default:
            throw new Error();
    }
});

export var img: any;
var currentBoardId: string;

export async function bordMainSetup(boardNum: number) {
    const jwt = localStorage.getItem('jwt');
    const parsedJwt = parseJwt(jwt!);
    const userId = parsedJwt.iss._id;
    const Bkimages = axios.get(BASE_URL);
    k++;

    var boardResponse = await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/boards/` + userId, 'GET');
    var boardID: string;

    if (boardResponse.board.length == 0) {
        boardResponse = await postGeneric(
            `${process.env.REACT_APP_BASE_API_URI}/board/`,
            {
                name: 'testBoard',
                image: {
                    color: (await Bkimages).data.results[0].color,
                    thumb: (await Bkimages).data.results[0].urls.thumb,
                    full: (await Bkimages).data.results[0].urls.full,
                },
                uId: userId,
            },
            'POST'
        );
        boardID = boardResponse.board._id;
        img = boardResponse.board.image;
    } else {
        boardID = boardResponse.board[boardNum]._id;
        img = boardResponse.board[boardNum].image;
        console.log(img);
    }
    if (img.full == undefined || img.full == 'true' || typeof img.full != 'string') {
        img.full = (await Bkimages).data.results[0].urls.full;
    }

    currentBoardId = boardID;

    const listResponse = await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/lists/` + boardID, 'GET');
    issueListsNames = listResponse.lists.map((item: any, index: number) => 'items' + index);
    issueListsMIds = listResponse.lists.map((item: any, index: number) => item._id);

    if (issueListsMIds.length === 0) {
        await SetSettingUPDone(true);
        return;
    }

    /*
    initialState.items0 = [{
        id: '1',
        content: "I'm a hussar",
    }]*/
    var intermidiateState: any = {};

    for (var i = 0; i < issueListsNames.length; i++) {
        let listsCards = await getGeneric(
            `${process.env.REACT_APP_BASE_API_URI}/list/` + issueListsMIds[i] + `/cards`,
            'GET'
        );

        var listArray = new Array();
        for (var j = 0; j < listsCards.cards.length; j++) {
            let listsActiv = await getGeneric(
                `${process.env.REACT_APP_BASE_API_URI}/card/` + listsCards.cards[j]._id + `/activitys`,
                'GET'
            );
            let pos = listsCards.cards[j].order;
            if (listsActiv.activities[0] == undefined || listsActiv.activities[0] == null) {
                listArray[pos] = { id: listsCards.cards[j]._id, content: 'Error no text' };
            } else {
                listArray[pos] = { id: listsCards.cards[j]._id, content: listsActiv.activities[0].text };
            }
        }
        intermidiateState[issueListsNames[i]] = listArray;
    }

    initialState = intermidiateState;
    await SetSettingUPDone(true);

    return;
}

export const data: Issue[] = [];

export var initialState: any = { items0: data };

let waitingForDb = false;
export let issueListsNames: string[] = ['items0', 'items1'];
export let issueListsMIds: string[] = [];

export async function addToIssueListNames(newValue: string) {
    issueListsNames.push(newValue);
    waitingForDb = true;
    const response = await postGeneric(
        `${process.env.REACT_APP_BASE_API_URI}/list/`,
        { name: newValue, bId: currentBoardId, order: issueListsNames.length - 1 },
        'POST'
    );
    issueListsMIds.push(response.list._id);
    waitingForDb = false;
}

export async function removeFromIssueListNames(indexValue: number) {
    waitingForDb = true;
    const response = await getGeneric(
        `${process.env.REACT_APP_BASE_API_URI}/list/` + issueListsMIds[indexValue],
        'DELETE'
    );
    waitingForDb = false;
}

export var currentCardId: string;

export async function addIssue(name: string, index: number, content: string, order: number) {
    if (waitingForDb) {
        alert('calme bitte!');
    }
    try {
        const response = await postGeneric(
            `${process.env.REACT_APP_BASE_API_URI}/card/`,
            { name: name, lId: issueListsMIds[index], bId: currentBoardId, order: order },
            'POST'
        );
        currentCardId = response.card._id;
        const responseNew = await postGeneric(
            `${process.env.REACT_APP_BASE_API_URI}/Activity/`,
            { text: content, cId: currentCardId, bId: currentBoardId },
            'POST'
        );

        console.log('success');
        return response.card._id;
    } catch (e) {
        throw e;
    }
}

export async function deleteCardFromIssueList(Cid: number, issueListID: string, lastIndex: number) {
    const response = await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/card/` + Cid, 'GET');

    await moveIssues(issueListID, lastIndex, -1, response.card.order, false);
    await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/card/` + Cid, 'DELETE');
    await console.log('done deleting');
}

export async function addActivity(name: string, index: number, content: string, order: number) {}

export async function editIssue(listIndex: string, newText: string) {
    const response = await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/card/` + listIndex + `/activitys`, 'GET');

    await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/Activity/` + response.activities[0]._id, 'DELETE');
    const responseNew = await postGeneric(
        `${process.env.REACT_APP_BASE_API_URI}/Activity/`,
        { text: newText, cId: listIndex, bId: currentBoardId },
        'POST'
    );
}

export async function moveIssueInernalList(oldPos: number, newPos: number, listId: string) {
    var moveDirect = 1;
    if (oldPos < newPos) {
        moveDirect = -1;
    }
    moveIssues(listId, newPos, moveDirect, oldPos, true);
}

export async function moveIssueExternalList(
    oldPos: number,
    newPos: number,
    newList: string,
    oldList: string,
    newListIndex: number
) {
    currentCardId = '';
    var idToDelete;
    var idToUpdate;
    var response = await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/list/` + newList + `/cards`, 'GET');
    moveIssues(newList, newPos, 1, response.cards.length, false);

    response = await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/list/` + oldList + `/cards`, 'GET');
    await response.cards.map(async (item: any) => {
        if (item.order == oldPos) {
            idToDelete = item._id;
            const active = await getGeneric(
                `${process.env.REACT_APP_BASE_API_URI}/Card/` + item._id + `/activitys`,
                'GET'
            );
            idToUpdate = await addIssue(item.name, newListIndex, active.activities[0].text, newPos);
        }
    });
    await moveIssues(oldList, response.cards.length, -1, oldPos, false);
    await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/Card/` + idToDelete, 'DELETE');
    return idToUpdate;
}

async function moveIssues(issueListId: string, moveAt: number, moveDirect: number, me: number, adding: boolean) {
    const response = await getGeneric(`${process.env.REACT_APP_BASE_API_URI}/list/` + issueListId + `/cards`, 'GET');
    response.cards.map(async (item: any) => {
        if (item.order == me) {
            if (adding) {
                await postGeneric(
                    `${process.env.REACT_APP_BASE_API_URI}/Card/` + item._id,
                    { name: item.name, order: moveAt },
                    'PUT'
                );
            } else {
                return;
            }
        }
        if (item.order * moveDirect >= moveAt * moveDirect && me * moveDirect > item.order * moveDirect) {
            await postGeneric(
                `${process.env.REACT_APP_BASE_API_URI}/Card/` + item._id,
                { name: item.name, order: item.order + moveDirect },
                'PUT'
            );
        }
    });
}

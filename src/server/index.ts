import cors from 'cors';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { LevelObject } from '../types';

import { port as PORT } from './server.json';

type FileLevelContents = {
    levels: Array<LevelObject>;
}

const LEVELS_FILENAME = 'levels.json';

const gameApp = (file?: string) => path.join(__dirname, '../', file || '');

const app = express();
app.use(express.json());
app.use(cors());
app.options('*', cors());

app.use(express.static(gameApp()));

console.log(
    `[${new Date().toLocaleString('ru-RU')}] Server is running on port`,
    PORT,
);

const getLevelsFileContents = (): FileLevelContents => {
    let contents;
    try {
        contents = fs.readFileSync(process.cwd() + '/src/server/' + LEVELS_FILENAME);
    } catch(err) {
        throw new Error(err);
    }

    return JSON.parse(contents.toString());
}

app.get('/', (_req, res, next) => {
    res.sendFile(gameApp('index.html'), (err) => {
        if (err) {
            console.log('Error on sending index.html!');
            next(err);
        } else {
            console.log('index.html has been sent successfully');
        }
    });
});

app.get('/list', function (request: any, response: any) {

    let contents;
    try {
        contents = getLevelsFileContents();
    } catch(err) {
        response.status(500).send('Error on reading levels from disk!');
        return;
    }

    const names = contents.levels.map(level => ({
        id: level.id,
        name: level.name,
    }));

    response.send(names);
});

app.get('/new', function (request: any, response: any) {

    let contents;
    try {
        contents = getLevelsFileContents();
    } catch(err) {
        response.status(500).send('Error on reading levels from disk!');
        return;
    }

    const newLevelData = request.body;
    const lastId = contents.levels.slice(-1)[0];
    const newId = lastId === undefined ? 0 : +lastId + 1;
    const levelData: LevelObject = {
        id: newId,
        name: 'level' + newId,
        data: newLevelData,
    };

    const newContents = { levels: contents.levels.concat([levelData]) };

    try {
        fs.writeFileSync(
            process.cwd() + '/src/server/' + 'levelsTest.json',
            JSON.stringify(newContents),
        );
    } catch(err) {
        response.status(500).send('Error on writing the level on disk!');
        return;
    }

});

app.get('/level', function (request: any, response: any) {

    let contents;
    try {
        contents = getLevelsFileContents();
    } catch(err) {
        response.status(500).send('Error on reading levels from disk!');
        return;
    }

    const id = request.query.id;
    const level = contents.levels.find(level => level.id === id);
    response.send(level);
});

app.post('/save', function (request: Request, response: Response) {

    let contents;
    try {
        contents = getLevelsFileContents();
    } catch(err) {
        response.status(500).send('Error on reading levels from disk!');
        return;
    }

    const newLevel = request.body as LevelObject;
    let newContents;

    if (newLevel.id != null) {
        newContents = {
            levels:
                contents.levels.map(level => {
                    if (level.id === newLevel.id) {
                        level.data = newLevel.data;
                    }
                    return level;
                })
        }
    }

    if (newLevel.id === null || newLevel.id === void 0) {
        const lastId = (contents.levels.slice(-1)[0]).id;
        const newId = Number(lastId) + 1;

        newContents = {
            levels: contents.levels.concat({
                ...newLevel,
                id: newId.toString()
            })
        };
    }

    try {
        fs.writeFileSync(
            process.cwd() + '/src/server/' + LEVELS_FILENAME,
            JSON.stringify(newContents),
        );
    } catch(err) {
        response.status(500).send('Error on writing the level on disk!');
        return;
    }

    response.sendStatus(200);
});

app.listen(PORT);
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';

import { port as PORT } from './server.json';

type Level = {
    id: string;
    name: string;
    data: string;
};

type Contents = {
    levels: Array<Level>;
};

const filename = 'levels.json';

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

const getFileContents = (): Contents =>
    JSON.parse(
        fs.readFileSync(process.cwd() + '/src/server/' + filename).toString(),
    );

app.get('/', (_req, res) => {
    res.sendFile(gameApp('index.html'));
});

app.get('/list', function (request: any, response: any) {
    const contents = getFileContents();
    const names = contents.levels.map(level => ({
        id: level.id,
        name: level.name,
    }));
    response.send(names);
});

app.get('/new', function (request: any) {
    const newLevelData = request.body;
    const contents = getFileContents();
    const lastId = contents.levels.slice(-1)[0];
    const newId = lastId === undefined ? 0 : +lastId + 1;
    const levelData: Level = {
        id: newId.toString(),
        name: 'level' + newId,
        data: newLevelData,
    };

    const newContents = { levels: contents.levels.concat([levelData]) };
    fs.writeFileSync(
        process.cwd() + '/src/server/' + 'levelsTest.json',
        JSON.stringify(newContents),
    );
});

app.get('/level', function (request: any, response: any) {
    const contents = getFileContents();
    const id = request.query.id;
    const level = contents.levels.find(level => level.id === id);
    response.send(level);
});

app.post('/save', function (request: any, response: any) {
    const newLevel = request.body;
    const contents = getFileContents();
    const newLevels = contents.levels.map(level => {
        if (level.id === newLevel.id) {
            level.data = newLevel.data;
        }
        return level;
    });
    const newContents = { levels: newLevels };
    fs.writeFileSync(
        process.cwd() + '/src/server/' + filename,
        JSON.stringify(newContents),
    );
    response.sendStatus(200);
});

app.listen(PORT);

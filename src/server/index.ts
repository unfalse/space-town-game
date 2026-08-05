import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const PORT = Number(process.env.PORT) || 80;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Level = {
    id: string;
    name: string;
    data: string;
};

type Contents = {
    levels: Array<Level>;
};

const resolvePath = (p: string) => p.replace(/^~/, os.homedir());
const LEVELS_PATH = resolvePath(
    process.env.LEVELS_PATH ?? path.join(__dirname, 'levels.json'),
);

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

const getFileContents = (): Contents => {
    try {
        const levelsContents = fs.readFileSync(LEVELS_PATH).toString();
        return JSON.parse(levelsContents);
    } catch (error) {
        console.error('Loading levels.json error: ', JSON.stringify(error));
    }

    return {
        levels: [],
    };
};

app.get('/', (_req: Request, res: Response) => {
    res.sendFile(gameApp('index.html'));
});

app.get('/list', function (_request: Request, response: Response) {
    const contents = getFileContents();
    const names = contents.levels.map(level => ({
        id: level.id,
        name: level.name,
    }));

    response.send(names);
});

app.post('/new', function (request: Request, response: Response) {
    const levelName = request.body?.name ?? '';
    const contents = getFileContents();
    const lastId = contents.levels.slice(-1)[0];
    const newId = lastId === undefined ? 0 : Number(lastId.id) + 1;
    const levelData: Level = {
        id: newId.toString(),
        name: levelName,
        data: '',
    };
    const newContents = { levels: contents.levels.concat([levelData]) };

    try {
        fs.writeFileSync(LEVELS_PATH, JSON.stringify(newContents));
    } catch (error) {
        console.error('Error on creating a new level: ', JSON.stringify(error));
        response.sendStatus(500);
        return;
    }
    response.sendStatus(200);
});

app.get('/level', function (request: Request, response: Response) {
    const contents = getFileContents();
    const id = request.query.id;
    const level = contents.levels.find(level => level.id === id);
    response.send(level);
});

app.post('/save', function (request: Request, response: Response) {
    const newLevel = request.body;
    const contents = getFileContents();
    const newLevels = contents.levels.map(level => {
        if (level.id === newLevel.id) {
            level.data = newLevel.data;
        }
        return level;
    });
    const newContents = { levels: newLevels };

    try {
        fs.writeFileSync(LEVELS_PATH, JSON.stringify(newContents));
    } catch (error) {
        console.error('Error on saving a level: ', JSON.stringify(error));
        response.sendStatus(500);
        return;
    }
    response.sendStatus(200);
});

app.listen(PORT);

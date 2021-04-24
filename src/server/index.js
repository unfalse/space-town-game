'use strict';
exports.__esModule = true;
var cors_1 = require('cors');
var express_1 = require('express');
var fs_1 = require('fs');
var server_json_1 = require('./server.json');
var filename = 'levels.json';
var app = express_1['default']();
app.use(express_1['default'].json());
app.use(cors_1['default']());
app.options('*', cors_1['default']());
console.log('Server is running on port', server_json_1.port);
var getFileContents = function () {
    return JSON.parse(
        fs_1['default']
            .readFileSync(process.cwd() + '/src/server/' + filename)
            .toString(),
    );
};
app.get('/list', function (request, response) {
    var contents = getFileContents();
    var names = contents.levels.map(function (level) {
        return { id: level.id, name: level.name };
    });
    response.send(names);
});
app.get('/new', function (request) {
    var newLevelData = request.body;
    var contents = getFileContents();
    var lastId = contents.levels.slice(-1)[0];
    var newId = lastId === undefined ? 0 : +lastId + 1;
    var levelData = {
        id: newId.toString(),
        name: 'level' + newId,
        data: newLevelData,
    };
    var newContents = { levels: contents.levels.concat([levelData]) };
    fs_1['default'].writeFileSync(
        process.cwd() + '/src/server/' + 'levelsTest.json',
        JSON.stringify(newContents),
    );
});
app.get('/level', function (request, response) {
    var contents = getFileContents();
    var id = request.query.id;
    var level = contents.levels.find(function (level) {
        return level.id === id;
    });
    response.send(level);
});
app.post('/save', function (request, response) {
    var newLevel = request.body;
    var contents = getFileContents();
    var newLevels = contents.levels.map(function (level) {
        if (level.id === newLevel.id) {
            level.data = newLevel.data;
        }
        return level;
    });
    var newContents = { levels: newLevels };
    fs_1['default'].writeFileSync(
        process.cwd() + '/src/server/' + filename,
        JSON.stringify(newContents),
    );
    response.sendStatus(200);
});
app.listen(server_json_1.port);

import { CONST } from './const';
import { Obstacle, StaticShip, SpaceBrick, Border} from './cswai';
import { Player } from './player';

import { PORT } from './server/const';

export const Editor = class {
    constructor() {
        this.CONST = CONST;
        this.obstacle = Obstacle;
        this.staticShip = StaticShip;
        this.spaceBrick = SpaceBrick;
        this.border = Border;
        this.player = Player;
        this.currentLevelObj = {
            id: null,
            name: '',
            data: ''
        };
    }

    init(BTankInst) {
        this.BTankInst = BTankInst;

        this.editorBlock = document.querySelector("#editorBlock");
        this.editorCurrentObject = document.querySelector(
            "#editorCurrentObject"
        );
        this.editorNewBtn  = document.querySelector("#editorNewBtn");
        this.editorPlayBtn = document.querySelector("#editorPlayBtn");
        this.editorSaveBtn = document.querySelector("#editorSaveBtn");
        this.editorSaveAsBtn = document.querySelector("#editorSaveAsBtn");
        this.editorLoadBtn = document.querySelector("#editorLoadBtn");
        this.editorFileListContainer = document.querySelector("#editorFileList");
        window.__editor_load_str = "";

        this.editorCurrentObjectBrush = {
            type: this.CONST.TYPES.OBSTACLE,
            imageUrl: "url('images/obstacle2.png')",
        };
        this.editorMode = false;
        this.editorUnits = [];
        this.editorGhosts = [];
        this.currentShipWithWaypoints = null;
        this.playerCell = { x: 0, y: 0 };

        this.editorNewBtn.addEventListener(
            "click",
            this.newEditorLevel.bind(this)
        );

        this.editorPlayBtn.addEventListener(
            "click",
            this.playEditorLevel.bind(this)
        );

        this.editorSaveBtn.addEventListener(
            "click",
            this.saveEditorLevel.bind(this)
        );

        this.editorSaveAsBtn.addEventListener(
            "click",
            this.saveAsEditorLevel.bind(this)
        );

        this.editorLoadBtn.addEventListener(
            "click",
            this.showLevelChooseDialog.bind(this)
        );
    }

    newEditorLevel() {
        this.prepareLevelForSaving();
    }

    uploadNewLevel() {
        fetch(`http://localhost:${PORT}/new`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            //make sure to serialize your JSON body
            body: JSON.stringify({
                ...this.currentLevelObj
            })
        })
        .then( (response) => { 
            //do something awesome that makes the world a better place
            alert('Level has been added!');
        });
    }

    playEditorLevel() {
        const player = this.BTankInst.getAllShips()[0];
        this.BTankInst.destroyAll();

        // TODO: add player1 to the empty array
        player.init(this.playerCell.x, this.playerCell.y, this.CONST.USER, this.BTankInst);
        this.BTankInst.addShip(player);

        this.BTankInst.placeBorders();

        this.editorUnits.forEach(function (unit) {
            if (
                unit.type ===
                this.CONST.TYPES.SHIP /*&& unit.iam !== this.CONST.USER*/
            ) {
                this.BTankInst.createCSW(
                    unit.x,
                    unit.y,
                    this.CONST.COMPUTER,
                    0,
                    this.CONST.TYPES.SHIP,
                    false,
                    unit.wayPoints
                );
            }
            if (unit.type === this.CONST.TYPES.OBSTACLE) {
                this.BTankInst.createCSW(
                    unit.x,
                    unit.y,
                    this.CONST.COMPUTER,
                    0,
                    this.CONST.TYPES.OBSTACLE
                );
            }
            if (unit.type === this.CONST.TYPES.SPACEBRICK) {
                this.BTankInst.createCSW(
                    unit.x,
                    unit.y,
                    this.CONST.COMPUTER,
                    0,
                    this.CONST.TYPES.SPACEBRICK
                );
            }
        }, this);

        this.toggleEditorControls();
    }

    prepareLevelForSaving() {
        let levelData = [this.playerCell.x, this.playerCell.y].join(";") + "|";
        levelData += this.editorUnits.reduce(
            function (prev, curr) {
                let wayPoints = "";
                if (curr.type === this.CONST.TYPES.SHIP)
                    wayPoints = JSON.stringify(curr.wayPoints);
                return (
                    prev +
                    wayPoints +
                    ";" +
                    !!curr.ghost +
                    ";" +
                    curr.type +
                    ";" +
                    curr.y +
                    ";" +
                    curr.x +
                    "|"
                );
            }.bind(this),
            ""
        );
        this.currentLevelObj.data = levelData;
    }

    uploadLevel() {
        fetch(`http://localhost:${PORT}/save`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            //make sure to serialize your JSON body
            body: JSON.stringify({
                ...this.currentLevelObj
            })
        })
        .then( (response) => { 
            //do something awesome that makes the world a better place
            alert('Level has been saved!');
        });
    }

    saveEditorLevel() {
        this.prepareLevelForSaving();
        this.uploadLevel();
    }

    saveAsEditorLevel() {
        // TODO: show an input to enter the new name and ok and cancel buttons
    }

    setCurrentShipWithWaypoints(ship) {
        this.currentShipWithWaypoints = ship;
    }

    showLevelChooseDialog() {
        fetch(`http://localhost:${PORT}/list`)
            .then(r => r.json())
            .then(r => {
                this.editorFileListContainer.style.display = "block";
                const ul = document.createElement('ul');
                const title = document.createElement('span');
                title.innerText = 'Which level to open?';
                this.editorFileListContainer.append(title);
                r.forEach(level => {
                    const li = document.createElement('li');
                    li.innerText = level.name;
                    li.addEventListener(
                        'click',
                        (function() {
                            this.currentLevelObj = {
                                ...level
                            };
                            this.loadTheEditorLevel(level.id);
                            this.editorFileListContainer.style.display = "none";
                            title.innerText = '';
                            this.editorFileListContainer.removeChild(ul);
                        }).bind(this)
                    );
                    ul.append(li);
                });
                this.editorFileListContainer.append(ul);
            });
    }

    loadTheEditorLevel(id) {
        const DATA_SEPARATOR = '|';
        fetch(`http://localhost:${PORT}/level?id=${id}`)
            .then(r => r.json())
            .then(r => {
               r.data.split(DATA_SEPARATOR)
                .forEach(function (objStr, strIndex) {
                    const fields = objStr.split(";");
                    if (strIndex === 0) {
                        //this.playerCell = { x: fields[0], y: fields[1] };
                        this.createEditorUnit(
                            fields[0],
                            fields[1],
                            this.CONST.TYPES.PLAYER,
                            true
                        );
                    }
                    if (strIndex > 0 && objStr !== "") {
                        if (objStr !== "") {
                            if (fields.length === 1) {
                                const splitted = fields[0].split(',');
                                this.createEditorUnit(
                                    +splitted[1], // x
                                    +splitted[2], // y
                                    +splitted[0] // type
                                );
                            } else {
                                this.createEditorUnit(
                                    +fields[4], // x
                                    +fields[3], // y
                                    +fields[2], // type
                                    //fields[1], // ghost
                                    false,
                                    fields[0] ? JSON.parse(fields[0]) : [] // wayPoints
                                );
                            }
                        }
                    }
                }, this);
            });
    }
    
    pushNewObject(obj, ghost) {
        if (ghost) {
            this.editorGhosts.push(obj);
        } else {
            this.editorUnits.push(obj);
        }
    }

    getEditorUnitAt(x, y) {
        return this.editorUnits.find(function (unit) {
            return unit.x === x && unit.y === y;
        });
    }

    getEditorWaypointAt(x, y) {
        if (!this.currentShipWithWaypoints) return null;
        return this.currentShipWithWaypoints.wayPoints.find(function (wp) {
            return wp[0] === x && wp[1] === y;
        });
    }

    createEditorUnit(x, y, type, ghost, wayPoints) {
        let newUnit = null;
        const who = this.CONST.COMPUTER;
        if (
            this.editorUnits.some(function (unit) {
                return unit.x === x && unit.y === y;
            })
        ) {
            return;
        }
        if (
            this.editorGhosts.some(function (ghost) {
                return ghost.x === x && ghost.y === y;
            })
        ) {
            return;
        }
        if (type === this.CONST.TYPES.OBSTACLE) {
            newUnit = new this.obstacle(this.CONST);
            newUnit.init(x, y, who, this.BTankInst);
            this.pushNewObject(newUnit, ghost);
        }
        if (type === this.CONST.TYPES.SHIP) {
            newUnit = new this.staticShip(this.CONST, this.bullet);
            newUnit.init(x, y, who, this.BTankInst, wayPoints);
            this.pushNewObject(newUnit, ghost);
        }
        if (type === this.CONST.TYPES.SPACEBRICK) {
            newUnit = new this.spaceBrick(this.CONST, this.bullet);
            newUnit.init(x, y, who, this.BTankInst);
            this.pushNewObject(newUnit, ghost);
        }
        if (type === this.CONST.TYPES.BORDER) {
            newUnit = new this.border(this.CONST);
            newUnit.init(x, y, who, this.BTankInst);
            this.pushNewObject(newUnit, ghost);
        }
        if (type === this.CONST.TYPES.PLAYER) {
            this.playerCell = { x: +x, y: +y };
            newUnit = new this.player(this.CONST, this.bullet);
            newUnit.init(x, y, this.CONST.USER, this.BTankInst);
            this.pushNewObject(newUnit, true);
        }
    }

    addEditorWaypoint(x, y) {
        if (!this.currentShipWithWaypoints) return;
        const newWp = [x, y];
        this.currentShipWithWaypoints.wayPoints.push(newWp);
    }

    removeEditorObjectAt(x, y) {
        this.editorUnits = this.editorUnits.filter(function (unit) {
            return !(unit.x === x && unit.y === y);
        });
    }

    getFirstEditorObjectByType(type) {
        
    }

    removeEditorWaypointAt(x, y) {
        if (!this.currentShipWithWaypoints) return;
        this.currentShipWithWaypoints.wayPoints = this.currentShipWithWaypoints.wayPoints.filter(
            function (wp) {
                return !(wp[0] === x && wp[1] === y);
            }
        );
    }

    setCurrentEditorBrushObject(brushObjectType) {
        switch (brushObjectType) {
            case this.CONST.TYPES.SHIP: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/csw-mt5bigger2x_0.png')",
                };
                break;
            }
            case this.CONST.TYPES.OBSTACLE: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/obstacle2.png')",
                };
                break;
            }
            case this.CONST.TYPES.SPACEBRICK: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/space_brick-0.png')",
                };
                break;
            }
            case this.CONST.TYPES.ERASER: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "",
                };
                break;
            }
            case this.CONST.TYPES.WAYPOINT: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/counter-9.png')",
                };
                this.setCurrentShipWithWaypoints(null);
                break;
            }
            case this.CONST.TYPES.WAYPOINTERASER: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/counter-0.png')",
                };
                break;
            }
            case this.CONST.TYPES.PLAYER: {
                this.editorCurrentObjectBrush = {
                    type: brushObjectType,
                    imageUrl: "url('images/csw-mt9bigger2x_90.png')",
                };
                break;
            }
            default:
                break;
        }
        this.editorCurrentObject.style.backgroundImage = this.editorCurrentObjectBrush.imageUrl;
    }

    placeBorders() {
        for (var x = 0; x < this.CONST.MAXX + 2; x++) {
            this.createEditorUnit(
                (x - 1) * this.CONST.CELLSIZES.MAXX,
                -1 * this.CONST.CELLSIZES.MAXY,
                this.CONST.TYPES.BORDER,
                true
            );
            this.createEditorUnit(
                (x - 1) * this.CONST.CELLSIZES.MAXX,
                this.CONST.MAXY * this.CONST.CELLSIZES.MAXY,
                this.CONST.TYPES.BORDER,
                true
            );
        }

        for (var y = 0; y < this.CONST.MAXY + 1; y++) {
            this.createEditorUnit(
                -1 * this.CONST.CELLSIZES.MAXX,
                (y - 1) * this.CONST.CELLSIZES.MAXY,
                this.CONST.TYPES.BORDER,
                true
            );
            this.createEditorUnit(
                this.CONST.MAXX * this.CONST.CELLSIZES.MAXX,
                (y - 1) * this.CONST.CELLSIZES.MAXY,
                this.CONST.TYPES.BORDER,
                true
            );
        }
    }

    toggleEditorControls() {
        this.editorMode = !this.editorMode;
        //const gameInfo = this.BTankInst.gameInfo;
        if (this.editorMode) {
            //gameInfo.style.display = "none";

            this.editorBlock.style.display = "flex";
            this.editorBlock.style.justifyContent = "center";

            this.editorCurrentObject.style.backgroundImage = this.editorCurrentObjectBrush.imageUrl;
            this.editorCurrentObject.style.width = "40px";
            this.editorCurrentObject.style.height = "40px";
            this.placeBorders();
        } else {
            //gameInfo.style.display = "";
            //gameInfo.style.textAlign = "center";
            this.editorBlock.style.display = "none";
        }
    }
};

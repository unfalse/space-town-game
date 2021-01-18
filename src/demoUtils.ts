import { BTankManager } from "./btank";
import { CONST } from "./const";
import { ObjectsFactory } from "./objFactory";

const addDemoCounters = (objFactoryGameInst: ObjectsFactory, BTankInst: BTankManager) => {
    BTankInst.pushNewObjects([
        objFactoryGameInst.createCSW(10, 10, CONST.COMPUTER, CONST.TYPES.COUNTER),
        objFactoryGameInst.createCSW(50, 10, CONST.COMPUTER, CONST.TYPES.COUNTER),
        objFactoryGameInst.createCSW(90, 10, CONST.COMPUTER, CONST.TYPES.COUNTER),
        objFactoryGameInst.createCSW(
            130,
            10,
            CONST.COMPUTER,
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            170,
            10,
            CONST.COMPUTER,
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            210,
            10,
            CONST.COMPUTER,
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            250,
            10,
            CONST.COMPUTER,
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            290,
            10,
            CONST.COMPUTER,
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            330,
            10,
            CONST.COMPUTER,
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(10, 50, CONST.COMPUTER,  CONST.TYPES.COUNTER),
        objFactoryGameInst.createCSW(50, 50, CONST.COMPUTER,  CONST.TYPES.COUNTER),
        objFactoryGameInst.createCSW(90, 50, CONST.COMPUTER,  CONST.TYPES.COUNTER),
        objFactoryGameInst.createCSW(
            130,
            50,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            170,
            50,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            210,
            50,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            250,
            50,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            290,
            50,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            330,
            50,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(10, 90, CONST.COMPUTER,  CONST.TYPES.COUNTER),
        objFactoryGameInst.createCSW(50, 90, CONST.COMPUTER,  CONST.TYPES.COUNTER),
        objFactoryGameInst.createCSW(90, 90, CONST.COMPUTER,  CONST.TYPES.COUNTER),
        objFactoryGameInst.createCSW(
            130,
            90,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            170,
            90,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            210,
            90,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            250,
            90,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            290,
            90,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        ),
        objFactoryGameInst.createCSW(
            330,
            90,
            CONST.COMPUTER,
            
            CONST.TYPES.COUNTER
        )],
        false
    );
};

export { addDemoCounters };
import { BTankManager } from './btank';
import { CONST } from './const';
// import { IObjectsFactory } from "./interfaces";
import { ObjectsFactory } from './objFactory';
import { ObjectType } from './types';

export const placeBorders = (
    objFactoryInst: ObjectsFactory,
    BTankInst: BTankManager,
): void => {
    const borders = [];
    for (let x = 0; x < CONST.MAXX + 2; x++) {
        borders.push(
            objFactoryInst.createCSW(
                (x - 1) * CONST.CELLSIZES.MAXX,
                -1 * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                ObjectType.INGAMEBORDER,
            ),
        );
        borders.push(
            objFactoryInst.createCSW(
                (x - 1) * CONST.CELLSIZES.MAXX,
                CONST.MAXY * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                ObjectType.INGAMEBORDER,
            ),
        );
    }

    for (let y = 0; y < CONST.MAXY + 1; y++) {
        borders.push(
            objFactoryInst.createCSW(
                -1 * CONST.CELLSIZES.MAXX,
                (y - 1) * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                ObjectType.INGAMEBORDER,
            ),
        );
        borders.push(
            objFactoryInst.createCSW(
                CONST.MAXX * CONST.CELLSIZES.MAXX,
                (y - 1) * CONST.CELLSIZES.MAXY,
                CONST.COMPUTER,
                ObjectType.INGAMEBORDER,
            ),
        );
    }

    BTankInst.pushNewObjects(borders, true);
};

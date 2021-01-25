import { ObjectType, WayPoints, Who } from "../types";

export interface IPlayer {
  PLAYER_BULLETS_INTERVAL: number;
}

export interface IObjectsFactory {
  createCSW(x: number,
      y: number,
      who: Who, // TODO: this field should be in ship class (csw or cswai or obstacle)
      typeParam?: ObjectType,
      ghost?: boolean,
      wayPoints?: WayPoints[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICSWAI_customPaths {
  
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IObstacle {
  
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISpaceBrick {
  
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBorder {
  
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IStaticShip {

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBaseCPU {

}
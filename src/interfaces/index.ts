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
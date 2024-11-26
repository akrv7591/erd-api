import { XYPosition } from "../../types/broadcast-data";

export namespace CLIENT {
  export namespace CURSOR {
    export enum TYPE {
      CHANGE = "client:cursor-change",
    }

    export type CHANGE = {
      type: TYPE.CHANGE
      value: {
        id: string;
        cursor: XYPosition | null;
      },
    }

    export type DATA = CHANGE
  }

  export type TYPE = CURSOR.TYPE
  export type DATA = CURSOR.DATA
}

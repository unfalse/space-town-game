import { InertiaDirections } from "./types";

console.log('utils!');

export const resetInertiaDirections = (): InertiaDirections => ({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    '-1': 0,
});

export const mergeInertiaDirections = (id1: InertiaDirections, id2: InertiaDirections) => ({
    0: id1[0] || id2[0],
    1: id1[1] || id2[1],
    2: id1[2] || id2[2],
    3: id1[3] || id2[3],
    '-1': id1['-1'] || id2['-1'],
});

export const Utils = {
    KEY_CODE: {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        DOWN: 'ArrowDown',
        a_KEY: 'a',
        h_KEY: 'h',
        s_KEY: 's',
        F1_KEY: 'F1',
        N1_KEY: '1',
        N2_KEY: '2',
        N3_KEY: '3',
        N4_KEY: '4',
        N5_KEY: '5',
        N6_KEY: '6',
        N7_KEY: '7',
    },

    // event.type должен быть keypress
    getChar(event: KeyboardEvent): string {
        if (event.which == null) {
            // IE
            if (event.keyCode < 32) return null; // special symbol
            return String.fromCharCode(event.keyCode);
        }

        if (event.which != 0 && event.charCode != 0) {
            // все кроме IE
            if (event.which < 32) return null; // special character
            return String.fromCharCode(event.which); // others
        }

        return null; // special character
    },

    // использование Math.round() даст неравномерное распределение!
    getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    text(str: string): void {
        console.log(str);
    },
};

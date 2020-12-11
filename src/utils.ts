console.log("utils!");

export const Utils = {
  KEY_CODE: {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        DOWN: 'ArrowDown',
        a_KEY: 'a',
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
    getChar(event: KeyboardEvent) {
        if (event.which == null) {
            // IE
            if (event.keyCode < 32) return null; // спец. символ
            return String.fromCharCode(event.keyCode);
        }

        if (event.which != 0 && event.charCode != 0) {
            // все кроме IE
            if (event.which < 32) return null; // спец. символ
            return String.fromCharCode(event.which); // остальные
        }

        return null; // спец. символ
    },

    // использование Math.round() даст неравномерное распределение!
    getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    text(str: string) {
        console.log(str);
    }
};

console.log("utils!");

export const Utils = {
  KEY_CODE: {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        a_KEY: 65,
        s_KEY: 83,
        F1_KEY: 112,
        N1_KEY: 49,
        N2_KEY: 50,
        N3_KEY: 51,
        N4_KEY: 52,
        N5_KEY: 53,
        N6_KEY: 54,
        N7_KEY: 55,
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

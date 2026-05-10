export const Utils = {
    KEY_CODE: {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        DOWN: 'ArrowDown',
        a_KEY: 'a',
        d_KEY: 'd',
        w_KEY: 'w',
        h_KEY: 'h',
        s_KEY: 's',
        t_KEY: 't',
        p_KEY: 'p',
        SPACE: ' ',
        F1_KEY: 'F1',
        N1_KEY: '1',
        N2_KEY: '2',
        N3_KEY: '3',
        N4_KEY: '4',
        N5_KEY: '5',
        N6_KEY: '6',
        N7_KEY: '7',
    },

    getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    text(str: string): void {
        console.log(str);
    },
};

import { port } from './server/server.json';

console.log('utils!');

// let logArray: string[] = [];

const PORT = process.env.NODE_ENV === 'production' ? 80 : port;

const EDITOR_SERVER_ADDRESS = `${window.location.protocol}//${window.location.hostname}:${PORT}`;

let logsEnabled = false;

const SERVER_ADDRESS = `${window.location.protocol}//${
    window.location.hostname
}:${8666}`;

export const Utils = {
    KEY_CODE: {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        DOWN: 'ArrowDown',
        a_KEY: 'a',
        h_KEY: 'h',
        s_KEY: 's',
        l_KEY: 'l', // toggle adding logs
        p_KEY: 'p', // flush logs
        F1_KEY: 'F1',
        N1_KEY: '1',
        N2_KEY: '2',
        N3_KEY: '3',
        N4_KEY: '4',
        N5_KEY: '5',
        N6_KEY: '6',
        N7_KEY: '7',
        EQUAL_KEY: '=',
        MINUS_KEY: '-',
    },

    logArray: [] as string[],

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

    outputDebugInfo(paramsArr: string[]): void {
        const debugPanel = document.querySelector('#debug_panel');
        const firstStrings = `logsEnabled: ${logsEnabled.toString()} <br> logs counter: ${
            this.logArray.length
        } <br> `;
        debugPanel.innerHTML = paramsArr.reduce(
            (prev: string, curr: string) => `${prev}<br>${curr}`,
            firstStrings,
        );
    },

    addLog(str: string): void {
        if (logsEnabled) this.logArray.push(str);
    },

    toggleLogs(): void {
        logsEnabled = !logsEnabled;
    },

    flushLogs(): void {
        // debugger;
        fetch(`${EDITOR_SERVER_ADDRESS}/flushlogs`, {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.logArray),
        }).then(() => {
            console.info('Logs flushed!');
            this.logArray = [];
        });
    },
};

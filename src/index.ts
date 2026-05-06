import { Game } from './game';

const levelsSequence = [7];

class MainMenu {
    constructor() {
    }

    init(): void {
        const newGameBtn = document.querySelector('#newGameBtn');
        const createLevelBtn = document.querySelector('#createLevelBtn');

        if (newGameBtn==null || createLevelBtn==null) throw new Error('Buttons were not found in index.html');

        newGameBtn.addEventListener('click', this.startNewGame.bind(this));
        createLevelBtn.addEventListener('click', this.createALevel.bind(this));
    }

    startNewGame(): void {
        const mainMenuBlock: HTMLDivElement = document.querySelector('.main-menu') as HTMLDivElement;
        mainMenuBlock.style.display = 'none';

        const gameInstance = new Game();
        gameInstance.start(7);
    }

    createALevel(): void {
        console.log('create a level');
    }
}

const mainMenuInstance = new MainMenu();

mainMenuInstance.init();

// const gameInstance = new Game();

// gameInstance.start();

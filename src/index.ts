import { Game } from './game';

const levelsSequence = [7];

class MainMenu {
    newGameBtn!: HTMLButtonElement | null;
    createLevelBtn!: HTMLButtonElement | null;
    loadLevelBtn!: HTMLButtonElement | null;
    mainMenuItems!: HTMLDivElement | null;
    mainMenuBlock!: HTMLDivElement | null;
    levelNameInput!: HTMLInputElement | null;
    okBtn!: HTMLButtonElement | null;
    cancelBtn!: HTMLButtonElement | null;

    init(): void {
        this.newGameBtn = document.querySelector('#newGameBtn');
        this.createLevelBtn = document.querySelector('#createLevelBtn');
        this.loadLevelBtn = document.querySelector('#loadLevelBtn');
        this.mainMenuItems = document.querySelector('.main-menu-items');
        this.mainMenuBlock = document.querySelector('.main-menu');
        this.levelNameInput = document.querySelector('.level-name-input');
        this.okBtn = document.querySelector('#okBtn');
        this.cancelBtn = document.querySelector('#cancelBtn');

        if (
            this.newGameBtn == null ||
            this.createLevelBtn == null ||
            this.loadLevelBtn == null ||
            this.mainMenuItems == null ||
            this.mainMenuBlock == null ||
            this.levelNameInput == null ||
            this.okBtn == null ||
            this.cancelBtn == null
        )
            throw new Error('Buttons were not found in index.html');

        this.newGameBtn.addEventListener('click', this.startNewGame.bind(this));
        this.createLevelBtn.addEventListener(
            'click',
            this.createALevel.bind(this),
        );
        this.loadLevelBtn.addEventListener('click', this.loadALevel.bind(this));
    }

    startNewGame(): void {
        if (this.mainMenuBlock == null) return;

        this.mainMenuBlock.style.display = 'none';

        const gameInstance = new Game();

        gameInstance.start(7);
    }

    createALevel(): void {
        if (
            this.mainMenuItems == null ||
            this.levelNameInput == null ||
            this.okBtn == null
        )
            return;

        this.mainMenuItems.style.display = 'none';
        this.levelNameInput.style.display = 'block';

        this.okBtn.addEventListener('click', () => {
            // const levelName = this.levelNameInput.value;
        });
    }

    loadALevel(): void {}
}

const mainMenuInstance = new MainMenu();

mainMenuInstance.init();

// const gameInstance = new Game();

// gameInstance.start();

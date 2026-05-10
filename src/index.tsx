import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Game } from './game';

const DEFAULT_LEVEL_ID = 7;

type MenuMode = 'main' | 'create-level';

function Logo() {
    return (
        <div className="game-logo" aria-label="Space Town">
            {'SPACETOWN'.split('').map((letter, index) => (
                <span key={`${letter}-${index}`}>{letter}</span>
            ))}
        </div>
    );
}

type MainMenuProps = {
    onStart: () => void;
};

function MainMenu({ onStart }: MainMenuProps) {
    const [menuMode, setMenuMode] = useState<MenuMode>('main');
    const [levelName, setLevelName] = useState('');

    return (
        <div className="main-menu">
            <Logo />

            {menuMode === 'main' && (
                <div className="main-menu-items">
                    <button id="newGameBtn" type="button" onClick={onStart}>
                        Start New Game
                    </button>
                    <button
                        id="createLevelBtn"
                        type="button"
                        onClick={() => setMenuMode('create-level')}
                    >
                        Create A Level
                    </button>
                    <button id="loadLevelBtn" type="button">
                        Load A Level
                    </button>
                </div>
            )}

            {menuMode === 'create-level' && (
                <div className="level-name-input level-name-input--visible">
                    <input
                        id="levelNameInput"
                        type="text"
                        placeholder="Enter level name"
                        value={levelName}
                        onChange={event => setLevelName(event.target.value)}
                    />
                    <button id="okBtn" type="button">
                        OK
                    </button>
                    <button
                        id="cancelBtn"
                        type="button"
                        onClick={() => {
                            setLevelName('');
                            setMenuMode('main');
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

function App() {
    const [hasGameStarted, setHasGameStarted] = useState(false);
    const gameRef = useRef<Game | null>(null);

    useEffect(() => {
        if (!hasGameStarted || gameRef.current !== null) return;

        const gameInstance = new Game();
        gameRef.current = gameInstance;
        gameInstance.start(DEFAULT_LEVEL_ID);
    }, [hasGameStarted]);

    return (
        <div id="container">
            {!hasGameStarted && (
                <MainMenu onStart={() => setHasGameStarted(true)} />
            )}

            <div id="gameOverBlock" />
            <button
                id="playAgainBtn"
                type="button"
                onClick={() => window.location.reload()}
            >
                Play again
            </button>

            <canvas id="gameField">Please, upgrade your browser.</canvas>

            <div id="editorUiRoot" />
        </div>
    );
}

const rootElement = document.querySelector('#root');

if (rootElement === null) {
    throw new Error('Root element not found on page');
}

createRoot(rootElement).render(<App />);

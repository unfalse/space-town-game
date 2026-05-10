import { createElement, useSyncExternalStore } from 'react';
import { createRoot, Root } from 'react-dom/client';

import type { Editor, LevelObject } from './editor';

type EditorUIState = {
    currentObjectImageUrl: string;
    editorHintVisible: boolean;
    editorMode: boolean;
    levels: LevelObject[];
    levelListVisible: boolean;
    levelsLoading: boolean;
    videoHintVisible: boolean;
};

const initialState: EditorUIState = {
    currentObjectImageUrl: '',
    editorHintVisible: false,
    editorMode: false,
    levels: [],
    levelListVisible: false,
    levelsLoading: false,
    videoHintVisible: false,
};

const queryOrThrow = (id: string) => {
    const element = document.querySelector(id);
    if (element === null) throw new Error('Element not found on page');
    return element;
};

class EditorUI {
    editorInst: Editor;
    private listeners = new Set<() => void>();
    private root: Root | null = null;
    private state: EditorUIState = initialState;

    constructor(editorInst: Editor) {
        this.editorInst = editorInst;
    }

    init(): void {
        if (this.root) return;

        const editorRoot = queryOrThrow('#editorUiRoot');
        this.root = createRoot(editorRoot);
        this.root.render(createElement(EditorUIView, { editorUI: this }));
    }

    getSnapshot = (): EditorUIState => this.state;

    subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    newEditorLevel = (): void => {
        this.editorInst.newEditorLevel();
    };

    playEditorLevel = (): void => {
        this.editorInst.playEditorLevel();
        this.toggleEditorControls();
    };

    saveEditorLevel = (): void => {
        this.editorInst.saveEditorLevel();
    };

    saveAsEditorLevel = (): void => {
        this.editorInst.saveAsEditorLevel();
    };

    showLevelChooseDialog = async (): Promise<void> => {
        this.setState({ levelListVisible: true, levelsLoading: true });

        try {
            const levels = await this.editorInst.getAvailableLevels();
            this.setState({ levels, levelsLoading: false });
        } catch (error) {
            console.log(error);
            this.setState({ levels: [], levelsLoading: false });
        }
    };

    chooseLevel = async (level: LevelObject): Promise<void> => {
        if (level.id === null) return;

        await this.editorInst.loadTheEditorLevel(level.id);
        this.setState({
            levelListVisible: false,
            levels: [],
        });
    };

    setEditorCurrentObjectIconImage(): void {
        this.setState({
            currentObjectImageUrl: this.editorInst.editorCurrentObjectBrush.imageUrl,
        });
    }

    toggleEditorControls(): void {
        this.editorInst.editorMode = !this.editorInst.editorMode;

        if (this.editorInst.editorMode) {
            this.editorInst.placeBorders();
        }

        this.setState({
            currentObjectImageUrl: this.editorInst.editorCurrentObjectBrush.imageUrl,
            editorMode: this.editorInst.editorMode,
        });
    }

    toggleEditorHint(): void {
        this.setState({
            editorHintVisible: !this.state.editorHintVisible,
        });
    }

    toggleVideoHint(): void {
        this.setState({
            videoHintVisible: !this.state.videoHintVisible,
        });
    }

    private setState(nextState: Partial<EditorUIState>): void {
        this.state = {
            ...this.state,
            ...nextState,
        };

        this.listeners.forEach(listener => listener());
    }
}

type EditorUIViewProps = {
    editorUI: EditorUI;
};

function EditorUIView({ editorUI }: EditorUIViewProps) {
    const state = useSyncExternalStore(
        editorUI.subscribe,
        editorUI.getSnapshot,
        editorUI.getSnapshot,
    );

    return createElement(
        'div',
        null,
        createElement(EditorControls, { editorUI, state }),
        createElement(EditorHint, {
            visible: state.editorHintVisible,
        }),
        createElement(WaypointsHint, {
            visible: state.videoHintVisible,
        }),
    );
}

type EditorControlsProps = {
    editorUI: EditorUI;
    state: EditorUIState;
};

function EditorControls({ editorUI, state }: EditorControlsProps) {
    return createElement(
        'div',
        null,
        createElement(
            'div',
            { id: 'titleBlock' },
            createElement(LevelList, { editorUI, state }),
        ),
        createElement(
            'div',
            {
                id: 'editorBlock',
                className: state.editorMode ? 'editor-block--visible' : '',
            },
            createElement('div', {
                id: 'editorCurrentObject',
                style: {
                    backgroundImage: state.currentObjectImageUrl,
                },
            }),
            createElement(
                'button',
                {
                    disabled: true,
                    id: 'editorNewBtn',
                    onClick: editorUI.newEditorLevel,
                    type: 'button',
                },
                'New',
            ),
            createElement(
                'button',
                {
                    id: 'editorSaveBtn',
                    onClick: editorUI.saveEditorLevel,
                    type: 'button',
                },
                'Save',
            ),
            createElement(
                'button',
                {
                    disabled: true,
                    id: 'editorSaveAsBtn',
                    onClick: editorUI.saveAsEditorLevel,
                    type: 'button',
                },
                'Save As',
            ),
            createElement(
                'button',
                {
                    id: 'editorLoadBtn',
                    onClick: editorUI.showLevelChooseDialog,
                    type: 'button',
                },
                'Load',
            ),
            createElement(
                'button',
                {
                    id: 'editorPlayBtn',
                    onClick: editorUI.playEditorLevel,
                    type: 'button',
                },
                'Play',
            ),
        ),
    );
}

function LevelList({ editorUI, state }: EditorControlsProps) {
    return createElement(
        'div',
        {
            className: state.levelListVisible ? 'editor-file-list--visible' : '',
            id: 'editorFileList',
        },
        state.levelListVisible
            ? [
                  createElement(
                      'span',
                      { key: 'title' },
                      state.levelsLoading
                          ? 'Loading levels...'
                          : 'Which level to open?',
                  ),
                  createElement(
                      'ul',
                      { key: 'levels' },
                      state.levels.map(level =>
                          createElement(
                              'li',
                              {
                                  key: level.id ?? level.name,
                                  onClick: () => editorUI.chooseLevel(level),
                              },
                              level.name,
                          ),
                      ),
                  ),
              ]
            : null,
    );
}

type VisibilityProps = {
    visible: boolean;
};

function EditorHint({ visible }: VisibilityProps) {
    return createElement(
        'div',
        { className: visible ? 'editor-hint editor-hint--visible' : 'editor-hint' },
        createElement('p', null, 'Use arrows or WASD keys to fly around the game field.'),
        createElement('p', null, 'Use Space key to fire.'),
        createElement('p', null, 'Use "h" key to stop moving.'),
        createElement('p', null, 'Press F1 to access editor'),
        createElement(
            'ul',
            null,
            'Keys in editor:',
            createElement('li', null, '1 - eraser'),
            createElement('li', null, '2 - indestructible obstacle'),
            createElement('li', null, '3 - bot'),
            createElement('li', null, '4 - destructible obstacle'),
            createElement('li', null, '5 - waypoint'),
            createElement('li', null, '6 - waypoint eraser'),
            createElement('li', null, '7 - player'),
        ),
        createElement('p', null, 'In editor click on the game field to place objects.'),
        createElement('p', null, 'To play the level click "Play" button.'),
        createElement('p', null, 'Click "Load" to load saved levels.'),
        createElement('p', null, 'Refresh the page before loading a new level to avoid errors.'),
        createElement('p', null, 'In game press "t" to toggle this hint.'),
        createElement('p', null, 'In game press "p" to toggle waypoints video tutorial.'),
    );
}

function WaypointsHint({ visible }: VisibilityProps) {
    return createElement(
        'div',
        {
            className: visible
                ? 'waypoints-hint waypoints-hint--visible'
                : 'waypoints-hint',
        },
        createElement(
            'video',
            {
                autoPlay: true,
                height: 660,
                loop: true,
                muted: true,
                width: 660,
            },
            createElement('source', {
                src: 'video/waypoints-hint.mp4',
                type: 'video/mp4',
            }),
            'Your browser does not support the video tag.',
        ),
        createElement(
            'p',
            null,
            'Place a bot (a green ship) on the game field. To do it press 3 and click on any place on the game field.',
        ),
        createElement(
            'p',
            null,
            'Press 5 to choose the waypoint mode. Click on the ship to choose it. Click on a desired cell to set the first waypoint and so on.',
        ),
        createElement(
            'p',
            null,
            'To remove a waypoint press 6 and click on the waypoint you want to remove. Press "w" to toggle this window.',
        ),
    );
}

export { EditorUI };

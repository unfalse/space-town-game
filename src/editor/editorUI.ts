import { Editor } from './editor';

class EditorUI {
    editorInst: Editor;
    editorBlock: HTMLDivElement;
    editorCurrentObject: HTMLDivElement;
    buttons: Record<string, HTMLButtonElement> = {};

    constructor(editorInst: Editor) {
        this.editorInst = editorInst;
    }

    init(): void {
        this.editorBlock = document.querySelector('#editorBlock');
        this.editorCurrentObject = document.querySelector(
            '#editorCurrentObject',
        );
        this.buttons['new'] = document.querySelector('#editorNewBtn');
        this.buttons['play'] = document.querySelector('#editorPlayBtn');
        this.buttons['save'] = document.querySelector('#editorSaveBtn');
        this.buttons['saveas'] = document.querySelector('#editorSaveAsBtn');
        this.buttons['load'] = document.querySelector('#editorLoadBtn');
        const editorFileListContainer = document.querySelector(
            '#editorFileList',
        );

        this.buttons['new'].addEventListener(
            'click',
            this.editorInst.newEditorLevel.bind(this.editorInst),
        );

        this.buttons['play'].addEventListener(
            'click',
            this.editorInst.playEditorLevel.bind(this.editorInst),
        );

        this.buttons['save'].addEventListener(
            'click',
            this.editorInst.saveEditorLevel.bind(this.editorInst),
        );

        this.buttons['saveas'].addEventListener(
            'click',
            this.editorInst.saveAsEditorLevel.bind(this.editorInst),
        );

        this.buttons['load'].addEventListener(
            'click',
            this.editorInst.showLevelChooseDialog.bind(
                this.editorInst,
                editorFileListContainer,
            ),
        );
    }

    setEditorCurrentObjectIconImage(): void {
        this.editorCurrentObject.style.backgroundImage = this.editorInst.editorCurrentObjectBrush.imageUrl;
    }

    enableButton(name: string): void {
        if (this.buttons[name]) {
            this.buttons[name].disabled = false;
        }
    }

    disableButton(name: string): void {
        if (this.buttons[name]) {
            this.buttons[name].disabled = true;
        }
    }

    toggleEditorControls(): void {
        this.editorInst.editorMode = !this.editorInst.editorMode;
        if (this.editorInst.editorMode) {
            this.editorBlock.style.display = 'flex';
            // this.editorBlock.style.justifyContent = 'center';

            this.editorCurrentObject.style.backgroundImage = this.editorInst.editorCurrentObjectBrush.imageUrl;
            this.editorCurrentObject.style.width = '40px';
            this.editorCurrentObject.style.height = '40px';
            this.editorInst.placeBorders();
        } else {
            this.editorBlock.style.display = 'none';
        }
    }
}

export { EditorUI };

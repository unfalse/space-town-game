import { Editor } from './editor';

class EditorUI {
    editorInst: Editor;
    editorBlock: HTMLDivElement;
    editorCurrentObject: HTMLDivElement;

    constructor(editorInst: Editor) {
        this.editorInst = editorInst;
    }

    init(): void {
        this.editorBlock = document.querySelector('#editorBlock');
        this.editorCurrentObject = document.querySelector(
            '#editorCurrentObject',
        );
        const editorNewBtn = document.querySelector('#editorNewBtn');
        const editorPlayBtn = document.querySelector('#editorPlayBtn');
        const editorSaveBtn = document.querySelector('#editorSaveBtn');
        const editorSaveAsBtn = document.querySelector('#editorSaveAsBtn');
        const editorLoadBtn = document.querySelector('#editorLoadBtn');
        const editorFileListContainer = document.querySelector(
            '#editorFileList',
        );

        editorNewBtn.addEventListener(
            'click',
            this.editorInst.newEditorLevel.bind(this.editorInst),
        );

        editorPlayBtn.addEventListener(
            'click',
            this.editorInst.playEditorLevel.bind(this.editorInst),
        );

        editorSaveBtn.addEventListener(
            'click',
            this.editorInst.saveEditorLevel.bind(this.editorInst),
        );

        editorSaveAsBtn.addEventListener(
            'click',
            this.editorInst.saveAsEditorLevel.bind(this.editorInst),
        );

        editorLoadBtn.addEventListener(
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

    toggleEditorHint(): void {
        const editorHint: HTMLDivElement | null = document.querySelector('.editor-hint');
        if (editorHint) {
            editorHint.style.display = editorHint.style.display === 'none' ? 'block' : 'none';
        }
    }

    toggleVideoHint(): void {
        const videoHint: HTMLDivElement | null = document.querySelector('.waypoints-hint');
        if (videoHint) {
            videoHint.style.display = videoHint.style.display === 'none' ? 'block' : 'none';
        }
    }
}

export { EditorUI };

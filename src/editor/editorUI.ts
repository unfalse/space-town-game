import { Editor } from './editor';

const queryOrThrow = (id: string) => {
    const element = document.querySelector(id);
    if (element === null) throw new Error('Element not found on page');
    return element;
}

class EditorUI {
    editorInst: Editor;
    editorBlock!: HTMLDivElement;
    editorCurrentObject!: HTMLDivElement;

    constructor(editorInst: Editor) {
        this.editorInst = editorInst;
        
    }

    init(): void {
        this.editorBlock = queryOrThrow('#editorBlock') as HTMLDivElement;
        this.editorCurrentObject = queryOrThrow(
            '#editorCurrentObject',
        ) as HTMLDivElement;
        const editorNewBtn = queryOrThrow('#editorNewBtn');
        const editorPlayBtn = queryOrThrow('#editorPlayBtn');
        const editorSaveBtn = queryOrThrow('#editorSaveBtn');
        const editorSaveAsBtn = queryOrThrow('#editorSaveAsBtn');
        const editorLoadBtn = queryOrThrow('#editorLoadBtn');
        const editorFileListContainer = queryOrThrow(
            '#editorFileList',
        ) as HTMLDivElement;

        editorNewBtn.addEventListener(
            'click',
            this.editorInst.newEditorLevel.bind(this.editorInst),
        );

        editorPlayBtn.addEventListener(
            'click', () => {
                this.editorInst.playEditorLevel();
                this.toggleEditorControls();
            }
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
        const editorHint: HTMLDivElement | null =
            document.querySelector('.editor-hint');
        if (editorHint) {
            const hintStyleDisplay = editorHint.style.display;
            editorHint.style.display =
                hintStyleDisplay === 'none' || hintStyleDisplay === ''
                    ? 'block'
                    : 'none';
        }
    }

    toggleVideoHint(): void {
        const videoHint: HTMLDivElement | null = document.querySelector('.waypoints-hint');
        if (videoHint) {
            // Load video source on first hint open to save bandwidth and speed up initial load time
            const source = document.querySelector('.waypoints-hint video source') as HTMLSourceElement;
            if (source.src === '') {
                source.src = source.dataset.src || '';
                const videoElement: HTMLVideoElement | null = document.querySelector('.waypoints-hint video');
                if (videoElement) {                    
                    videoElement.load();
                }   
            }
            videoHint.style.display = videoHint.style.display === 'none' ? 'block' : 'none';
        }
    }
}

export { EditorUI };

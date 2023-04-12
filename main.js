import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import './main.css';
import Alpine from 'alpinejs'

Alpine.data('main', () => ({
    dirHandler: null,
    listFile: [],

    orSearch: "",
    andSearch: "",
    listFileFiltered: [],

    async openDir() {
        try {
            this.dirHandler = await window.showDirectoryPicker({ mode: 'read' })
            if (this.dirHandler) {
                this.listFile = []
                for await (const entry of this.dirHandler.values()) {
                    if (entry.kind == 'file') {
                        this.listFile.push(entry.name);
                    }
                }
                this.listFileFiltered = [...this.listFile]
                // console.log(this.listFile)
            }
        } catch (error) {
            console.log("Cancel open dir ...")
        }
    },

    async closeDir() {
        this.dirHandler = null
        this.listFile = []
    },

    async filterListFile() {
        const cos = this.orSearch.split("\n").map(item => item.trim())
        const cas = this.andSearch.trim()
        this.listFileFiltered = this.listFile
            .filter(item => cos.map(text => item.includes(text)).filter(include => include).length > 0 && item.includes(cas))
    },

    async downloadZip() {
        const zipWriter = new ZipWriter(new BlobWriter("application/zip"), { bufferedWrite: true });

        if (this.dirHandler) {
            for await (const entry of this.dirHandler.values()) {
                if (entry.kind === 'file' && this.listFileFiltered.includes(entry.name)) {
                    zipWriter.add(entry.name, new BlobReader(await entry.getFile()));
                }
            }
        }
        
        // const helloWorldReader = new TextReader("Hello world!");
        // await zipWriter.add("hello.txt", helloWorldReader);

        const blobURL = URL.createObjectURL(await zipWriter.close());

        const anchor = document.createElement("a");
        const clickEvent = new MouseEvent("click");
        anchor.href = blobURL;
        anchor.download = 'foclip.zip';
        anchor.dispatchEvent(clickEvent);
    },
}))

Alpine.start()
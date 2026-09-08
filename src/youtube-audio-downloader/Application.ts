import ArgumentManager from "./ArgumentManager.ts";
import AudioFileSorter from "./AudioFileSorter.ts";
import TextFileHandler from "./TextFileHandler.ts";
import YtdlpManager from "./YtdlpManager.ts";
import Server from "./web/Server.ts";
import logger from "./logger.ts";

export default class Application {
    private readonly argumentManager: ArgumentManager = new ArgumentManager();
    private readonly ytdlpManager: YtdlpManager = new YtdlpManager();
    private readonly webui: Server = new Server();

    private async launchingWebUserInterface(): Promise<void> {
        logger.info("Запуск веб-интерфейса пользователя...");
        await this.webui.start();

        process.on("SIGINT", async (): Promise<void> => {
            await this.webui.stop();
            process.exit(0);
        });
    }

    private startUploadingThroughFile(): void {
        logger.debug("Активирована функция загрузки аудио через текстовый файл.");
        const urls: string[] = TextFileHandler.getArrayUrl(this.argumentManager.pathTextFileOption);
        for (const url of urls) {
            this.ytdlpManager.downloadAudioMp3ViaUrl(url, this.argumentManager.outputAudioFilesOption, this.argumentManager.playlistOption, this.argumentManager.cookiesOption, this.argumentManager.browserCookiesOption);
        }
    }

    public run(): void {
        if (this.argumentManager.webOption) this.launchingWebUserInterface();
        if (this.argumentManager.urlOption) this.ytdlpManager.downloadAudioMp3ViaUrl(this.argumentManager.urlOption, this.argumentManager.outputAudioFilesOption, this.argumentManager.playlistOption, this.argumentManager.cookiesOption, this.argumentManager.browserCookiesOption);
        if (this.argumentManager.pathTextFileOption) this.startUploadingThroughFile();
        if (this.argumentManager.sortPathAudioFiles && this.argumentManager.sortOutputAudioFiles) AudioFileSorter.sort(this.argumentManager.sortPathAudioFiles, this.argumentManager.sortOutputAudioFiles);
    }
}
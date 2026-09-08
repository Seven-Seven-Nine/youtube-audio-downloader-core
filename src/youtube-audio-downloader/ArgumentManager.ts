import { program, type OptionValues } from "commander";
import logger from "./logger.ts";

export default class ArgumentManager {
    private options: OptionValues = this.initializingArgs();

    constructor() {
        this.processingDebugModeOption();
    }

    private initializingArgs(): OptionValues {
        program
            .version("1.0.0")
            .option("--debug", "Включить режим отладки.")
            .option("--playlist", "Включить скачивание плейлиста.")
            .option("--web", "Включить режим WebUI.")
            .option("--url <string>", "Ссылка на видео для скачивания аудио.")
            .option("--path-text-file <string>", "Путь к текстовому файлу со ссылками.")
            .option("--output-audio-files <string>", "Путь для загрузки аудио-файлов.")
            .option("--browser-cookies <string>", "Название браузера, из которого будут импортированы cookies.")
            .option("--cookies <string>", "Путь к импортированному файлу cookies.")
            .option("--sort-path-audio-files <string>", "Путь к аудио файлам для сортировки.")
            .option("--sort-output-audio-files <string>", "Путь к месту для сортировки аудио файлов.")
            .option("--sort-type <string>", "Тип сортировки аудио-файлов, например \"author\", \"keywords <ключевое_слово>\".", "author")
            .parse(process.argv)
        
        return program.opts()
    }

    private processingDebugModeOption(): void {
        if (this.options.debug) {
            logger.level = "debug";
            logger.debug(`Полученное значение опции "--playlist": ${this.options.playlist}.`);
            logger.debug(`Полученное значение опции "--web": ${this.options.web}.`);
            logger.debug(`Полученное значение опции "--url": ${this.options.url}.`);
            logger.debug(`Полученное значение опции "--path-text-file": ${this.options.pathTextFile}.`);
            logger.debug(`Полученное значение опции "--output-audio-files": ${this.options.outputAudioFiles}.`);
            logger.debug(`Полученное значение опции "--browser-cookies": ${this.options.browserCookies}.`);
            logger.debug(`Полученное значение опции "--cookies": ${this.options.cookies}.`);
            logger.debug(`Полученное значение опции "--sort-path-audio-files": ${this.options.sortPathAudioFiles}.`);
            logger.debug(`Полученное значение опции "--sort-output-audio-files": ${this.options.sortOutputAudioFiles}.`);
            logger.debug(`Полученное значение опции "--sort-type": ${this.options.sortType}.`);
        }
    }

    public get playlistOption(): boolean {
        return this.options.playlist;
    }
    
    public get webOption(): boolean {
        return this.options.web;
    }

    public get urlOption(): string {
        return this.options.url;
    }

    public get pathTextFileOption(): string {
        return this.options.pathTextFile;
    }

    public get outputAudioFilesOption(): string {
        return this.options.outputAudioFiles;
    }

    public get browserCookiesOption(): string {
        return this.options.browserCookies;
    }

    public get cookiesOption(): string {
        return this.options.cookies;
    }

    public get sortPathAudioFiles(): string {
        return this.options.sortPathAudioFiles;
    }

    public get sortOutputAudioFiles(): string {
        return this.options.sortOutputAudioFiles;
    }

    public get sortType(): string {
        return this.options.sortType;
    }
}
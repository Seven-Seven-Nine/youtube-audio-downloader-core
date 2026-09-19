import path from "node:path";
import fs from "node:fs";
import { YtDlp, type ArgsOptions, type DownloadFinishResult } from "ytdlp-nodejs";
import logger from "./logger.ts";

export default class YtdlpManager {
    private readonly ytdlp: YtDlp;
    private readonly ytdlpBinaryPath: string;
    private readonly ffmpegBinaryPath: string;

    constructor() {
        const isWindows: boolean = process.platform === "win32";
        const binaryFilenameYtdlp: string = isWindows ? "yt-dlp.exe" : "yt-dlp_linux";
        const binaryFilenameFfmpeg: string = isWindows ? "ffmpeg-windows/ffmpeg.exe" : "ffmpeg-linux/ffmpeg";

        this.ytdlpBinaryPath = path.resolve(import.meta.dirname ?? __dirname, "..", "bin", binaryFilenameYtdlp);
        this.ffmpegBinaryPath = path.resolve(import.meta.dirname ?? __dirname, "..", "bin", binaryFilenameFfmpeg);

        logger.debug(`Сформированный путь до бинарного файла yt-dlp: "${this.ytdlpBinaryPath}".`);
        logger.debug(`Сформированный путь до бинарного файла ffmpeg: "${this.ffmpegBinaryPath}".`);

        if (!fs.existsSync(this.ytdlpBinaryPath)) {
            logger.error(`Бинарный файл yt-dlp не найден по пути: "${this.ytdlpBinaryPath}".`);
        }

        this.ytdlp = new YtDlp({
            binaryPath: this.ytdlpBinaryPath,
            ffmpegPath: this.ffmpegBinaryPath
        });
    }

    private getOptionsForDownloadingMp3(): ArgsOptions {
        const options: ArgsOptions = {
            extractAudio: true,
            audioFormat: "mp3",
            audioQuality: "0",

            embedMetadata: true,
            embedThumbnail: true,

            ignoreErrors: true,
        };

        return options;
    }

    private normalizePlaylistUrl(originalUrl: string): string {
        try {
            logger.debug(`Преобразование "${originalUrl}" в ссылку для загрузки плейлиста.`);
            const url: URL = new URL(originalUrl);
            const playlistId: string | null = url.searchParams.get("list");
            if (playlistId) {
                logger.debug(`Найден ID плейлиста: "${playlistId}".`);
                return `https://www.youtube.com/playlist?list=${playlistId}`;
            }
        } catch (error) {
            logger.warn("Передан некорректный URL для загрузки плейлиста.");
            return originalUrl;
        }
        logger.warn("Параметр list не найден в переданном URL, загрузка плейлиста не возможна.");
        return originalUrl;
    }

    public async downloadAudioMp3ViaUrl(url: string, output: string | undefined = undefined, playlist: boolean | undefined = undefined, cookies: string | undefined = undefined, browserCookies: string | undefined = undefined): Promise<void> {
        let downloadUrl: string = url;
        try {
            const options: ArgsOptions = this.getOptionsForDownloadingMp3();
            
            if (playlist === true) {
                options.yesPlaylist = true;
                downloadUrl = this.normalizePlaylistUrl(downloadUrl);
            } else if (playlist === false || playlist === undefined) {
                options.noPlaylist = true;
            }

            if (output !== undefined) options.output = path.join(output, "%(title)s.%(ext)s");
            if (cookies !== undefined) options.cookies = cookies;
            if (browserCookies !== undefined) options.cookiesFromBrowser = browserCookies;

            if (playlist === true) {
                logger.info(`Загрузка плейлиста по ссылке "${downloadUrl}".`);
            } else {
                logger.info(`Загрузка аудио по ссылке "${downloadUrl}".`);
            }

            const result: DownloadFinishResult = await this.ytdlp.download(downloadUrl, options);
            logger.info(`Загрузка аудио по ссылке "${downloadUrl}" успешно завершена! Файл сохранён: ${result.filePaths}`);
        } catch (error: any) {
            if (error?.message?.includes("exited with code 1") && playlist) {
                logger.warn("Плейлист загружен частично. Некоторые видео были недоступны и пропущены.");
                return;
            }

            logger.error(`Ошибка при загрузке аудио по ссылке "${downloadUrl}": ${error}`);
        }
    }
}
import { parseFile, type IAudioMetadata } from "music-metadata";
import path from "node:path";
import * as fs from "fs/promises";
import type { Dirent } from "node:fs";
import logger from "./logger.ts";

export default class AudioFileSorter {
    private static sanitizeFolderName(name: string): string {
        return name.replace(/[\\/:*?"<>|]/g, '').trim();
    }

    public static async sort(pathToAudioFiles: string, outputAudioFiles: string): Promise<void> {
        logger.debug(`Начата сортировка аудио-файлов из "${pathToAudioFiles}" в "${outputAudioFiles}".`);
        try {
            await fs.mkdir(outputAudioFiles, { recursive: true });
            
            const entries: Dirent<string>[] = await fs.readdir(pathToAudioFiles, { withFileTypes: true });
            
            const mp3Files: string[] = entries
                .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
                .map(entry => entry.name);

            if (mp3Files.length === 0) {
                logger.warn(`MP3-файлы по пути "${pathToAudioFiles}" не найдены!`);
                return;
            }

            for (const fileName of mp3Files) {
                const sourceFilePath: string = path.join(pathToAudioFiles, fileName);
                try {
                    const metadata: IAudioMetadata = await parseFile(sourceFilePath);

                    const rawArtist: string = metadata.common.artist || metadata.common.albumartist || "Unknown Artist";
                    const artistFolder: string = this.sanitizeFolderName(rawArtist) || "Unknown Artist";

                    const targetArtistDir: string = path.join(outputAudioFiles, artistFolder);
                    await fs.mkdir(targetArtistDir, { recursive: true });

                    const targetFilePath: string = path.join(targetArtistDir, fileName);
                    await fs.rename(sourceFilePath, targetFilePath);

                    logger.info(`Перемещение аудио-файла: "${sourceFilePath}" -> "${targetFilePath}".`);
                } catch (fileError) {
                    logger.error(`Не удалось обработать аудио-файл "${fileName}" для сортировки.`);
                }
            }
        } catch (error) {
            logger.error(`Ошибка в процессе сортировки аудио-файлов: ${error}`);
        }
        logger.debug(`Сортировка аудио-файлов из "${pathToAudioFiles}" в "${outputAudioFiles}" завершена.`);
    }
}
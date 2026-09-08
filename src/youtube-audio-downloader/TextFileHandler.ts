import { readFileSync } from "node:fs";

export default class TextFileHandler {
    public static getArrayUrl(pathToFile: string): string[] {
        let content: string = readFileSync(pathToFile, "utf-8");
        return content.split(/\r?\n/).filter(line => line.trim() !== '');
    }
}
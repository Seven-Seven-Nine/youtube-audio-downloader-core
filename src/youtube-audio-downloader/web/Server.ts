import express, { type Express, type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import { Server as HttpServer } from "http";
import logger from "../logger.ts";
import { fileURLToPath } from "node:url";

export default class Server {
    private readonly app: Express = express();
    private readonly port: number;
    private pathToStaticFolder: string;
    private serverInstance: HttpServer | null = null;

    constructor(port: number = 3000) {
        this.port = port;

        const filename: string = fileURLToPath(import.meta.url);
        const dirname: string = path.dirname(filename);

        this.pathToStaticFolder = path.resolve(dirname, "public");

        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandler();
    }

    private setupMiddleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        const publicPath: string = path.join(this.pathToStaticFolder, "pubic");
        this.app.use(express.static(publicPath));
    }

    private setupRoutes(): void {
        this.app.get("/", (req: Request, res: Response): void => {
            res.sendFile(path.join(this.pathToStaticFolder, "index.html"));
        });
    }

    private setupErrorHandler(): void {
        this.app.use((req: Request, res: Response): void => {
            res.status(404).sendFile(path.join(this.pathToStaticFolder, "404.html"));
        });

        this.app.use((err: Error, req: Request, res: Response): void => {
            logger.error(`Ошибка локального веб-сервера: ${err.stack}`);
            res.status(500).json({ error: "Внутренняя ошибка локального сервера." });
        });
    }

    public start(): Promise<void> {
        return new Promise((resolve) => {
            this.serverInstance = this.app.listen(this.port, "127.0.0.1", (): void => {
                logger.info(`Локальный веб-сервер запущен: "http://127.0.0.1:${this.port}".`);
                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.serverInstance) return resolve();

            this.serverInstance.close((err) => {
                if (err) return reject(err);
                logger.info("Локальный веб-сервер остановлен.");
                resolve();
            });
        });
    }
}
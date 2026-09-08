import winston from "winston";

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }): string => {
        return `[${timestamp}] ${level}: ${message}`;
    })
);

const logger = winston.createLogger({
    level: "info",
    transports: [
        new winston.transports.Console({
            format: consoleFormat
        })
    ]
});

export default logger;
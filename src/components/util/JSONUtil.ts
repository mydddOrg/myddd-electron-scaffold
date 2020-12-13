import { Logger } from "components/logger/Logger";

export class JSONUtil {

    public static parse(value: string): any {
        try {
            return JSON.parse(value);
        } catch (error) {
            Logger.warn('JSON PARSE ERROR', value);
        }
        return null;
    }
}
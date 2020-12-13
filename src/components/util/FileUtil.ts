import { ModuleUtil } from "./ModuleUtil";
import { Logger } from "components/logger/Logger";
export class FileUtil {

    public static downloadsDir(): string {
        const { app } = ModuleUtil.remote;
        const home = app.getPath('downloads');
        return home;
    }

    /**
     * 获取一个文件在【下载】目录中的位置
     * @param name 
     */
    public static fileInDownloadsDir(name: string): string {
        const { app } = ModuleUtil.remote;
        const home = app.getPath('downloads');
        const path = ModuleUtil.path;
        return path.join(home, name);
    }

    /**根据文件路径和文件名获得下载位置 */
    public static fileInDownLoadsDirByPath(pathName:string,name:string):string {
        const path = ModuleUtil.path;
        return path.join(pathName, name);
    }

    /**s
     * 复制文件
     * @param path 
     * @param destPath 
     */
    public static copyFile(path: string, destPath: string): Promise<boolean> {
        const fs = ModuleUtil.fs;
        return new Promise((resolve) => {
            fs.copyFile(path, destPath, (err: any) => {
                if (err) {
                    Logger.error('COPY ERR', err);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    public static rmDir(path: string): Promise<boolean> {
        const rimraf = window.require("rimraf");
        return new Promise((resolve) => {
            rimraf(path, function () { Logger.log("done"); });
        });
    }

    /**
     * 获取文件的大小
     * @param path 
     */
    public static fileSize(path: string): number {
        const fs = ModuleUtil.fs;
        const stats = fs.statSync(path)
        const fileSizeInBytes = stats["size"]
        return fileSizeInBytes;
    }

    public static sizeInString(size: number) {
        let calString = 'KB';
        let calSize = size / 1024;
        if (calSize > 1024) {
            calString = 'MB';
            calSize = calSize / 1024;
        }
        return calSize.toFixed(1) + calString;
    }

    /**
     * 检测路径是否是文件
     * @param path 
     */
    public static isFile(path: string): boolean {
        const fs = ModuleUtil.fs;
        const stats = fs.statSync(path)
        return stats.isFile();
    }


    public static async contentOfImageFile(path: string): Promise<string> {
        const fs = ModuleUtil.fs;

        return new Promise((resolve) => {
            fs.readFile(path, function read(err: any, data: Buffer) {
                if (err) {
                    resolve(null);
                }
                resolve(data.toString('base64'));
            });

        });
    }

    public static async contentOfFile(path: string): Promise<Buffer> {
        const fs = ModuleUtil.fs;

        return new Promise((resolve) => {
            fs.readFile(path, function read(err: any, data: Buffer) {
                if (err) {
                    resolve(null);
                }
                resolve(data);
            });

        });
    }

    public static async accessFile(path: string): Promise<boolean> {
        if (!path) return false;
        const fs = ModuleUtil.fs;
        return new Promise((reslove, reject) => {
            fs.access(path, fs.constants.R_OK, (err: any) => {
                if (err) {
                    reslove(false);
                    return;
                }
                reslove(true);
                return;
            });
        });
    }

    public static async writeFileWithString(mediaPath: string, content: string): Promise<boolean> {
        const fs = ModuleUtil.fs;
        return new Promise((reslove, reject) => {
            fs.writeFile(mediaPath, new Buffer(content), (err: any) => {
                if (err) {
                    Logger.error("File write error:", err);
                    reslove(false);
                    return;
                }
                reslove(true);
                return;
            });
        });
    }

    public static async writeFile(mediaPath: string, data: ArrayBuffer): Promise<boolean> {
        const fs = ModuleUtil.fs;
        return new Promise((reslove, reject) => {
            fs.writeFile(mediaPath, new Buffer(data), (err: any) => {
                if (err) {
                    Logger.error("File write error:", err);
                    reslove(false);
                    return;
                }
                reslove(true);
                return;
            });
        });
    }

}
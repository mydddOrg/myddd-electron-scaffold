import { AuthStore } from "stores/AuthStore";
import { DirType } from "./DirType";
import { FileUtil } from "./FileUtil";
import { ModuleUtil } from "./ModuleUtil";
import { Logger } from "components/logger/Logger";

export class FSDirUtil {


    private static appDataDir = (ModuleUtil.electron.app || ModuleUtil.electron.remote.app).getPath('userData');

    private static DOCUMENT_DIR: string = "documents";
    

    /**
     * 头像目录
     */
    public static avatarDir(): string {
        return this.dirForType(DirType.Avatar);
    }

    /**
     * 图片DIR
     */
    public static imageDir(): string {
        return this.dirForType(DirType.Image);
    }

    /**
     * 视频DIR
     */
    public static videoDir(): string {
        return this.dirForType(DirType.Video);
    }

    /**
     * 文件DIR
     */
    public static fileDir(): string {
        return this.dirForType(DirType.File);
    }


    private static dirForType(type: string): string {
        const path = ModuleUtil.path;
        return path.join(FSDirUtil.userDataDir(), type);
    }


    public static async createUserDataDir(): Promise<boolean> {
        const userId = AuthStore.getInstance().userId;
        const path = await FSDirUtil.mkdirDirInUserData(userId);
        return path != '';
    }

    public static userDataDir(): string {
        const path = ModuleUtil.path;
        const userId = AuthStore.getInstance().userId;
        return path.join(FSDirUtil.documentPath(), userId);
    }

    public static async createDirs(): Promise<boolean> {
        await FSDirUtil.mkdirDirInUserData(DirType.Avatar);
        await FSDirUtil.mkdirDirInUserData(DirType.Image);
        await FSDirUtil.mkdirDirInUserData(DirType.Video);
        await FSDirUtil.mkdirDirInUserData(DirType.File);
        await FSDirUtil.mkdirDirInUserData(DirType.Voice);
        await FSDirUtil.mkdirDirInUserData(DirType.Url);
        await FSDirUtil.mkdirDirInUserData(DirType.Multipart);
        await FSDirUtil.mkdirDirInUserData(DirType.Sticker);
        await FSDirUtil.mkdirDirInUserData(DirType.Logger);
        return true;
    }


    /**
     * 生成指定目录
     */
    private static async mkdirDirInUserData(name: string): Promise<string> {
        const path = ModuleUtil.path;
        const fs = ModuleUtil.fs;
        return new Promise((resolove) => {
            const userDataPath: string = path.join(FSDirUtil.userDataDir(), name);
            fs.access(userDataPath, (err: any) => {
                if (err) {
                    fs.mkdir(userDataPath, { recursive: true }, function (error: any) {
                        if (error) {
                            Logger.error('mkdirDirInUserData',error);
                            resolove('');
                        } else {
                            resolove(userDataPath);
                        }
                    });
                } else {
                    resolove(userDataPath);
                }
            });
        });
    }

    /**
     * 项目文档根目录
     */
    public static documentPath(): string {
        const path = ModuleUtil.path;
        const documentPath = path.join(FSDirUtil.appDataDir, FSDirUtil.DOCUMENT_DIR);
        return documentPath;
    }

    /**
     * 日志目录
     */
    public static loggerPath(): string {
        return this.dirForType(DirType.Logger);
    }
    
    public static stickerPath(themeName: string,stickerName:string): string  {
        if(!themeName || !stickerName)return '';
        const path = ModuleUtil.path;
        const typePath = this.dirForType(DirType.Sticker);
        const mediaPath = path.join(typePath, themeName + "_" +stickerName);
        return mediaPath;
    }

    public static mediaPath(mediaId: string,type:string): string  {
        if(!mediaId)return '';
        const path = ModuleUtil.path;
        const typePath = this.dirForType(type);
        const mediaPath = path.join(typePath, mediaId);
        return mediaPath;
    }

    public static async mediaExists(mediaId: string,type:string): Promise<boolean> {
        const mediaPath = this.mediaPath(mediaId,type);
        let exists = await FileUtil.accessFile(mediaPath);
        return exists;
    }

    public static async writeAvataFile(mediaId: string, type:string,data: ArrayBuffer): Promise<boolean> {
        const mediaPath = this.mediaPath(mediaId,type);
        return FileUtil.writeFile(mediaPath,data);
    }

}
export class ModuleUtil {

    public static fs = window.require("fs");

    public static remote = window.require('@electron/remote');

    public static path = window.require('path'); 

    public static ipcRenderer = window.require('electron').ipcRenderer;

    public static electron = window.require('electron');

    public static zipFolder = window.require('zip-a-folder');

}
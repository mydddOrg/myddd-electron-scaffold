import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthEvent } from 'components/event/AuthEvent';
import { Inject } from 'typescript-ioc';
import { IDefaultHeaderPlugin } from '../IDefaultHeaderPlugin';
import { BaseResponse, IRequest, IResponse } from '../IRequest';
import { Logger } from 'components/logger/Logger';


export class BaseRequest implements IRequest {

    private LICENSE_NOT_FOUND = 203021;
    private LICENSE_INVALID = 203022;
    private DEVICE_FORBIDDEN = 201600;
    private DEVICE_BUNDLING = 201610;
    private MAINTENANCE_MODE = 201041;
    private MAINTENANCE_MODE2 = 201042;
    private DEVICE_NOT_AUTH = 201063;
    private TOKEN_EXPIRED = 10011;

    private static DEFAULT_TIMEOUT = 30 * 1000;

    @Inject
    private headerPlugin: IDefaultHeaderPlugin;


    private REQUEST_ERROR: number[] = [this.TOKEN_EXPIRED, this.LICENSE_NOT_FOUND, this.LICENSE_INVALID, this.DEVICE_FORBIDDEN, this.DEVICE_BUNDLING, this.MAINTENANCE_MODE, this.MAINTENANCE_MODE2, this.DEVICE_NOT_AUTH];

    /* 创建axios实例 */
    private request: AxiosInstance = axios.create({
        responseType: 'json',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'content-type': 'application/json',
        },
    });


    /**
    * GET请求,获取一个流
    * @param url 
    */
    async requestBlobForGet<T>(url: string, progressBlock?: (progress: number) => void): Promise<ArrayBuffer> {
        return new Promise((resolove) => {

            const headers = this.getDefaultHeaders();
            headers["Accept"] = '*/*';

            const res = this.request.get(url, {
                responseType: 'arraybuffer',
                headers: headers,
                onDownloadProgress: function (progressEvent: ProgressEvent) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (progressBlock) {
                        progressBlock(percentCompleted);
                    }
                }
            });


            res.then((value: AxiosResponse) => {
                const contentType: string = value.headers['content-type'];
                if (contentType == 'application/json') {
                    resolove(null);
                    return;
                }
                resolove(value.data);
            }).catch((err: any) => {
                resolove(null);
            });
        });
    }

    private getDefaultHeaders() {
        const headers: any = {};
        this.headerPlugin.defaultHeaders().forEach((value: string, key: string) => {
            headers[key] = value;
        })
        return headers;
    }

    /**
     * GET请求
     * @param url 
     */
    async requestForGet<T>(url: string): Promise<BaseResponse> {


        return new Promise((resolove) => {
            const res = this.request.get(url, {
                timeout: BaseRequest.DEFAULT_TIMEOUT,
                headers: this.getDefaultHeaders()
            });
            res.then((value: AxiosResponse) => {
                resolove(this.status200Response(value));
            }).catch((err: any) => {
                resolove(this.errorResponse(err));
            });
        });
    }

    /**
     * POST 请求
     * @param url POST URL
     * @param data 
     */
    async requestForPost<T>(url: string, data: any): Promise<BaseResponse> {
        return new Promise((resolove) => {
            const res = this.request.post(url, data, {
                timeout: BaseRequest.DEFAULT_TIMEOUT,
                headers: this.getDefaultHeaders()
            });
            res.then((value: AxiosResponse) => {
                resolove(this.status200Response(value));
            }).catch((err: any) => {
                resolove(this.errorResponse(err));
            });
        });
    }

    async uploadFile<T>(url: string, file: File, progressBlock?: (progress: number) => void): Promise<BaseResponse> {
        const headers = this.getDefaultHeaders();
        headers["Content-Type"] = "multipart/form-data;boundary=" + new Date().getTime();
        return new Promise((resolove) => {
            const formData = new FormData();
            formData.append("file", file);
            const config = {
                headers: headers,
                onUploadProgress: function (progressEvent: ProgressEvent) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    if (progressBlock) {
                        progressBlock(percentCompleted);
                    }
                }
            };
            const res = this.request.post(url, formData, config);
            res.then((value: AxiosResponse) => {
                resolove(this.status200Response(value));
            }).catch((err: any) => {
                Logger.error('upload', err);
                resolove(this.errorResponse(err));
            });
        });
    }



    /**
    * PUT 请求
    * @param url 
    * @param data 
    */
    async requestForPut<T>(url: string, data: any): Promise<BaseResponse> {
        return new Promise((resolove) => {
            const res = this.request.put(url, data, { timeout: BaseRequest.DEFAULT_TIMEOUT, headers: this.getDefaultHeaders() });
            res.then((value: AxiosResponse) => {
                resolove(this.status200Response(value));
            }).catch((err: any) => {
                resolove(this.errorResponse(err)); ``
            });
        });
    }

    /**
    * DELETE 请求
    * @param url 
    */
    async requestForDelete<T>(url: string): Promise<BaseResponse> {
        return new Promise((resolove) => {
            const res = this.request.delete(url, { timeout: BaseRequest.DEFAULT_TIMEOUT, headers: this.getDefaultHeaders() });
            res.then((value: AxiosResponse) => {
                resolove(this.status200Response(value));
            }).catch((err: any) => {
                resolove(this.errorResponse(err));
            });
        });
    }

    private errorResponse<T>(err: any): BaseResponse {
        const response: IResponse = {
            status: -1,
            error: err
        };
        return new BaseResponse(response);
    }


    private status200Response<T>(value: AxiosResponse<any>): BaseResponse {
        const response: IResponse = {
            status: value.status,
            data: value.data,
            statusText: value.statusText
        };
        return new BaseResponse(response);
    }



}




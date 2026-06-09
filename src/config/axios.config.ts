import { AxiosRequestConfig, RawAxiosRequestHeaders } from "axios";

export type HttpMethods = "get" | "post" | "put" | "delete"

export function axiosConfig<T = unknown>(url: string, method: HttpMethods, headers?: RawAxiosRequestHeaders, data?: T): AxiosRequestConfig<T> {
    const config: AxiosRequestConfig<T> = {
        url: `/api/${url}`,
        method,
        maxBodyLength: Infinity,
        headers: headers ?? ({}),
        data: data ?? ({} as T)
    }
    return config;
}


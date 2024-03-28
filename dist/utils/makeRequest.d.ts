export declare enum RequestMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}
export default function makeRequest(url: string, method: RequestMethod, body?: object | undefined): Promise<any>;

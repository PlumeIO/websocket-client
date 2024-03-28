"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMethod = void 0;
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["GET"] = "GET";
    RequestMethod["POST"] = "POST";
    RequestMethod["PUT"] = "PUT";
    RequestMethod["PATCH"] = "PATCH";
    RequestMethod["DELETE"] = "DELETE";
})(RequestMethod || (exports.RequestMethod = RequestMethod = {}));
function makeRequest(url_1, method_1) {
    return __awaiter(this, arguments, void 0, function* (url, method, body = undefined) {
        const response = yield fetch(url, {
            headers: {
                "Content-type": "application/json",
            },
            method,
            body: JSON.stringify(body),
        });
        const data = yield response.json();
        return data;
    });
}
exports.default = makeRequest;

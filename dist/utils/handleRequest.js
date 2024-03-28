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
const makeRequest_1 = require("./makeRequest");
function handleRequest(url_1, method_1, body_1, failCases_1, onSuccess_1) {
    return __awaiter(this, arguments, void 0, function* (url, method, body, failCases, onSuccess, onFail = undefined) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            failCases.forEach((failCase) => {
                if (failCase[0]) {
                    return reject(failCase[1]);
                }
            });
            const response = yield (0, makeRequest_1.default)(url, method, body);
            if (response.success) {
                onSuccess(response);
                resolve(response.data);
            }
            else {
                if (onFail)
                    onFail(response);
                reject(response.message);
            }
        }));
    });
}
exports.default = handleRequest;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(name, id = undefined) {
        this.name = name;
        this.id = id;
    }
    static findBy(key, value, list) {
        // @ts-ignore
        return list.find((user) => user[key] === value);
    }
}
exports.User = User;

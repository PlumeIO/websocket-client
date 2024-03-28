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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Room_client, _Room_id, _Room_name, _Room_users, _Room_admin, _Room_state, _Room_dataMiddleware, _Room_data, _Room_promiseResolvers, _Room_resolve, _Room_handleSync, _Room_onDataUpdate, _Room_onStateUpdate, _Room_onAdminUpdate, _Room_onUsersUpdate, _Room_onCustom;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = exports.RoomState = void 0;
const _1 = require(".");
var RoomState;
(function (RoomState) {
    RoomState["OPEN"] = "OPEN";
    RoomState["CLOSE"] = "CLOSE";
})(RoomState || (exports.RoomState = RoomState = {}));
class Room {
    constructor(client, config, dataMiddleware = undefined) {
        _Room_client.set(this, void 0);
        _Room_id.set(this, void 0);
        _Room_name.set(this, void 0);
        _Room_users.set(this, void 0);
        _Room_admin.set(this, void 0);
        _Room_state.set(this, void 0);
        _Room_dataMiddleware.set(this, void 0);
        _Room_data.set(this, void 0);
        _Room_promiseResolvers.set(this, {
            users: undefined,
            admin: undefined,
            state: undefined,
            data: undefined,
            custom: undefined,
        });
        this.open = () => {
            console.log("room opens", __classPrivateFieldGet(this, _Room_id, "f"));
            __classPrivateFieldGet(this, _Room_client, "f").socket.on(`${__classPrivateFieldGet(this, _Room_id, "f")}/data-update`, __classPrivateFieldGet(this, _Room_onDataUpdate, "f"));
            __classPrivateFieldGet(this, _Room_client, "f").socket.on(`${__classPrivateFieldGet(this, _Room_id, "f")}/state-update`, __classPrivateFieldGet(this, _Room_onStateUpdate, "f"));
            __classPrivateFieldGet(this, _Room_client, "f").socket.on(`${__classPrivateFieldGet(this, _Room_id, "f")}/admin-update`, __classPrivateFieldGet(this, _Room_onAdminUpdate, "f"));
            __classPrivateFieldGet(this, _Room_client, "f").socket.on(`${__classPrivateFieldGet(this, _Room_id, "f")}/users-update`, __classPrivateFieldGet(this, _Room_onUsersUpdate, "f"));
            __classPrivateFieldGet(this, _Room_client, "f").socket.on(`${__classPrivateFieldGet(this, _Room_id, "f")}/custom`, __classPrivateFieldGet(this, _Room_onCustom, "f"));
        };
        this.close = () => {
            console.log("room closes");
            __classPrivateFieldGet(this, _Room_client, "f").socket.off(`${__classPrivateFieldGet(this, _Room_id, "f")}/data-update`, __classPrivateFieldGet(this, _Room_onDataUpdate, "f"));
            __classPrivateFieldGet(this, _Room_client, "f").socket.off(`${__classPrivateFieldGet(this, _Room_id, "f")}/state-update`, __classPrivateFieldGet(this, _Room_onStateUpdate, "f"));
            __classPrivateFieldGet(this, _Room_client, "f").socket.off(`${__classPrivateFieldGet(this, _Room_id, "f")}/admin-update`, __classPrivateFieldGet(this, _Room_onAdminUpdate, "f"));
            __classPrivateFieldGet(this, _Room_client, "f").socket.off(`${__classPrivateFieldGet(this, _Room_id, "f")}/users-update`, __classPrivateFieldGet(this, _Room_onUsersUpdate, "f"));
            __classPrivateFieldGet(this, _Room_client, "f").socket.off(`${__classPrivateFieldGet(this, _Room_id, "f")}/custom`, __classPrivateFieldGet(this, _Room_onCustom, "f"));
        };
        _Room_resolve.set(this, (key) => {
            const resolver = __classPrivateFieldGet(this, _Room_promiseResolvers, "f")[key];
            // @ts-ignore
            if (resolver)
                resolver(this[key]);
            __classPrivateFieldGet(this, _Room_promiseResolvers, "f")[key] = undefined;
        });
        _Room_handleSync.set(this, (key, value, method) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (__classPrivateFieldGet(this, _Room_promiseResolvers, "f")[key] === undefined) {
                    __classPrivateFieldGet(this, _Room_promiseResolvers, "f")[key] = resolve;
                    method(value);
                }
                else
                    reject(`An unresolved ${key} promise exists`);
            });
        }));
        _Room_onDataUpdate.set(this, (data) => {
            __classPrivateFieldGet(this, _Room_resolve, "f").call(this, "data");
            if (__classPrivateFieldGet(this, _Room_dataMiddleware, "f"))
                __classPrivateFieldSet(this, _Room_data, __classPrivateFieldGet(this, _Room_dataMiddleware, "f").call(this, data), "f");
            else
                __classPrivateFieldSet(this, _Room_data, data, "f");
            this.onDataUpdate(data);
        });
        _Room_onStateUpdate.set(this, (state) => {
            __classPrivateFieldGet(this, _Room_resolve, "f").call(this, "state");
            __classPrivateFieldSet(this, _Room_state, state, "f");
            this.onStateUpdate(state);
        });
        _Room_onAdminUpdate.set(this, (admin) => {
            __classPrivateFieldGet(this, _Room_resolve, "f").call(this, "admin");
            __classPrivateFieldSet(this, _Room_admin, _1.User.findBy("id", admin.id, __classPrivateFieldGet(this, _Room_users, "f")), "f");
            this.onAdminUpdate(admin);
        });
        _Room_onUsersUpdate.set(this, (users) => {
            __classPrivateFieldGet(this, _Room_resolve, "f").call(this, "users");
            __classPrivateFieldSet(this, _Room_users, this.collectUsersFrom(users), "f");
            console.log("users-update", users);
            this.onUsersUpdate(users);
            if (this.client.user && __classPrivateFieldGet(this, _Room_users, "f").indexOf(this.client.user) === -1) {
                this.client.exitRoomClient();
                this.onKick();
            }
        });
        _Room_onCustom.set(this, (req) => {
            __classPrivateFieldGet(this, _Room_resolve, "f").call(this, "custom");
            this.onRequest(req);
            if (this.admin === this.client.user)
                this.handleRequestAsAdmin(req);
        });
        this.onDataUpdate = (_data) => { };
        this.onStateUpdate = (_state) => { };
        this.onAdminUpdate = (_admin) => { };
        this.onUsersUpdate = (_users) => { };
        this.onKick = () => { };
        this.onRequest = (_req) => { };
        this.handleRequestAsAdmin = (_req) => { };
        this.removeUser = (user) => {
            __classPrivateFieldGet(this, _Room_client, "f").socket.emit("remove-user", user.id);
        };
        this.removeUserSync = (user) => __awaiter(this, void 0, void 0, function* () {
            const response = yield __classPrivateFieldGet(this, _Room_handleSync, "f").call(this, "users", user, this.removeUser);
            return response;
        });
        this.updateData = (data) => {
            __classPrivateFieldGet(this, _Room_client, "f").socket.emit("data-update", data);
        };
        this.updateDataSync = (data) => __awaiter(this, void 0, void 0, function* () {
            const response = yield __classPrivateFieldGet(this, _Room_handleSync, "f").call(this, "data", data, this.updateData);
            return response;
        });
        this.updateState = (state) => {
            __classPrivateFieldGet(this, _Room_client, "f").socket.emit("state-update", state);
        };
        this.updateStateSync = (state) => __awaiter(this, void 0, void 0, function* () {
            const response = yield __classPrivateFieldGet(this, _Room_handleSync, "f").call(this, "state", state, this.updateState);
            return response;
        });
        this.updateAdmin = (admin) => {
            __classPrivateFieldGet(this, _Room_client, "f").socket.emit("admin-update", admin.id);
        };
        this.updateAdminSync = (admin) => __awaiter(this, void 0, void 0, function* () {
            const response = yield __classPrivateFieldGet(this, _Room_handleSync, "f").call(this, "admin", admin, this.updateAdmin);
            return response;
        });
        this.updateDataCustom = () => {
            __classPrivateFieldGet(this, _Room_client, "f").socket.emit("custom-data-update", this.data);
        };
        this.sendRequest = (req) => {
            __classPrivateFieldGet(this, _Room_client, "f").socket.emit("custom", req);
        };
        this.sendRequestSync = (req) => __awaiter(this, void 0, void 0, function* () {
            const response = yield __classPrivateFieldGet(this, _Room_handleSync, "f").call(this, "custom", req, this.sendRequest);
            return response;
        });
        __classPrivateFieldSet(this, _Room_client, client, "f");
        __classPrivateFieldSet(this, _Room_id, config.id, "f");
        __classPrivateFieldSet(this, _Room_name, config.name, "f");
        __classPrivateFieldSet(this, _Room_users, this.collectUsersFrom(config.users), "f");
        __classPrivateFieldSet(this, _Room_admin, __classPrivateFieldGet(this, _Room_users, "f").find((user) => user.id === config.admin.id), "f");
        __classPrivateFieldSet(this, _Room_state, config.state, "f");
        __classPrivateFieldSet(this, _Room_dataMiddleware, dataMiddleware, "f");
        const data = config.data === undefined ? this.client.initialData : config.data;
        if (dataMiddleware)
            __classPrivateFieldSet(this, _Room_data, dataMiddleware(data), "f");
        else
            __classPrivateFieldSet(this, _Room_data, data, "f");
    }
    collectUsersFrom(usersJson) {
        let users = [];
        usersJson.forEach((userJson) => {
            var _a;
            if (userJson.id === ((_a = __classPrivateFieldGet(this, _Room_client, "f").user) === null || _a === void 0 ? void 0 : _a.id))
                users.push(__classPrivateFieldGet(this, _Room_client, "f").user);
            else
                users.push(new _1.User(userJson.name, userJson.id));
        });
        return users;
    }
    get client() {
        return __classPrivateFieldGet(this, _Room_client, "f");
    }
    get id() {
        return __classPrivateFieldGet(this, _Room_id, "f");
    }
    get name() {
        return __classPrivateFieldGet(this, _Room_name, "f");
    }
    get users() {
        return __classPrivateFieldGet(this, _Room_users, "f");
    }
    get admin() {
        return __classPrivateFieldGet(this, _Room_admin, "f");
    }
    get state() {
        return __classPrivateFieldGet(this, _Room_state, "f");
    }
    get data() {
        return __classPrivateFieldGet(this, _Room_data, "f");
    }
}
exports.Room = Room;
_Room_client = new WeakMap(), _Room_id = new WeakMap(), _Room_name = new WeakMap(), _Room_users = new WeakMap(), _Room_admin = new WeakMap(), _Room_state = new WeakMap(), _Room_dataMiddleware = new WeakMap(), _Room_data = new WeakMap(), _Room_promiseResolvers = new WeakMap(), _Room_resolve = new WeakMap(), _Room_handleSync = new WeakMap(), _Room_onDataUpdate = new WeakMap(), _Room_onStateUpdate = new WeakMap(), _Room_onAdminUpdate = new WeakMap(), _Room_onUsersUpdate = new WeakMap(), _Room_onCustom = new WeakMap();

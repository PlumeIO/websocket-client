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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _SocketClient_state, _SocketClient_room, _SocketClient_promiseResolve, _SocketClient_onConnect, _SocketClient_onDisconnect, _SocketClient_onError, _SocketClient_connectRoom;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketClient = exports.ClientState = void 0;
const socket_io_client_1 = require("socket.io-client");
const _1 = require(".");
const makeRequest_1 = require("./utils/makeRequest");
const handleRequest_1 = require("./utils/handleRequest");
var ClientState;
(function (ClientState) {
    ClientState["DISCONNECTED"] = "DISCONNECTED";
    ClientState["CONNECTING"] = "CONNECTING";
    ClientState["CONNECTED"] = "CONNECTED";
    ClientState["DISCONNECTING"] = "DISCONNECTING";
})(ClientState || (exports.ClientState = ClientState = {}));
class SocketClient {
    constructor(name) {
        this.host = "plume-websocket.onrender.com";
        // host: string = "192.168.129.64:3000";
        this.secure = true;
        _SocketClient_state.set(this, ClientState.DISCONNECTED);
        _SocketClient_room.set(this, void 0);
        _SocketClient_promiseResolve.set(this, undefined);
        this.connect = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.user)
                    reject("Unable to connect. Client needs a user first");
                else if (__classPrivateFieldGet(this, _SocketClient_state, "f") === ClientState.DISCONNECTED) {
                    __classPrivateFieldSet(this, _SocketClient_state, ClientState.CONNECTING, "f");
                    __classPrivateFieldSet(this, _SocketClient_promiseResolve, resolve, "f");
                    this.socket.io.opts.query = { name: this.user.name };
                    this.socket.connect();
                }
                else
                    reject(`Unable to connect. Client is in state of ${__classPrivateFieldGet(this, _SocketClient_state, "f")}`);
            });
        });
        _SocketClient_onConnect.set(this, () => {
            var _a;
            if (__classPrivateFieldGet(this, _SocketClient_promiseResolve, "f"))
                __classPrivateFieldGet(this, _SocketClient_promiseResolve, "f").call(this, this.socket);
            __classPrivateFieldSet(this, _SocketClient_state, ClientState.CONNECTED, "f");
            if (this.user)
                this.user.id = (_a = this.socket) === null || _a === void 0 ? void 0 : _a.id;
            this.onConnect();
        });
        this.onConnect = () => { };
        this.disconnect = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (__classPrivateFieldGet(this, _SocketClient_state, "f") === ClientState.CONNECTED) {
                    __classPrivateFieldSet(this, _SocketClient_state, ClientState.DISCONNECTING, "f");
                    __classPrivateFieldSet(this, _SocketClient_promiseResolve, resolve, "f");
                    this.socket.disconnect();
                }
                else
                    reject(`Unable to disconnect. Client is in state of ${this.state}`);
            });
        });
        _SocketClient_onDisconnect.set(this, () => {
            if (__classPrivateFieldGet(this, _SocketClient_promiseResolve, "f"))
                __classPrivateFieldGet(this, _SocketClient_promiseResolve, "f").call(this, this.socket);
            __classPrivateFieldSet(this, _SocketClient_state, ClientState.DISCONNECTED, "f");
            if (this.user)
                this.user.id = undefined;
            this.onDisconnect();
        });
        this.onDisconnect = () => { };
        _SocketClient_onError.set(this, (err) => {
            if (__classPrivateFieldGet(this, _SocketClient_promiseResolve, "f"))
                __classPrivateFieldGet(this, _SocketClient_promiseResolve, "f").call(this, err);
            __classPrivateFieldSet(this, _SocketClient_state, ClientState.DISCONNECTED, "f");
            this.onError(err);
        });
        this.onError = (_err) => { };
        this.getRooms = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, makeRequest_1.default)(`${this.backendURL}/room`, makeRequest_1.RequestMethod.GET);
            return response.data;
        });
        _SocketClient_connectRoom.set(this, (roomKey_1, connectMethod_1, ...args_1) => __awaiter(this, [roomKey_1, connectMethod_1, ...args_1], void 0, function* (roomKey, connectMethod, dataMiddleware = undefined) {
            var _a;
            const response = yield (0, handleRequest_1.default)(`${this.backendURL}/room/${connectMethod}`, makeRequest_1.RequestMethod.POST, {
                roomName: connectMethod === "create" ? roomKey : undefined,
                roomId: connectMethod === "create"
                    ? `${this.name}-${roomKey}-${Date.now()}`
                    : roomKey,
                clientName: connectMethod === "create" ? this.name : undefined,
                userId: (_a = this.user) === null || _a === void 0 ? void 0 : _a.id,
            }, [
                [
                    this.user === undefined,
                    `Unable to ${connectMethod} room. Client needs a user first`,
                ],
                [
                    this.initialData === undefined,
                    `Unable to ${connectMethod} room. Client needs an initialData first`,
                ],
            ], (response) => __awaiter(this, void 0, void 0, function* () {
                if (__classPrivateFieldGet(this, _SocketClient_room, "f"))
                    yield this.exitRoom();
                __classPrivateFieldSet(this, _SocketClient_room, new _1.Room(this, response.data, dataMiddleware), "f");
                __classPrivateFieldGet(this, _SocketClient_room, "f").open();
            }));
            return response;
        }));
        this.createRoom = (roomName_1, ...args_2) => __awaiter(this, [roomName_1, ...args_2], void 0, function* (roomName, dataMiddleware = undefined) {
            const response = yield __classPrivateFieldGet(this, _SocketClient_connectRoom, "f").call(this, roomName, "create", dataMiddleware);
            return response;
        });
        this.joinRoom = (roomId_1, ...args_3) => __awaiter(this, [roomId_1, ...args_3], void 0, function* (roomId, dataMiddleware = undefined) {
            const response = yield __classPrivateFieldGet(this, _SocketClient_connectRoom, "f").call(this, roomId, "join", dataMiddleware);
            return response;
        });
        this.exitRoom = () => __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            const response = yield (0, handleRequest_1.default)(`${this.backendURL}/room/exit`, makeRequest_1.RequestMethod.POST, {
                roomId: (_b = __classPrivateFieldGet(this, _SocketClient_room, "f")) === null || _b === void 0 ? void 0 : _b.id,
                userId: (_c = this.user) === null || _c === void 0 ? void 0 : _c.id,
            }, [
                [
                    this.user === undefined,
                    "Unable to exit room. Client needs a user first",
                ],
                [
                    this.room === undefined,
                    "Unable to exit room. User needs to be in a room first",
                ],
            ], this.exitRoomClient);
            return response;
        });
        this.exitRoomClient = () => {
            var _a;
            (_a = __classPrivateFieldGet(this, _SocketClient_room, "f")) === null || _a === void 0 ? void 0 : _a.close();
            __classPrivateFieldSet(this, _SocketClient_room, undefined, "f");
        };
        this.name = name;
        this.socket = (0, socket_io_client_1.io)(this.wsURI, {
            autoConnect: false,
            transports: ["websocket"],
        });
        this.socket.on("connect", __classPrivateFieldGet(this, _SocketClient_onConnect, "f"));
        this.socket.on("disconnect", __classPrivateFieldGet(this, _SocketClient_onDisconnect, "f"));
        this.socket.on("connect_error", __classPrivateFieldGet(this, _SocketClient_onError, "f"));
    }
    get room() {
        return __classPrivateFieldGet(this, _SocketClient_room, "f");
    }
    get state() {
        return __classPrivateFieldGet(this, _SocketClient_state, "f");
    }
    get backendURL() {
        if (this.secure)
            return `https://${this.host}`;
        else
            return `http://${this.host}`;
    }
    get wsURI() {
        if (this.secure)
            return `wss://${this.host}`;
        else
            return `ws://${this.host}`;
    }
}
exports.SocketClient = SocketClient;
_SocketClient_state = new WeakMap(), _SocketClient_room = new WeakMap(), _SocketClient_promiseResolve = new WeakMap(), _SocketClient_onConnect = new WeakMap(), _SocketClient_onDisconnect = new WeakMap(), _SocketClient_onError = new WeakMap(), _SocketClient_connectRoom = new WeakMap();

export type UserJson = {
    id: string;
    name: string;
};
export declare class User {
    id: string | undefined;
    name: string;
    constructor(name: string, id?: string | undefined);
    static findBy(key: string, value: string, list: User[]): User;
}

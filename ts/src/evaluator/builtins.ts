import { NULL, newError } from ".";
import {
    ArrayObj,
    Builtin,
    HashObj,
    IHashable,
    IObject,
    Integer,
    Obj,
    StringObj,
} from "../object";

export const builtins = new Map<string, Builtin>();

builtins.set(
    "len",
    new Builtin((...args: IObject[]): IObject => {
        if (args.length !== 1) {
            return newError(
                `wrong number of arguments. got=${args.length}, want=1`
            );
        }
        if (args[0] instanceof StringObj) {
            return new Integer(args[0].value.length);
        } else if (args[0] instanceof ArrayObj) {
            return new Integer(args[0].elements.length);
        } else {
            return newError(
                `argument to \`len\` not supported, got ${args[0].type()}`
            );
        }
    })
);
builtins.set(
    "first",
    new Builtin((...args: IObject[]): IObject => {
        if (args.length !== 1) {
            return newError(
                `wrong number of arguments. got=${args.length}, want=1`
            );
        }
        if (args[0].type() !== Obj.ARRAY) {
            return newError(
                `argument to \`first\` must be ARRAY, got ${args[0].type()}`
            );
        }
        const arr = args[0] as ArrayObj;
        if (arr.elements.length > 0) {
            return arr.elements[0];
        }
        return NULL;
    })
);
builtins.set(
    "last",
    new Builtin((...args: IObject[]): IObject => {
        if (args.length !== 1) {
            return newError(
                `wrong number of arguments. got=${args.length}, want=1`
            );
        }
        if (args[0].type() !== Obj.ARRAY) {
            return newError(
                `argument to \`first\` must be ARRAY, got ${args[0].type()}`
            );
        }
        const arr = args[0] as ArrayObj;
        if (arr.elements.length > 0) {
            return arr.elements[length - 1];
        }
        return NULL;
    })
);
builtins.set(
    "rest",
    new Builtin((...args: IObject[]): IObject => {
        if (args.length !== 1) {
            return newError(
                `wrong number of arguments. got=${args.length}, want=1`
            );
        }
        if (args[0].type() !== Obj.ARRAY) {
            return newError(
                `argument to \`first\` must be ARRAY, got ${args[0].type()}`
            );
        }
        const arr = args[0] as ArrayObj;
        const length = arr.elements.length;
        if (length > 0) {
            const newElements = arr.elements.slice(1);
            return new ArrayObj(newElements);
        }
        return NULL;
    })
);
builtins.set(
    "push",
    new Builtin((...args: IObject[]): IObject => {
        if (args.length !== 2) {
            return newError(
                `wrong number of arguments. got=${args.length}, want=2`
            );
        }
        if (args[0].type() !== Obj.ARRAY) {
            return newError(
                `argument to \`first\` must be ARRAY, got ${args[0].type()}`
            );
        }
        const arr = args[0] as ArrayObj;
        const newElements = [...arr.elements, args[1]];
        return new ArrayObj(newElements);
    })
);
builtins.set(
    "add",
    new Builtin((...args: IObject[]): IObject => {
        if (args.length !== 3) {
            return newError(
                `wrong number of arguments. got=${args.length}, want=3`
            );
        }
        if (args[0].type() !== Obj.HASH) {
            return newError(
                `argument to \`first\` must be HASHMAP, got ${args[0].type()}`
            );
        }
        const hash = args[0] as HashObj;
        const key = args[1] as IObject & IHashable;
        if (typeof key.hashKey !== "function") {
            return newError(`unusable as hash key: ${key.type()}`);
        }
        const hashed = key.hashKey();
        hash.pairs.set(hashed, { key: key, value: args[2] });
        return hash;
    })
);
builtins.set(
    "print",
    new Builtin((...args: IObject[]): IObject => {
        for (const arg of args) {
            console.log(arg.inspect());
        }
        return NULL;
    })
);

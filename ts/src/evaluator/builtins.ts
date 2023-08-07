import { newError } from ".";
import { Builtin, IObject, Integer, Obj, StringObj } from "../object";

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
        } else {
            return newError(
                `argument to \`len\` not supported, got ${args[0].type()}`
            );
        }
    })
);

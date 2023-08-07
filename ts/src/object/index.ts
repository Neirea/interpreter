import { BlockStatement, Identifier } from "../ast";
import { Environment } from "./enviroment";

export const Obj = {
    INTEGER: "INTEGER",
    FLOAT: "FLOAT",
    BOOLEAN: "BOOLEAN",
    STRING: "STRING",
    ARRAY: "ARRAY",
    FUNCTION: "FUNCTION",
    BUILTIN: "BUILTIN",
    NULL: "NULL",
    RETURN_VALUE: "RETURN_VALUE",
    ERROR: "ERROR",
};
type ObjectType = string;

export interface IObject {
    type: () => ObjectType;
    inspect: () => string;
}

export class Integer implements IObject {
    constructor(public value: number) {}

    type() {
        return Obj.INTEGER;
    }
    inspect() {
        return this.value.toString();
    }
}

export class Float implements IObject {
    constructor(public value: number) {}

    type() {
        return Obj.FLOAT;
    }
    inspect() {
        return this.value.toString();
    }
}

export class Bool implements IObject {
    constructor(public value: boolean) {}

    type() {
        return Obj.BOOLEAN;
    }
    inspect() {
        return this.value.toString();
    }
}

export class Null implements IObject {
    type() {
        return Obj.NULL;
    }
    inspect() {
        return "null";
    }
}

export class ReturnValue implements IObject {
    constructor(public value: IObject) {}

    type() {
        return Obj.RETURN_VALUE;
    }
    inspect() {
        return this.value.inspect();
    }
}

export class ErrorObj implements IObject {
    constructor(public message: string) {}

    type() {
        return Obj.ERROR;
    }
    inspect() {
        return "ERROR: " + this.message;
    }
}

export class FunctionObj implements IObject {
    constructor(
        public parameters: Identifier[],
        public body: BlockStatement,
        public env: Environment
    ) {}

    type() {
        return Obj.FUNCTION;
    }
    inspect() {
        let params = [];
        for (const p of this.parameters) {
            params.push(p.toString());
        }
        return `fn(${params.join(", ")}) {\n${this.body.toString()}\n}`;
    }
}

export class StringObj implements IObject {
    constructor(public value: string) {}

    type() {
        return Obj.STRING;
    }
    inspect() {
        return this.value;
    }
}

type BuiltinFunction = (...args: IObject[]) => IObject;

export class Builtin implements IObject {
    constructor(public fn: BuiltinFunction) {}

    type() {
        return Obj.BUILTIN;
    }
    inspect() {
        return "builtin function";
    }
}

export class ArrayObj implements IObject {
    constructor(public elements: IObject[]) {}

    type() {
        return Obj.ARRAY;
    }
    inspect() {
        let out: string[] = [];
        for (const el of this.elements) {
            out.push(el.inspect());
        }
        return `[${out.join(", ")}]`;
    }
}

import { BlockStatement, INode, Identifier } from "../ast";
import { Environment } from "./enviroment";
import * as crypto from "node:crypto";

export const Obj = {
    INTEGER: "INTEGER",
    FLOAT: "FLOAT",
    BOOLEAN: "BOOLEAN",
    STRING: "STRING",
    ARRAY: "ARRAY",
    HASH: "HASH",
    FUNCTION: "FUNCTION",
    BUILTIN: "BUILTIN",
    NULL: "NULL",
    RETURN_VALUE: "RETURN_VALUE",
    QUOTE: "QUOTE",
    MACRO: "MACRO",
    ERROR: "ERROR",
};
type ObjectType = string;

export interface IObject {
    type: () => ObjectType;
    inspect: () => string;
}

export class Integer implements IObject, IHashable {
    constructor(public value: number) {}

    type() {
        return Obj.INTEGER;
    }
    inspect() {
        return this.value.toString();
    }
    hashKey() {
        return this.value;
    }
}

export class Float implements IObject, IHashable {
    constructor(public value: number) {}

    type() {
        return Obj.FLOAT;
    }
    inspect() {
        return this.value.toString();
    }
    hashKey() {
        return this.value;
    }
}

export class Bool implements IObject, IHashable {
    constructor(public value: boolean) {}

    type() {
        return Obj.BOOLEAN;
    }
    inspect() {
        return this.value.toString();
    }
    hashKey() {
        return this.value ? 1 : 0;
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
    constructor(public message: string, public line?: number) {}

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
        let params = this.parameters.map((p) => p.toString());
        return `fn(${params.join(", ")}) {\n${this.body.toString()}\n}`;
    }
}

export class StringObj implements IObject, IHashable {
    constructor(public value: string) {}

    type() {
        return Obj.STRING;
    }
    inspect() {
        return this.value;
    }

    hashKey() {
        const hash = crypto.createHash("sha256");
        hash.update(this.value);
        const hashValue = hash.digest("hex");
        return parseInt(hashValue, 16);
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
        const out = this.elements.map((p) => p.inspect());
        return `[${out.join(", ")}]`;
    }
}

export type HashPair = {
    key: IObject;
    value: IObject;
};

export interface IHashable {
    hashKey(): number;
}

export class HashObj implements IObject {
    constructor(public pairs: Map<number, HashPair>) {}

    type() {
        return Obj.HASH;
    }

    inspect() {
        const pairs: string[] = [];
        for (const [hashKey, hashPair] of this.pairs) {
            pairs.push(
                `${hashPair.key.inspect()}: ${hashPair.value.inspect()}`
            );
        }
        return `{${pairs.join(", ")}}`;
    }
}

export class Quote implements IObject {
    constructor(public node: INode) {}

    type() {
        return Obj.QUOTE;
    }
    inspect() {
        return `QUOTE(${this.node.toString()})`;
    }
}

export class Macro implements IObject {
    constructor(
        public parameters: Identifier[],
        public body: BlockStatement,
        public env: Environment
    ) {}

    type() {
        return Obj.MACRO;
    }
    inspect() {
        const params = this.parameters.map((p) => p.toString());
        return `macro(${params.join(", ")}) {\n${this.body.toString()}\n}`;
    }
}

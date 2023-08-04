import { IObject } from ".";

type StoreType = { [key: string]: IObject };

export class Environment {
    constructor(public store: StoreType, public outer?: Environment) {}

    static new(): Environment {
        return new Environment({});
    }

    static newEnclosedEnvironment(outerEnv: Environment): Environment {
        return new Environment({}, outerEnv);
    }
    get(name: string): IObject {
        let obj = this.store[name];
        if (obj === undefined && this.outer) {
            obj = this.outer.get(name);
        }
        return obj;
    }

    set(name: string, val: IObject): IObject {
        this.store[name] = val;
        return val;
    }
}

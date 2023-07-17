import { Token } from "../token";

interface INode {
    tokenLiteral: () => string;
    toString: () => string;
}
interface Statement extends INode {
    statementNode: () => void; //dummy method
}
interface Expression extends INode {
    expressionNode: () => void; //dummy method
}

export class Program implements INode {
    constructor(public statements: Statement[]) {}

    tokenLiteral() {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        } else {
            return "";
        }
    }
    toString() {
        let res = "";
        for (const stmt of this.statements) {
            res += stmt.toString();
        }
        return res;
    }
}

export class Identifier implements Expression {
    constructor(public token: Token, public value: string) {}
    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return this.value;
    }
}

export class LetStatement implements Statement {
    constructor(
        public token: Token,
        public name: Identifier,
        public value: Expression
    ) {}

    statementNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        let res = `${this.tokenLiteral()} ${this.name.toString()} = `;
        if (this.value) {
            res += this.value.toString();
        }
        res += ";";
        return res;
    }
}

export class ReturnStatement implements Statement {
    constructor(public token: Token, public returnValue: Expression) {}

    statementNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        let res = `${this.tokenLiteral()} `;
        if (this.returnValue) {
            res += this.returnValue;
        }
        res += ";";
        return res;
    }
}

export class ExpressionStatement implements Statement {
    constructor(public token: Token, public expression: Expression) {}

    statementNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        if (this.expression) return this.expression.toString();
        return "";
    }
}

export class BlockStatement implements Statement {
    constructor(public token: Token, public statements: Statement[]) {}

    statementNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return this.statements.map((stmt) => stmt.toString()).join();
    }
}

export class Integerliteral implements Expression {
    constructor(public token: Token, public value: number) {}

    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return this.token.literal;
    }
}

export class PrefixExpression implements Expression {
    constructor(
        public token: Token,
        public operator: string,
        public right: Expression
    ) {}

    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return `(${this.operator}${this.right.toString()})`;
    }
}

export class InfixExpression implements Expression {
    constructor(
        public token: Token,
        public left: Expression,
        public operator: string,
        public right: Expression
    ) {}

    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return `(${this.left.toString()} ${
            this.operator
        } ${this.right.toString()})`;
    }
}

export class BooleanExpression implements Expression {
    constructor(public token: Token, public value: boolean) {}

    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return this.token.literal;
    }
}

export class IfExpression implements Expression {
    constructor(
        public token: Token,
        public condition: Expression,
        public consequence: BlockStatement,
        public alternative: BlockStatement
    ) {}

    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        let res = `if ${this.condition.toString()} ${this.consequence.toString()}`;
        if (this.alternative) {
            res += `else ${this.alternative.toString()}`;
        }
        return res;
    }
}

export class FunctionLiteral implements Expression {
    constructor(
        public token: Token,
        public parameters: Identifier[],
        public body: BlockStatement
    ) {}

    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        const paramStrings = this.parameters.map((param) => param.toString());
        return `${this.tokenLiteral()}(${this.parameters.join()})${this.body.toString()}`;
    }
}

export class CallExpression implements Expression {
    constructor(
        public token: Token,
        public func: Expression,
        public args: Expression[]
    ) {}

    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        let argStrings = this.args.map((arg) => arg.toString());
        return `${this.func.toString()}(${argStrings.join(",")})`;
    }
}
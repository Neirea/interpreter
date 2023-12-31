import { Token } from "../token";

export interface INode {
    tokenLine: () => number;
    tokenLiteral: () => string;
    toString: () => string;
}
export interface Statement extends INode {
    statementNode: () => void; //dummy method
}
export interface Expression extends INode {
    expressionNode: () => void; //dummy method
}

export class Program implements INode {
    constructor(public statements: Statement[]) {}

    tokenLine() {
        return 1;
    }
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
    tokenLine() {
        return this.token.line;
    }
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
    tokenLine() {
        return this.token.line;
    }
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
    tokenLine() {
        return this.token.line;
    }
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
    tokenLine() {
        return this.token.line;
    }
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
    tokenLine() {
        return this.token.line;
    }
    statementNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return this.statements.map((stmt) => stmt.toString()).join();
    }
}

export class IntegerLiteral implements Expression {
    constructor(public token: Token, public value: number) {}
    tokenLine() {
        return this.token.line;
    }
    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return this.token.literal;
    }
}
export class FloatLiteral implements Expression {
    constructor(public token: Token, public value: number) {}
    tokenLine() {
        return this.token.line;
    }
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
    tokenLine() {
        return this.token.line;
    }
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
    tokenLine() {
        return this.token.line;
    }
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

export class BooleanLiteral implements Expression {
    constructor(public token: Token, public value: boolean) {}
    tokenLine() {
        return this.token.line;
    }
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
        public alternative?: BlockStatement
    ) {}
    tokenLine() {
        return this.token.line;
    }
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
    tokenLine() {
        return this.token.line;
    }
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
    tokenLine() {
        return this.token.line;
    }
    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        let argStrings = this.args.map((arg) => arg.toString());
        return `${this.func.toString()}(${argStrings.join(", ")})`;
    }
}

export class StringLiteral implements Expression {
    constructor(public token: Token, public value: string) {}
    tokenLine() {
        return this.token.line;
    }
    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return this.token.literal;
    }
}

export class ArrayLiteral implements Expression {
    constructor(public token: Token, public elements: Expression[]) {}
    tokenLine() {
        return this.token.line;
    }
    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return `[${this.elements.join(", ")}]`;
    }
}

export class IndexExpression implements Expression {
    constructor(
        public token: Token,
        public left: Expression,
        public index: Expression
    ) {}
    tokenLine() {
        return this.token.line;
    }
    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return `(${this.left.toString()}[${this.index.toString()}])`;
    }
}

export class HashLiteral implements Expression {
    constructor(
        public token: Token,
        public pairs: Map<Expression, Expression>
    ) {}
    tokenLine() {
        return this.token.line;
    }
    expressionNode() {}
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        const pairs: string[] = [];
        for (const [key, value] of this.pairs) {
            pairs.push(key.toString() + ":" + value.toString());
        }
        return `{${pairs.join(", ")}}`;
    }
}

export class MacroLiteral implements Expression {
    constructor(
        public token: Token,
        public parameters: Identifier[],
        public body: BlockStatement
    ) {}

    expressionNode() {}
    tokenLine() {
        return this.token.line;
    }
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        let params = this.parameters.map((param) => param.toString());
        return `${this.tokenLiteral()}(${params.join(
            ", "
        )}) ${this.body.toString()}`;
    }
}

export class ErrorLiteral implements Expression {
    constructor(public message: string, public line: number = 0) {}

    expressionNode() {}
    tokenLine() {
        return this.line;
    }
    tokenLiteral() {
        return "Error";
    }
    toString() {
        return this.message;
    }
}

export class WhileStatement implements Statement {
    constructor(
        public token: Token,
        public condition: Expression,
        public body: BlockStatement
    ) {}

    statementNode() {}
    tokenLine() {
        return this.token.line;
    }
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return `while${this.condition.toString()} ${this.body.toString()}`;
    }
}

export class AssignExpression implements Expression {
    constructor(
        public token: Token,
        public name: Identifier,
        public value: Expression
    ) {}
    expressionNode() {}

    tokenLine() {
        return this.token.line;
    }
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return `${this.name} = ${this.value ? this.value.toString() : ""};`;
    }
}

export class ForStatement implements Statement {
    constructor(
        public token: Token,
        public init: Expression | undefined,
        public condition: Expression,
        public update: Expression | undefined,
        public body: BlockStatement
    ) {}
    statementNode() {}
    tokenLine() {
        return this.token.line;
    }
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        const initStr = this.init ? this.init.toString() : "";
        const updateStr = this.update ? this.update.toString() : "";
        return `for(${initStr};${this.condition.toString()};${updateStr}) ${this.body.toString()}`;
    }
}

export class BreakStatement implements Statement {
    constructor(public token: Token) {}
    statementNode() {}
    tokenLine() {
        return this.token.line;
    }
    tokenLiteral() {
        return this.token.literal;
    }
    toString() {
        return this.token.literal + ";";
    }
}

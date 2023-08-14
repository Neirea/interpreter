import {
    ArrayLiteral,
    BlockStatement,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    HashLiteral,
    INode,
    Identifier,
    IfExpression,
    IndexExpression,
    InfixExpression,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
} from ".";

type ModifierFunc = (node: INode | undefined) => INode | undefined;
export function modify(
    node: INode | undefined,
    modifier: ModifierFunc
): INode | undefined {
    switch (node?.constructor) {
        case Program: {
            const statements = (node as Program).statements;
            for (let i = 0; i < statements.length; i++) {
                const stmt = modify(statements[i], modifier) as Statement;
                if (!stmt) return;
                statements[i] = stmt;
            }
            break;
        }
        case ExpressionStatement: {
            const expr = modify(
                (node as ExpressionStatement).expression,
                modifier
            ) as Expression;
            if (!expr) return;
            (node as ExpressionStatement).expression = expr;
            break;
        }
        case InfixExpression: {
            const left = modify(
                (node as InfixExpression).left,
                modifier
            ) as Expression;
            if (!left) return;
            (node as InfixExpression).left = left;
            const right = modify(
                (node as InfixExpression).right,
                modifier
            ) as Expression;
            if (!right) return;
            (node as InfixExpression).right = right;
            break;
        }
        case PrefixExpression: {
            const right = modify(
                (node as PrefixExpression).right,
                modifier
            ) as Expression;
            if (!right) return;
            (node as PrefixExpression).right = right;
            break;
        }
        case IndexExpression: {
            const left = modify(
                (node as IndexExpression).left,
                modifier
            ) as Expression;
            if (!left) return;
            (node as IndexExpression).left = left;
            const index = modify(
                (node as IndexExpression).index,
                modifier
            ) as Expression;
            if (!index) return;
            (node as IndexExpression).index = index;
            break;
        }
        case IfExpression: {
            const condition = modify(
                (node as IfExpression).condition,
                modifier
            ) as Expression;
            if (!condition) return;
            (node as IfExpression).condition = condition;
            const consequence = modify(
                (node as IfExpression).consequence,
                modifier
            ) as BlockStatement;
            if (!consequence) return;
            (node as IfExpression).consequence = consequence;
            if ((node as IfExpression).alternative) {
                const alternative = modify(
                    (node as IfExpression).alternative,
                    modifier
                ) as BlockStatement;
                if (!alternative) return;
                (node as IfExpression).alternative = alternative;
            }
            break;
        }
        case BlockStatement: {
            const blockStmts = (node as BlockStatement).statements;
            for (let i = 0; i < blockStmts.length; i++) {
                const stmt = modify(blockStmts[i], modifier) as Statement;
                if (!stmt) return;
                blockStmts[i] = stmt;
            }
            break;
        }
        case ReturnStatement: {
            const returnValue = modify(
                (node as ReturnStatement).returnValue,
                modifier
            ) as Expression;
            if (!returnValue) return;
            (node as ReturnStatement).returnValue = returnValue;
            break;
        }
        case LetStatement: {
            const value = modify(
                (node as LetStatement).value,
                modifier
            ) as Expression;
            if (!value) return;
            (node as LetStatement).value = value;
            break;
        }
        case FunctionLiteral: {
            const params = (node as FunctionLiteral).parameters;
            for (let i = 0; i < params.length; i++) {
                const param = modify(params[i], modifier) as Identifier;
                if (!param) return;
                params[i] = param;
            }
            const body = modify(
                (node as FunctionLiteral).body,
                modifier
            ) as BlockStatement;
            if (!body) return;
            (node as FunctionLiteral).body = body;
            break;
        }
        case ArrayLiteral: {
            const elements = (node as ArrayLiteral).elements;
            for (let i = 0; i < elements.length; i++) {
                const elem = modify(elements[i], modifier) as Expression;
                if (!elem) return;
                elements[i] = elem;
            }
            break;
        }
        case HashLiteral: {
            const newPairs = new Map<Expression, Expression>();
            for (const [key, value] of (node as HashLiteral).pairs) {
                const newKey = modify(key, modifier) as Expression;
                if (!newKey) return;
                const newVal = modify(value, modifier) as Expression;
                if (!newVal) return;
                newPairs.set(newKey, newVal);
            }
            (node as HashLiteral).pairs = newPairs;
        }
    }
    return modifier(node);
}

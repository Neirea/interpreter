import {
    ArrayLiteral,
    AssignStatement,
    BlockStatement,
    BooleanLiteral,
    CallExpression,
    ErrorLiteral,
    Expression,
    ExpressionStatement,
    FloatLiteral,
    FunctionLiteral,
    HashLiteral,
    INode,
    Identifier,
    IfExpression,
    IndexExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
    StringLiteral,
    WhileStatement,
} from "../ast";
import {
    ArrayObj,
    Bool,
    Builtin,
    ErrorObj,
    Float,
    FunctionObj,
    HashObj,
    HashPair,
    IHashable,
    IObject,
    Integer,
    Null,
    Obj,
    ReturnValue,
    StringObj,
} from "../object";
import { Environment } from "../object/enviroment";
import { builtins } from "./builtins";
import { quote } from "./quote_unquote";

export const NULL = new Null();
export const TRUE = new Bool(true);
export const FALSE = new Bool(false);

export function evalCode(
    node: INode | undefined,
    env: Environment
): IObject | undefined {
    switch (node?.constructor) {
        // Statements
        case Program:
            return evalProgram((node as Program).statements, env);
        case ExpressionStatement:
            return evalCode((node as ExpressionStatement).expression, env);
        case BlockStatement:
            return evalBlockStatement(node as BlockStatement, env);
        case LetStatement: {
            const letStmt = node as LetStatement;
            const val = evalCode(letStmt.value, env);
            if (isError(val)) {
                return setLineError(node, val);
            }
            const value = env.get(letStmt.name.value);
            if (value !== undefined) {
                return new ErrorObj(
                    `Identifier ${letStmt.name.value} already exists`,
                    letStmt.tokenLine()
                );
            }
            env.set(letStmt.name.value, val!);
            break;
        }
        case AssignStatement: {
            const stmt = node as AssignStatement;
            const val = evalCode(stmt.value, env);
            if (isError(val)) {
                return setLineError(stmt, val);
            }
            const value = env.get(stmt.name.value);
            if (value === undefined) {
                return new ErrorObj(
                    `${stmt.name.value} is not defined`,
                    stmt.tokenLine()
                );
            }
            env.set(stmt.name.value, val!);
            break;
        }
        // Expressions
        case Identifier: {
            const res = evalIdentifier(node as Identifier, env);
            if (isError(res)) {
                return setLineError(node, res);
            }
            return res;
        }
        case CallExpression: {
            const callExpr = node as CallExpression;
            if (callExpr.func.tokenLiteral() === "quote") {
                return quote(callExpr.args[0], env);
            }
            const func = evalCode(callExpr.func, env);
            if (isError(func)) {
                return setLineError(node, func);
            }
            const args = evalExpressions(callExpr.args, env);
            if (args.length === 1 && isError(args[0])) {
                return setLineError(node, args[0]);
            }
            const res = applyFunction(func as IObject, args);
            if (isError(res)) {
                return setLineError(node, res);
            }
            return res;
        }
        case IntegerLiteral:
            return new Integer((node as IntegerLiteral).value);
        case FloatLiteral:
            return new Float((node as FloatLiteral).value);
        case BooleanLiteral:
            return nativeBoolToBooleanObject((node as BooleanLiteral).value);
        case StringLiteral:
            return new StringObj((node as StringLiteral).value);
        case ArrayLiteral: {
            const elements = evalExpressions(
                (node as ArrayLiteral).elements,
                env
            );
            if (elements.length === 1 && isError(elements[0])) {
                return setLineError(node, elements[0]);
            }
            return new ArrayObj(elements);
        }
        case IndexExpression: {
            const left = evalCode((node as IndexExpression).left, env);
            if (isError(left)) {
                return left;
            }
            const index = evalCode((node as IndexExpression).index, env);
            if (isError(index)) {
                return setLineError(node, index);
            }
            const res = evalIndexExpression(left as IObject, index as IObject);
            if (isError(res)) {
                return setLineError(node, res);
            }
            return res;
        }
        case HashLiteral: {
            const res = evalHashLiteral(node as HashLiteral, env);
            if (isError(res)) {
                return setLineError(node, res);
            }
            return res;
        }
        case FunctionLiteral: {
            const params = (node as FunctionLiteral).parameters;
            const body = (node as FunctionLiteral).body;
            return new FunctionObj(params, body, env);
        }
        case PrefixExpression: {
            const right = evalCode((node as PrefixExpression).right, env);
            if (isError(right)) {
                return setLineError(node, right);
            }
            const res = evalPrefixExpression(
                (node as PrefixExpression).operator,
                right as IObject
            );
            if (isError(res)) {
                return setLineError(node, res);
            }
            return res;
        }
        case InfixExpression: {
            const left = evalCode((node as InfixExpression).left, env);
            if (isError(left)) {
                return setLineError(node, left);
            }
            const right = evalCode((node as InfixExpression).right, env);
            if (isError(right)) {
                return setLineError(node, right);
            }
            const res = evalInfixExpression(
                (node as InfixExpression).operator,
                left as IObject,
                right as IObject
            );
            if (isError(res)) {
                return setLineError(node, res);
            }
            return res;
        }
        case IfExpression:
            return evalIfExpression(node as IfExpression, env);
        case ReturnStatement: {
            const retVal = evalCode((node as ReturnStatement).returnValue, env);
            if (isError(retVal)) {
                return setLineError(node, retVal);
            }
            return new ReturnValue(retVal as IObject);
        }
        case WhileStatement: {
            return evalWhileStatement(node as WhileStatement, env);
        }
        case ErrorLiteral:
            return new ErrorObj(
                (node as ErrorLiteral).message,
                node.tokenLine()
            );
    }
}

function evalProgram(
    stmts: Statement[],
    env: Environment
): IObject | undefined {
    let result: IObject | undefined = undefined;
    for (const statement of stmts) {
        result = evalCode(statement, env);

        if (result instanceof ReturnValue) {
            return result.value;
        }
        if (result instanceof ErrorObj) {
            return result;
        }
    }
    return result;
}

function evalBlockStatement(
    block: BlockStatement,
    env: Environment
): IObject | undefined {
    let result: IObject | undefined = undefined;
    for (const statement of block.statements) {
        result = evalCode(statement, env);
        if (result) {
            const rt = result.type();
            if (rt === Obj.RETURN_VALUE || rt === Obj.ERROR) {
                return result;
            }
        }
    }
    return result;
}

function evalExpressions(exps: Expression[], env: Environment): IObject[] {
    let result: IObject[] = [];
    for (const e of exps) {
        const evaluated = evalCode(e, env);
        if (isError(evaluated)) {
            return [evaluated as IObject];
        }
        result.push(evaluated as IObject);
    }
    return result;
}

function evalIndexExpression(left: IObject, index: IObject): IObject {
    if (left.type() === Obj.ARRAY && index.type() === Obj.INTEGER) {
        return evalArrayIndexExpression(left, index);
    } else if (left.type() === Obj.HASH) {
        return evalHashIndexExpression(left, index);
    } else {
        return newError(
            `index operator not supported:${index.type()} for ${left.type()}`
        );
    }
}

function evalArrayIndexExpression(array: IObject, index: IObject): IObject {
    const arrayObject = array as ArrayObj;
    const idx = (index as Integer).value;
    const max = arrayObject.elements.length - 1;
    if (idx < 0 || idx > max) {
        return NULL;
    }
    return arrayObject.elements[idx];
}

function evalHashIndexExpression(hash: IObject, index: IObject): IObject {
    const hashObject = hash as HashObj;
    const key = index as IObject & IHashable;
    if (typeof key.hashKey !== "function") {
        return newError(`unusable as hash key: ${index.type()}`);
    }
    const pair = hashObject.pairs.get(key.hashKey());
    if (pair === undefined) return NULL;
    return pair.value;
}

function evalHashLiteral(node: HashLiteral, env: Environment) {
    const pairs = new Map<number, HashPair>();

    for (const [keyNode, valueNode] of node.pairs) {
        const key = evalCode(keyNode, env);
        if (isError(key)) {
            return setLineError(node, key);
        }
        if (key === undefined) return;
        const hashKey = key as IObject & IHashable;
        if (typeof hashKey.hashKey !== "function") {
            return newError(`unusable as hash key: ${key.type()}`);
        }
        const value = evalCode(valueNode, env);
        if (isError(value)) {
            return setLineError(node, value);
        }
        if (value === undefined) return;
        const hashed = hashKey.hashKey();
        pairs.set(hashed, { key: key, value: value });
    }
    return new HashObj(pairs);
}

function evalIfExpression(
    ie: IfExpression,
    env: Environment
): IObject | undefined {
    const condition = evalCode(ie.condition, env);
    if (isError(condition)) {
        return setLineError(ie, condition);
    }
    if (isTruthy(condition as IObject)) {
        return evalCode(ie.consequence, env);
    } else if (ie.alternative) {
        return evalCode(ie.alternative, env);
    } else {
        return NULL;
    }
}

function evalWhileStatement(we: WhileStatement, env: Environment) {
    const originalCondition = we.condition;
    let condition = evalCode(we.condition, env);
    if (isError(condition)) {
        return setLineError(we, condition);
    }
    while (isTruthy(condition as IObject)) {
        evalBlockStatement(we.body, env);
        condition = evalCode(originalCondition, env);
    }
}

function evalIdentifier(node: Identifier, env: Environment): IObject {
    const val = env.get(node.value);
    if (val !== undefined) {
        return val;
    }
    const builtin = builtins.get(node.value);
    if (builtin !== undefined) {
        return builtin;
    }
    return newError("identifier not found: " + node.value);
}

function nativeBoolToBooleanObject(input: boolean): IObject {
    if (input) {
        return TRUE;
    } else {
        return FALSE;
    }
}

function evalPrefixExpression(operator: string, right: IObject): IObject {
    switch (operator) {
        case "!":
            return evalBangOperatorExpression(right);
        case "-":
            return evalMinusPrefixOperatorExpression(right);
        default:
            return new ErrorObj(
                `unknown operator: ${operator} ${right.type()}`
            );
    }
}

function evalBangOperatorExpression(right: IObject): IObject {
    switch (right) {
        case TRUE:
            return FALSE;
        case FALSE:
            return TRUE;
        case NULL:
            return TRUE;
        default:
            if (right.constructor === Integer || right.constructor === Float) {
                if ((right as Integer).value === 0) return TRUE;
            }
            return FALSE;
    }
}

function evalMinusPrefixOperatorExpression(right: IObject): IObject {
    const rightType = right.type();
    switch (rightType) {
        case Obj.INTEGER: {
            const value = (right as Integer).value;
            return new Integer(-value);
        }
        case Obj.FLOAT: {
            const value = (right as Float).value;
            return new Float(-value);
        }
        default:
            return newError(`unknown operator: -${right.type()}`);
    }
}

function evalNumberInfixExpression(
    operator: string,
    left: IObject,
    right: IObject
): IObject {
    const leftVal = (left as Float).value;
    const rightVal = (right as Float).value;

    switch (operator) {
        case "+": {
            const result = leftVal + rightVal;
            return createNumber(left, right, result);
        }
        case "-": {
            const result = leftVal - rightVal;
            return createNumber(left, right, result);
        }
        case "*": {
            const result = leftVal * rightVal;
            return createNumber(left, right, result);
        }
        case "/": {
            const result = leftVal / rightVal;
            return createNumber(left, right, result);
        }
        case "<": {
            return nativeBoolToBooleanObject(leftVal < rightVal);
        }
        case ">": {
            return nativeBoolToBooleanObject(leftVal > rightVal);
        }
        case "<=": {
            return nativeBoolToBooleanObject(leftVal <= rightVal);
        }
        case ">=": {
            return nativeBoolToBooleanObject(leftVal >= rightVal);
        }
        case "==": {
            return nativeBoolToBooleanObject(leftVal === rightVal);
        }
        case "!=": {
            return nativeBoolToBooleanObject(leftVal !== rightVal);
        }
        default:
            return newError(
                `unknown operator: ${left.type()} ${operator} ${right.type()}`
            );
    }
}

function evalInfixExpression(operator: string, left: IObject, right: IObject) {
    const isLeftNumber =
        left.type() === Obj.INTEGER || left.type() === Obj.FLOAT;
    const isRightNumber =
        right.type() === Obj.INTEGER || right.type() === Obj.FLOAT;

    if (isLeftNumber && isRightNumber) {
        return evalNumberInfixExpression(operator, left, right);
    }
    if (operator === "==") {
        return nativeBoolToBooleanObject(left === right);
    }
    if (operator === "!=") {
        return nativeBoolToBooleanObject(left !== right);
    }
    if (left.type() !== right.type()) {
        return newError(
            `type mismatch: ${left.type()} ${operator} ${right.type()}`
        );
    }
    if (left.type() === Obj.STRING && right.type() === Obj.STRING) {
        return evalStringInfixExpression(operator, left, right);
    }
    return newError(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`
    );
}

function evalStringInfixExpression(
    operator: string,
    left: IObject,
    right: IObject
): IObject {
    const leftVal = (left as StringObj).value;
    const rightVal = (right as StringObj).value;

    switch (operator) {
        case "+":
            return new StringObj(leftVal + rightVal);
        case "==":
            return new Bool(leftVal === rightVal);
        case "!=":
            return new Bool(leftVal !== rightVal);
        default:
            return newError(
                `unknown operator: ${left.type()} ${operator} ${right.type()}`
            );
    }
}

function createNumber(left: IObject, right: IObject, result: number) {
    if (left.type() == Obj.INTEGER && right.type() == Obj.INTEGER) {
        return new Integer(Math.floor(result));
    } else {
        return new Float(result);
    }
}

export function newError(format: string): ErrorObj {
    return new ErrorObj(format);
}

function applyFunction(fn: IObject, args: IObject[]): IObject | undefined {
    switch (fn.constructor) {
        case FunctionObj: {
            const func = fn as FunctionObj;
            const extendedEnv = extendFunctionEnv(func, args);
            const evaluated = evalCode(func.body, extendedEnv);
            return unwrapReturnValue(evaluated);
        }
        case Builtin: {
            return (fn as Builtin).fn(...args);
        }
        default:
            return newError(`not a function: ${fn.type()}`);
    }
}

function extendFunctionEnv(fn: FunctionObj, args: IObject[]): Environment {
    const env = Environment.newEnclosedEnvironment(fn.env);
    for (let i = 0; i < fn.parameters.length; i++) {
        const param = fn.parameters[i];
        env.set(param.value, args[i]);
    }
    return env;
}

function unwrapReturnValue(obj: IObject | undefined): IObject | undefined {
    if (obj instanceof ReturnValue) {
        return obj.value;
    }
    return obj;
}

function isError(obj: IObject | undefined): boolean {
    if (obj !== undefined) {
        return obj.type() === Obj.ERROR;
    }
    return false;
}

function isTruthy(obj: IObject): boolean {
    switch (obj) {
        case NULL:
            return false;
        case TRUE:
            return true;
        case FALSE:
            return false;
        default:
            if (obj.constructor === Integer || obj.constructor === Float) {
                if ((obj as Integer).value === 0) return false;
            }
            return true;
    }
}

function setLineError(
    node: INode,
    obj: IObject | undefined
): IObject | undefined {
    if (obj?.constructor === ErrorObj) {
        const err = obj as ErrorObj;
        err.line = node.tokenLine();
        return err;
    }
    return obj;
}

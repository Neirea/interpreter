import { evalCode } from ".";
import {
    BooleanLiteral,
    CallExpression,
    FloatLiteral,
    INode,
    IntegerLiteral,
} from "../ast";
import { modify } from "../ast/modify";
import { Bool, ErrorObj, Float, IObject, Integer, Quote } from "../object";
import { Environment } from "../object/enviroment";
import { Token, token } from "../token";

export function quote(node: INode, env: Environment): IObject {
    const res = evalUnquoteCalls(node, env);
    if (res === undefined) {
        return new ErrorObj(
            "Failed to evaluate unquote inside of a macro",
            node.tokenLine()
        );
    }
    return new Quote(res);
}

export function evalUnquoteCalls(
    quoted: INode,
    env: Environment
): INode | undefined {
    return modify(quoted, (node) => {
        if (!isUnquoteCall(node)) {
            return node;
        }

        if (!(node instanceof CallExpression)) {
            return node;
        }
        const call = node as CallExpression;
        if (call.args.length !== 1) {
            return node;
        }
        const unquoted = evalCode(call.args[0], env);
        return convertObjectToASTNode(unquoted, node);
    });
}

function isUnquoteCall(node: INode | undefined): boolean {
    if (!(node instanceof CallExpression)) {
        return false;
    }
    const callExpression = node as CallExpression;
    return callExpression.func.tokenLiteral() === "unquote";
}

function convertObjectToASTNode(
    obj: IObject | undefined,
    node: INode
): INode | undefined {
    switch (obj?.constructor) {
        case Integer: {
            const tkn = new Token(
                token.INT,
                (obj as Integer).value.toString(),
                node.tokenLine()
            );
            return new IntegerLiteral(tkn, (obj as Integer).value);
        }
        case Float: {
            const tkn = new Token(
                token.FLOAT,
                (obj as Float).value.toString(),
                node.tokenLine()
            );
            return new FloatLiteral(tkn, (obj as Float).value);
        }
        case Bool: {
            const tkn = (obj as Bool).value
                ? new Token(token.TRUE, "true", node.tokenLine())
                : new Token(token.FALSE, "false", node.tokenLine());
            return new BooleanLiteral(tkn, (obj as Bool).value);
        }
        case Quote: {
            return (obj as Quote).node;
        }
    }
}

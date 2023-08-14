import { evalCode } from ".";
import {
    CallExpression,
    ErrorLiteral,
    INode,
    Identifier,
    LetStatement,
    MacroLiteral,
    Program,
    Statement,
} from "../ast";
import { modify } from "../ast/modify";
import { ErrorObj, Macro, Quote } from "../object";
import { Environment } from "../object/enviroment";

export function defineMacros(program: Program, env: Environment) {
    const definitions: number[] = [];

    for (let i = 0; i < program.statements.length; i++) {
        const statement = program.statements[i];
        if (isMacroDefinition(statement)) {
            addMacro(statement, env);
            definitions.push(i);
        }
    }

    for (let i = definitions.length - 1; i >= 0; i--) {
        program.statements.splice(definitions[i], 1);
    }
}

function isMacroDefinition(node: Statement): boolean {
    if (!(node instanceof LetStatement)) {
        return false;
    }
    const letStatement = node as LetStatement;
    return letStatement.value instanceof MacroLiteral;
}

function addMacro(stmt: Statement, env: Environment) {
    if (!(stmt instanceof LetStatement)) return;
    const letStatement = stmt as LetStatement;
    if (!(letStatement.value instanceof MacroLiteral)) return;
    const macroLiteral = letStatement.value as MacroLiteral;

    const macro = new Macro(macroLiteral.parameters, macroLiteral.body, env);
    env.set(letStatement.name.value, macro);
}

export function expandMacros(
    program: INode | undefined,
    env: Environment
): INode | undefined {
    return modify(program, (node) => {
        if (!(node instanceof CallExpression)) return node;
        const callExpression = node as CallExpression;
        const macro = getMacroCall(callExpression, env);
        if (!macro) return node;
        const args = quoteArgs(callExpression);
        const evalEnv = extendMacroEnv(macro, args);
        const evaluated = evalCode(macro.body, evalEnv);

        switch (evaluated?.constructor) {
            case Quote: {
                return (evaluated as Quote).node;
            }
            case ErrorObj: {
                const err = evaluated as ErrorObj;
                return new ErrorLiteral(err.message, err.line);
            }
            default:
                return new ErrorLiteral(
                    "we only support returning AST-nodes from macros",
                    macro.body.tokenLine()
                );
        }
    });
}

function getMacroCall(
    exp: CallExpression,
    env: Environment
): Macro | undefined {
    if (!(exp.func instanceof Identifier)) return;
    const identifier = exp.func as Identifier;
    const obj = env.get(identifier.value);

    if (!obj) return;
    if (!(obj instanceof Macro)) return;
    return obj as Macro;
}

function quoteArgs(exp: CallExpression): Quote[] {
    const args: Quote[] = [];
    for (const arg of exp.args) {
        args.push(new Quote(arg));
    }
    return args;
}

function extendMacroEnv(macro: Macro, args: Quote[]): Environment {
    const extended = Environment.newEnclosedEnvironment(macro.env);

    for (let i = 0; i < macro.parameters.length; i++) {
        const param = macro.parameters[i];
        extended.set(param.value, args[i]);
    }
    return extended;
}

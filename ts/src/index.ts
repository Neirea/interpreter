import * as fs from "node:fs/promises";
import os from "node:os";
import { evalCode } from "./evaluator";
import { Lexer } from "./lexer";
import { ErrorObj, Null } from "./object";
import { Environment } from "./object/enviroment";
import { ParseError, Parser } from "./parser";
import { replStart } from "./repl";

(async () => {
    const fileFlagIndex = process.argv.indexOf("-f");
    if (fileFlagIndex !== -1 && fileFlagIndex + 1 < process.argv.length) {
        const filePath = process.argv[fileFlagIndex + 1];
        await handleFileExecute(filePath);
        return;
    }
    // Check for other flags or arguments
    const otherFlags = process.argv.filter((arg, index) => {
        return arg.startsWith("-") && index !== fileFlagIndex;
    });

    if (otherFlags.length > 0) {
        console.error("Unexpected flags or arguments:", otherFlags);
        process.exit(1);
    }
    const user = os.userInfo().username;
    console.log(`Hello ${user}! This is the Monkey programming language!`);
    console.log("Feel free to type in commands");
    replStart();
})();

async function handleFileExecute(filePath: string) {
    try {
        const input = await fs.readFile(filePath, "utf-8");

        const env = Environment.new();
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        if (parser.errors.length > 0) {
            printFileParserErrors(parser.errors);
            return;
        }
        const evaluated = evalCode(program, env);

        if (!evaluated) return;
        switch (evaluated.constructor) {
            case ErrorObj:
                printFileEvalError(evaluated as ErrorObj);
                break;
            case Null:
                break;
            default:
                console.log(evaluated.inspect());
        }
    } catch (error) {
        console.error(error);
    }
}

function printFileEvalError(err: ErrorObj) {
    console.log(`Error on line ${err.line}: ${err.message}`);
}

function printFileParserErrors(errors: ParseError[]) {
    console.error("parser errors:");
    for (const error of errors) {
        console.error(`\tLine ${error.line}: ${error.message}`);
    }
}

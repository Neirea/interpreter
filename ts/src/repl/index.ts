import readline from "readline";
import { Lexer } from "../lexer";
import { ParseError, Parser } from "../parser";
import { Environment } from "../object/enviroment";
import { evalCode } from "../evaluator";
import { defineMacros, expandMacros } from "../evaluator/macro_expansion";

export function replStart() {
    const rs = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ">> ",
    });

    const env = Environment.new();
    const macroEnv = Environment.new();

    rs.prompt();

    rs.on("line", (input) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        if (parser.errors.length > 0) {
            printReplParserErrors(parser.errors);
            return;
        }
        defineMacros(program, macroEnv);
        try {
            const expanded = expandMacros(program, macroEnv);
            const evaluated = evalCode(expanded, env);
            if (evaluated !== undefined) {
                console.log(evaluated.inspect());
            }
            rs.prompt();
        } catch (error) {
            console.log(error);
        }
    });
}

function printReplParserErrors(errors: ParseError[]) {
    console.error("parser errors:");
    for (const error of errors) {
        console.error(`\t${error.message}`);
    }
}

import readline from "readline";
import { Lexer } from "../lexer";
import { ParseError, Parser } from "../parser";
import { Environment } from "../object/enviroment";
import { evalCode } from "../evaluator";

export function replStart() {
    const rs = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ">> ",
    });

    const env = Environment.new();

    rs.prompt();

    rs.on("line", (input) => {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();

        if (parser.errors.length > 0) {
            printReplParserErrors(parser.errors);
            return;
        }
        const evaluated = evalCode(program, env);
        if (evaluated !== undefined) {
            console.log(evaluated.inspect());
        }
        rs.prompt();
    });
}

function printReplParserErrors(errors: ParseError[]) {
    console.error("parser errors:");
    for (const error of errors) {
        console.error(`\t${error.message}`);
    }
}

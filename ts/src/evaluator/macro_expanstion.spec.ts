import { Program } from "../ast";
import { Lexer } from "../lexer";
import { Macro } from "../object";
import { Environment } from "../object/enviroment";
import { Parser } from "../parser";
import { defineMacros } from "./macro_expansion";

test("test define macros", () => {
    const input = `
        let number = 1;
        let function = fn(x, y) { x + y };
        let mymacro = macro(x, y) { x + y; };
    `;

    const env = Environment.new();
    const program = testParseProgram(input);

    defineMacros(program, env);

    expect(program.statements.length).toEqual(2);
    const num = env.get("number");
    expect(num).not.toBeDefined();
    const func = env.get("function");
    expect(func).not.toBeDefined();
    const myMacro = env.get("mymacro");
    expect(myMacro).toBeInstanceOf(Macro);
    const macro = myMacro as Macro;
    expect(macro.parameters.length).toEqual(2);
    expect(macro.parameters[0].toString()).toEqual("x");
    expect(macro.parameters[1].toString()).toEqual("y");

    const expectedBody = "(x + y)";
    expect(macro.body.toString()).toEqual(expectedBody);
});

function testParseProgram(input: string): Program {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    return parser.parseProgram();
}

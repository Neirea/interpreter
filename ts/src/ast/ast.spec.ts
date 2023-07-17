import { Identifier, LetStatement, Program } from ".";
import { Token, token } from "../token";

test("dummy program", () => {
    const program = new Program([
        new LetStatement(
            new Token(token.LET, "let"),
            new Identifier(new Token(token.IDENT, "myVar"), "myVar"),
            new Identifier(new Token(token.IDENT, "anotherVar"), "anotherVar")
        ),
    ]);

    const expectedResult = "let myVar = anotherVar;";
    expect(program.toString()).toEqual(expectedResult);
});

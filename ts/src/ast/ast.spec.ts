import { Identifier, LetStatement, Program } from ".";
import { Token, token } from "../token";

test("dummy program", () => {
    const program = new Program([
        new LetStatement(
            new Token(token.LET, "let", 1),
            new Identifier(new Token(token.IDENT, "myVar", 1), "myVar"),
            new Identifier(
                new Token(token.IDENT, "anotherVar", 1),
                "anotherVar"
            )
        ),
    ]);

    const expectedResult = "let myVar = anotherVar;";
    expect(program.toString()).toEqual(expectedResult);
});

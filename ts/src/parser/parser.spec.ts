import { Parser } from ".";
import {
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FloatLiteral,
    FunctionLiteral,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    ReturnStatement,
} from "../ast";
import { Lexer } from "../lexer";

test("let statements", () => {
    const tests = [
        { input: "let x1x = 5;", expectedIdentifier: "x1x", expectedValue: 5 },
        {
            input: "let y = true;",
            expectedIdentifier: "y",
            expectedValue: true,
        },
        {
            input: "let foobar = y;",
            expectedIdentifier: "foobar",
            expectedValue: "y",
        },
    ];

    for (const test of tests) {
        const lexer = new Lexer(test.input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);
        expect(program.statements.length).toEqual(1);
        const stmt = program.statements[0] as LetStatement;
        expect(stmt.tokenLiteral()).toEqual("let");
        expect(stmt).toBeInstanceOf(LetStatement);
        expect(stmt.name.value).toEqual(test.expectedIdentifier);
        expect(stmt.name.tokenLiteral()).toEqual(test.expectedIdentifier);
        testLiteralExpression(stmt.value, test.expectedValue);
    }
});

test("test return statements", () => {
    const tests = [
        { input: "return 5;", expectedValue: 5 },
        {
            input: "return true;",
            expectedValue: true,
        },
        {
            input: "return foobar;",
            expectedValue: "foobar",
        },
    ];
    for (const test of tests) {
        const lexer = new Lexer(test.input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);
        expect(program.statements.length).toEqual(1);
        const stmt = program.statements[0] as ReturnStatement;
        expect(stmt).toBeInstanceOf(ReturnStatement);
        expect(stmt.tokenLiteral()).toEqual("return");
        testLiteralExpression(stmt.returnValue, test.expectedValue);
    }
});

test("test identifier expression", () => {
    const input = "foobar;";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    const ident = stmt.expression as Identifier;
    expect(ident).toBeInstanceOf(Identifier);
    expect(ident.value).toEqual("foobar");
    expect(ident.tokenLiteral()).toEqual("foobar");
});

test("test integer literal expressiom", () => {
    const input = "5;";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    const ident = stmt.expression as IntegerLiteral;
    expect(ident).toBeInstanceOf(IntegerLiteral);
    expect(ident.value).toEqual(5);
    expect(ident.tokenLiteral()).toEqual("5");
});

test("test float literal expressiom", () => {
    const input = "5.342;";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    const ident = stmt.expression as FloatLiteral;
    expect(ident).toBeInstanceOf(FloatLiteral);
    expect(ident.value).toEqual(5.342);
    expect(ident.tokenLiteral()).toEqual("5.342");
});

test("test parsing prefix epxressions", () => {
    const prefixTests = [
        { input: "!5;", operator: "!", value: 5 },
        {
            input: "-15",
            operator: "-",
            value: 15,
        },
        {
            input: "!true;",
            operator: "!",
            value: true,
        },
        {
            input: "!false;",
            operator: "!",
            value: false,
        },
    ];

    for (const test of prefixTests) {
        const lexer = new Lexer(test.input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);
        expect(program.statements.length).toEqual(1);
        const stmt = program.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);
        const exp = stmt.expression as PrefixExpression;
        expect(exp).toBeInstanceOf(PrefixExpression);
        expect(exp.operator).toEqual(test.operator);
        testLiteralExpression(exp.right, test.value);
    }
});

test("test parsing infix expressions", () => {
    const infixTests = [
        { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
        {
            input: "5 - 5;",
            leftValue: 5,
            operator: "-",
            rightValue: 5,
        },
        {
            input: "5 * 5;",
            leftValue: 5,
            operator: "*",
            rightValue: 5,
        },
        {
            input: "5 / 5;",
            leftValue: 5,
            operator: "/",
            rightValue: 5,
        },
        {
            input: "5 > 5;",
            leftValue: 5,
            operator: ">",
            rightValue: 5,
        },
        {
            input: "5 < 5;",
            leftValue: 5,
            operator: "<",
            rightValue: 5,
        },
        {
            input: "5 == 5;",
            leftValue: 5,
            operator: "==",
            rightValue: 5,
        },
        {
            input: "5 != 5;",
            leftValue: 5,
            operator: "!=",
            rightValue: 5,
        },
        {
            input: "true == true",
            leftValue: true,
            operator: "==",
            rightValue: true,
        },
        {
            input: "true != false",
            leftValue: true,
            operator: "!=",
            rightValue: false,
        },
        {
            input: "false == false",
            leftValue: false,
            operator: "==",
            rightValue: false,
        },
    ];

    for (const test of infixTests) {
        const lexer = new Lexer(test.input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);
        expect(program.statements.length).toEqual(1);
        const stmt = program.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);
        testInfixExpression(
            stmt.expression,
            test.leftValue,
            test.operator,
            test.rightValue
        );
    }
});

test("test operator precedence parsing", () => {
    const tests = [
        { input: "-a * b", expected: "((-a) * b)" },
        {
            input: "!-a",
            expected: "(!(-a))",
        },
        {
            input: "a + b + c",
            expected: "((a + b) + c)",
        },
        {
            input: "a + b - c",
            expected: "((a + b) - c)",
        },
        {
            input: "a * b * c",
            expected: "((a * b) * c)",
        },
        {
            input: "a * b / c",
            expected: "((a * b) / c)",
        },
        {
            input: "a + b / c",
            expected: "(a + (b / c))",
        },
        {
            input: "a + b * c + d / e - f",
            expected: "(((a + (b * c)) + (d / e)) - f)",
        },
        {
            input: "3 + 4; -5 * 5",
            expected: "(3 + 4)((-5) * 5)",
        },
        {
            input: "5 > 4 == 3 < 4",
            expected: "((5 > 4) == (3 < 4))",
        },
        {
            input: "5 < 4 != 3 > 4",
            expected: "((5 < 4) != (3 > 4))",
        },
        {
            input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
            expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
        },
        {
            input: "true",
            expected: "true",
        },
        {
            input: "false",
            expected: "false",
        },
        {
            input: "3 > 5 == false",
            expected: "((3 > 5) == false)",
        },
        {
            input: "3 < 5 == true",
            expected: "((3 < 5) == true)",
        },
        {
            input: "1 + (2 + 3) + 4",
            expected: "((1 + (2 + 3)) + 4)",
        },
        {
            input: "(5 + 5) * 2",
            expected: "((5 + 5) * 2)",
        },
        {
            input: "2 / (5 + 5)",
            expected: "(2 / (5 + 5))",
        },
        {
            input: "-(5 + 5)",
            expected: "(-(5 + 5))",
        },
        {
            input: "!(true == true)",
            expected: "(!(true == true))",
        },
        {
            input: "a + add(b * c) + d",
            expected: "((a + add((b * c))) + d)",
        },
        {
            input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
            expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
        },
        {
            input: "add(a + b + c * d / f + g)",
            expected: "add((((a + b) + ((c * d) / f)) + g))",
        },
    ];

    for (const test of tests) {
        const lexer = new Lexer(test.input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);
        const actual = program.toString();
        expect(actual).toEqual(test.expected);
    }
});

test("test if expression", () => {
    const input = "if (x < y) { x }";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    const exp = stmt.expression as IfExpression;
    testInfixExpression(exp.condition, "x", "<", "y");
    expect(exp.consequence.statements.length).toEqual(1);
    const consequence = exp.consequence.statements[0] as ExpressionStatement;
    expect(consequence).toBeInstanceOf(ExpressionStatement);
    testIdentifier(consequence.expression, "x");
    expect(exp.alternative).toBeUndefined();
});

test("test if-else expression", () => {
    const input = "if (x < y) { x } else { y }";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    const exp = stmt.expression as IfExpression;
    testInfixExpression(exp.condition, "x", "<", "y");
    expect(exp.consequence.statements.length).toEqual(1);
    const consequence = exp.consequence.statements[0] as ExpressionStatement;
    expect(consequence).toBeInstanceOf(ExpressionStatement);
    testIdentifier(consequence.expression, "x");
    expect(exp.alternative?.statements.length).toEqual(1);
    const alternative = exp.alternative?.statements[0] as ExpressionStatement;
    expect(alternative).toBeInstanceOf(ExpressionStatement);
    testIdentifier(alternative.expression, "y");
});

test("test function literal parsing", () => {
    const input = "fn(x, y) { x + y; }";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    const func = stmt.expression as FunctionLiteral;
    expect(func).toBeInstanceOf(FunctionLiteral);
    expect(func.body.statements.length).toEqual(1);
    const bodyStmt = func.body.statements[0] as ExpressionStatement;
    expect(bodyStmt).toBeInstanceOf(ExpressionStatement);
    testInfixExpression(bodyStmt.expression, "x", "+", "y");
});

test("test function parameter parsing", () => {
    const tests: { input: string; expectedParams: string[] }[] = [
        { input: "fn() {};", expectedParams: [] },
        { input: "fn(x) {};", expectedParams: ["x"] },
        { input: "fn(x, y, z) {};", expectedParams: ["x", "y", "z"] },
    ];

    for (const test of tests) {
        const lexer = new Lexer(test.input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);
        const stmt = program.statements[0] as ExpressionStatement;
        const func = stmt.expression as FunctionLiteral;
        expect(func.parameters.length).toEqual(test.expectedParams.length);
        for (let i = 0; i < test.expectedParams.length; i++) {
            testLiteralExpression(func.parameters[i], test.expectedParams[i]);
        }
    }
});

test("test call expression parsing", () => {
    const input = "add(1, 2 * 3, 4 + 5);";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    const exp = stmt.expression as CallExpression;
    expect(exp).toBeInstanceOf(CallExpression);
    testIdentifier(exp.func, "add");
    expect(exp.args.length).toEqual(3);
    testLiteralExpression(exp.args[0], 1);
    testInfixExpression(exp.args[1], 2, "*", 3);
    testInfixExpression(exp.args[2], 4, "+", 5);
});

function testInfixExpression(
    exp: Expression,
    left: any,
    operator: string,
    right: any
) {
    const expr = exp as InfixExpression;
    expect(expr).toBeInstanceOf(InfixExpression);
    testLiteralExpression(expr.left, left);
    expect(expr.operator).toEqual(operator);
    testLiteralExpression(expr.right, right);
}

function testLiteralExpression(exp: Expression, expected: any) {
    const type = typeof expected;
    switch (type) {
        case "number":
            if (expected % 1) testFloatLiteral(exp, expected);
            else testIntegerLiteral(exp, expected);
            break;
        case "string":
            testIdentifier(exp, expected);
            break;
        case "boolean":
            testBooleanLiteral(exp, expected);
            break;
        default:
            fail(`type of exp not handled. got=${exp}`);
    }
}

function testIntegerLiteral(exp: Expression, value: number) {
    const il = exp as IntegerLiteral;
    expect(il.value).toEqual(value);
    expect(il.tokenLiteral()).toEqual(value.toString());
}
function testFloatLiteral(exp: Expression, value: number) {
    const il = exp as FloatLiteral;
    expect(il.value).toEqual(value);
    expect(il.tokenLiteral()).toEqual(value.toString());
}

function testIdentifier(exp: Expression, value: string) {
    const ident = exp as Identifier;
    expect(ident.value).toEqual(value);
    expect(ident.tokenLiteral()).toEqual(value);
}

function testBooleanLiteral(exp: Expression, value: boolean) {
    const bool = exp as BooleanLiteral;
    expect(bool.value).toEqual(value);
    expect(bool.tokenLiteral()).toEqual(value.toString());
}

function checkParserErrors(parser: Parser) {
    const errors = parser.errors;
    if (errors.length === 0) {
        return;
    }
    console.error(`parser has ${errors.length} errors`);
    for (const msg of errors) {
        throw new Error(`parser error: ${msg}`);
    }
}

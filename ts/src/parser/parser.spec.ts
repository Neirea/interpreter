import { Parser } from ".";
import {
    ArrayLiteral,
    AssignExpression,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FloatLiteral,
    ForStatement,
    FunctionLiteral,
    HashLiteral,
    Identifier,
    IfExpression,
    IndexExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    MacroLiteral,
    PrefixExpression,
    ReturnStatement,
    StringLiteral,
    WhileStatement,
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
            input: "-15;",
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
            input: "5 >= 5;",
            leftValue: 5,
            operator: ">=",
            rightValue: 5,
        },
        {
            input: "5 <= 5;",
            leftValue: 5,
            operator: "<=",
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
            input: "true == true;",
            leftValue: true,
            operator: "==",
            rightValue: true,
        },
        {
            input: "true != false;",
            leftValue: true,
            operator: "!=",
            rightValue: false,
        },
        {
            input: "false == false;",
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
        { input: "-a * b;", expected: "((-a) * b)" },
        {
            input: "!-a;",
            expected: "(!(-a))",
        },
        {
            input: "a + b + c;",
            expected: "((a + b) + c)",
        },
        {
            input: "a + b - c;",
            expected: "((a + b) - c)",
        },
        {
            input: "a * b * c;",
            expected: "((a * b) * c)",
        },
        {
            input: "a * b / c;",
            expected: "((a * b) / c)",
        },
        {
            input: "a + b / c;",
            expected: "(a + (b / c))",
        },
        {
            input: "a + b * c + d / e - f;",
            expected: "(((a + (b * c)) + (d / e)) - f)",
        },
        {
            input: "3 + 4; -5 * 5;",
            expected: "(3 + 4)((-5) * 5)",
        },
        {
            input: "5 > 4 == 3 < 4;",
            expected: "((5 > 4) == (3 < 4))",
        },
        {
            input: "5 < 4 != 3 > 4;",
            expected: "((5 < 4) != (3 > 4))",
        },
        {
            input: "3 + 4 * 5 == 3 * 1 + 4 * 5;",
            expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
        },
        {
            input: "true;",
            expected: "true",
        },
        {
            input: "false;",
            expected: "false",
        },
        {
            input: "3 > 5 == false;",
            expected: "((3 > 5) == false)",
        },
        {
            input: "3 < 5 == true;",
            expected: "((3 < 5) == true)",
        },
        {
            input: "1 + (2 + 3) + 4;",
            expected: "((1 + (2 + 3)) + 4)",
        },
        {
            input: "(5 + 5) * 2;",
            expected: "((5 + 5) * 2)",
        },
        {
            input: "2 / (5 + 5);",
            expected: "(2 / (5 + 5))",
        },
        {
            input: "-(5 + 5);",
            expected: "(-(5 + 5))",
        },
        {
            input: "!(true == true);",
            expected: "(!(true == true))",
        },
        {
            input: "a + add(b * c) + d;",
            expected: "((a + add((b * c))) + d)",
        },
        {
            input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8));",
            expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
        },
        {
            input: "add(a + b + c * d / f + g);",
            expected: "add((((a + b) + ((c * d) / f)) + g))",
        },
        {
            input: "a * [1, 2, 3, 4][b * c] * d;",
            expected: "((a * ([1, 2, 3, 4][(b * c)])) * d)",
        },
        {
            input: "add(a * b[2], b[1], 2 * [1, 2][1]);",
            expected: "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))",
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
    const input = "if (x < y) { x; }";
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
    const input = "if (x < y) { x; } else { y; }";
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

test("test string literal expression", () => {
    const input = '"\thello world\n";';
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).toBeInstanceOf(StringLiteral);
    const exp = stmt.expression as StringLiteral;
    expect(exp.value).toEqual("\thello world\n");
});

test("test parsing array literals", () => {
    const input = "[1, 2 * 2, 3 + 3];";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).toBeInstanceOf(ArrayLiteral);
    const array = stmt.expression as ArrayLiteral;
    expect(array.elements.length).toEqual(3);
    testIntegerLiteral(array.elements[0], 1);
    testInfixExpression(array.elements[1], 2, "*", 2);
    testInfixExpression(array.elements[2], 3, "+", 3);
});

test("test parsing index expressions", () => {
    const input = "myArray[1 + 1];";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).toBeInstanceOf(IndexExpression);
    const indexExp = stmt.expression as IndexExpression;
    testIdentifier(indexExp.left, "myArray");
    testInfixExpression(indexExp.index, 1, "+", 1);
});

test("test parsing empty hash literal", () => {
    const input = "{};";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).toBeInstanceOf(HashLiteral);
    const hash = stmt.expression as HashLiteral;
    expect(hash.pairs.size).toEqual(0);
});

test("test parsing hash literals with string keys", () => {
    const input = `{"one": 1, "two": 2, "three": 3};`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).toBeInstanceOf(HashLiteral);
    const hash = stmt.expression as HashLiteral;
    const expected = new Map([
        ["one", 1],
        ["two", 2],
        ["three", 3],
    ]);
    expect(hash.pairs.size).toEqual(expected.size);
    for (const [key, value] of hash.pairs) {
        expect(key).toBeInstanceOf(StringLiteral);
        const keyLiteral = key as StringLiteral;
        const expectedValue = expected.get(keyLiteral.toString());
        expect(expectedValue).toBeDefined();
        if (expectedValue !== undefined) {
            testIntegerLiteral(value, expectedValue);
        }
    }
});

test("test parsing hash literals with boolean keys", () => {
    const input = `{true: 1, false: 2};`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).toBeInstanceOf(HashLiteral);
    const hash = stmt.expression as HashLiteral;
    const expected = new Map([
        ["true", 1],
        ["false", 2],
    ]);
    expect(hash.pairs.size).toEqual(expected.size);
    for (const [key, value] of hash.pairs) {
        expect(key).toBeInstanceOf(BooleanLiteral);
        const keyLiteral = key as BooleanLiteral;
        const expectedValue = expected.get(keyLiteral.toString());
        expect(expectedValue).toBeDefined();
        if (expectedValue !== undefined) {
            testIntegerLiteral(value, expectedValue);
        }
    }
});

test("test parsing hash literals with number keys", () => {
    const input = `{1.2: 1, 2: 2, 3.99:3};`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).toBeInstanceOf(HashLiteral);
    const hash = stmt.expression as HashLiteral;
    const expected = new Map([
        ["1.2", 1],
        ["2", 2],
        ["3.99", 3],
    ]);
    expect(hash.pairs.size).toEqual(expected.size);
    for (const [key, value] of hash.pairs) {
        const keyLiteral = key as FloatLiteral;
        expect(keyLiteral?.value).not.toBeNaN();
        const expectedValue = expected.get(keyLiteral.toString());
        expect(expectedValue).toBeDefined();
        if (expectedValue !== undefined) {
            testIntegerLiteral(value, expectedValue);
        }
    }
});

test("test parsing hash literals with expressions", () => {
    const input = `{"one": 0 + 1, "two": 10 - 8, "three": 15 / 5};`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).toBeInstanceOf(HashLiteral);
    const hash = stmt.expression as HashLiteral;
    const expected = new Map([
        [
            "one",
            (e: Expression) => {
                testInfixExpression(e, 0, "+", 1);
            },
        ],
        [
            "two",
            (e: Expression) => {
                testInfixExpression(e, 10, "-", 8);
            },
        ],
        [
            "three",
            (e: Expression) => {
                testInfixExpression(e, 15, "/", 5);
            },
        ],
    ]);
    expect(hash.pairs.size).toEqual(expected.size);
    for (const [key, value] of hash.pairs) {
        expect(key).toBeInstanceOf(StringLiteral);
        const keyLiteral = key as StringLiteral;
        const testFunc = expected.get(keyLiteral.toString());
        expect(testFunc).toBeDefined();
        if (testFunc !== undefined) {
            testFunc(value);
        }
    }
});

test("test macro literal parsing", () => {
    const input = "macro(x, y) { x + y; };";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(1);
    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt.expression).toBeInstanceOf(MacroLiteral);
    const macro = stmt.expression as MacroLiteral;
    expect(macro.parameters.length).toEqual(2);
    testLiteralExpression(macro.parameters[0], "x");
    testLiteralExpression(macro.parameters[1], "y");
    expect(macro.body.statements.length).toEqual(1);
    expect(macro.body.statements[0]).toBeInstanceOf(ExpressionStatement);
    const macroBody = macro.body.statements[0] as ExpressionStatement;
    testInfixExpression(macroBody.expression, "x", "+", "y");
});

test("test while statement", () => {
    const input = "while (x < y) { x; }";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(1);
    expect(program.statements[0]).toBeInstanceOf(WhileStatement);
    const stmt = program.statements[0] as WhileStatement;
    testInfixExpression(stmt.condition, "x", "<", "y");
    expect(stmt.body.statements.length).toEqual(1);
    expect(stmt.body.statements[0]).toBeInstanceOf(ExpressionStatement);
    const body = stmt.body.statements[0] as ExpressionStatement;
    testIdentifier(body.expression, "x");
});

test("test assignment statements", () => {
    const tests = [
        { input: "x1x = 3;", expectedIdentifier: "x1x", expectedValue: 3 },
        { input: "y = false;", expectedIdentifier: "y", expectedValue: false },
        {
            input: "foobar = x;",
            expectedIdentifier: "foobar",
            expectedValue: "x",
        },
    ];

    for (const test of tests) {
        const lexer = new Lexer(test.input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        checkParserErrors(parser);
        expect(program.statements.length).toEqual(1);
        expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
        const stmt = program.statements[0] as ExpressionStatement;
        expect(stmt.expression).toBeInstanceOf(AssignExpression);
        const assignExpr = stmt.expression as AssignExpression;
        expect(assignExpr.name.value).toEqual(test.expectedIdentifier);
        expect(assignExpr.name.tokenLiteral()).toEqual(test.expectedIdentifier);
        const value = assignExpr.value;
        testLiteralExpression(value, test.expectedValue);
    }
});

test("test for statement", () => {
    const input = "let i = 0; for(i = 0; i < 3; i = 5) { i; }";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(2);
    expect(program.statements[1]).toBeInstanceOf(ForStatement);
    const stmt = program.statements[1] as ForStatement;
    expect(stmt.init).toBeInstanceOf(AssignExpression);
    testLiteralExpression((stmt.init as AssignExpression).value, 0);
    testInfixExpression(stmt.condition, "i", "<", 3);
    expect(stmt.update).toBeInstanceOf(AssignExpression);
    testLiteralExpression((stmt.update as AssignExpression).value, 5);
    expect(stmt.body.statements.length).toEqual(1);
    expect(stmt.body.statements[0]).toBeInstanceOf(ExpressionStatement);
    const bodyStmt = stmt.body.statements[0] as ExpressionStatement;
    testIdentifier(bodyStmt.expression, "i");
});

test("test empty for statement", () => {
    const input = "let i = 0; for(; i < 3;) { i; }";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(parser);
    expect(program.statements.length).toEqual(2);
    expect(program.statements[1]).toBeInstanceOf(ForStatement);
    const stmt = program.statements[1] as ForStatement;
    expect(stmt.init).not.toBeDefined();
    testInfixExpression(stmt.condition, "i", "<", 3);
    expect(stmt.update).not.toBeDefined();
    expect(stmt.body.statements.length).toEqual(1);
    expect(stmt.body.statements[0]).toBeInstanceOf(ExpressionStatement);
    const bodyStmt = stmt.body.statements[0] as ExpressionStatement;
    testIdentifier(bodyStmt.expression, "i");
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
    for (const error of errors) {
        throw new Error(`parser error: ${error.message}`);
    }
}

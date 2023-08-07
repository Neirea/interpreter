import { NULL, evalCode } from ".";
import { Lexer } from "../lexer";
import {
    Bool,
    ErrorObj,
    Float,
    FunctionObj,
    IObject,
    Integer,
    StringObj,
} from "../object";
import { Environment } from "../object/enviroment";
import { Parser } from "../parser";

function testEval(input: string): IObject | null {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const env = Environment.new();
    return evalCode(program, env);
}

test("test evaluating integer expressions", () => {
    const tests = [
        { input: "5", expected: 5 },
        { input: "10", expected: 10 },
        { input: "-5", expected: -5 },
        { input: "-10", expected: -10 },
        { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
        { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
        { input: "-50 + 100 + -50", expected: 0 },
        { input: "5 * 2 + 10", expected: 20 },
        { input: "5 + 2 * 10", expected: 25 },
        { input: "20 + 2 * -10", expected: 0 },
        { input: "50 / 2 * 2 + 10", expected: 60 },
        { input: "2 * (5 + 10)", expected: 30 },
        { input: "3 * 3 * 3 + 10", expected: 37 },
        { input: "3 * (3 * 3) + 10", expected: 37 },
        { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    }
});

function testIntegerObject(obj: IObject | null, expected: number) {
    expect(obj).toBeInstanceOf(Integer);
    const integerObj = obj as Integer;
    expect(integerObj.value).toEqual(expected);
}

test("test evaluating float expressions", () => {
    const tests = [
        { input: "5.31", expected: 5.31 },
        { input: "10.54", expected: 10.54 },
        { input: "-5.04", expected: -5.04 },
        { input: "-10.99", expected: -10.99 },
        { input: "5 + 5.1 + 5 + 5.9 - 10", expected: 11 },
        { input: "2 * 2.2 * 2 * 2 * 2", expected: 35.2 },
        { input: "50 / 2.5 * 2 + 10", expected: 50 },
        { input: "2 * (5 + 10.5)", expected: 31 },
        { input: "3 * (3 * 3) + 10.54", expected: 37.54 },
        { input: "(5 + 10.5 * 2 + 15 / 3) * 2 + -10", expected: 52 },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testFloatObject(evaluated, test.expected);
    }
});

function testFloatObject(obj: IObject | null, expected: number) {
    expect(obj).toBeInstanceOf(Float);
    const floatObj = obj as Float;
    expect(floatObj.value).toEqual(expected);
}

test("test evaluating boolean expressions", () => {
    const tests = [
        { input: "true", expected: true },
        { input: "false", expected: false },
        { input: "1 < 2", expected: true },
        { input: "1 > 2", expected: false },
        { input: "1 < 1", expected: false },
        { input: "1 > 1", expected: false },
        { input: "1 == 1", expected: true },
        { input: "1 != 1", expected: false },
        { input: "1 == 2", expected: false },
        { input: "1 != 2", expected: true },
        { input: "true == true", expected: true },
        { input: "false == false", expected: true },
        { input: "true == false", expected: false },
        { input: "true != false", expected: true },
        { input: "false != true", expected: true },
        { input: "(1 < 2) == true", expected: true },
        { input: "(1 < 2) == false", expected: false },
        { input: "(1 > 2) == true", expected: false },
        { input: "(1 > 2) == false", expected: true },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testBooleanObject(evaluated, test.expected);
    }
});

function testBooleanObject(obj: IObject | null, expected: boolean) {
    expect(obj).toBeInstanceOf(Bool);
    const bool = obj as Bool;
    expect(bool.value).toEqual(expected);
}

test("test bang(!) operator", () => {
    const tests = [
        { input: "!true", expected: false },
        { input: "!false", expected: true },
        { input: "!5", expected: false },
        { input: "!!true", expected: true },
        { input: "!!false", expected: false },
        { input: "!!5", expected: true },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testBooleanObject(evaluated, test.expected);
    }
});

test("test if/else expressions", () => {
    const tests = [
        { input: "if (true) { 10 }", expected: 10 },
        { input: "if (false) { 10 }", expected: undefined },
        { input: "if (1) { 10 }", expected: 10 },
        { input: "if (1 < 2) { 10 }", expected: 10 },
        { input: "if (1 > 2) { 10 }", expected: undefined },
        { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
        { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
    ];
    for (const test of tests) {
        const evaluated = testEval(test.input);
        if (test.expected) {
            testIntegerObject(evaluated, +test.expected);
        } else {
            testNullObject(evaluated);
        }
    }
});

function testNullObject(obj: IObject | null) {
    expect(obj).toEqual(NULL);
}

test("test return statements", () => {
    const tests = [
        { input: "return 10;", expected: 10 },
        { input: "return 10; 9;", expected: 10 },
        { input: "return 2 * 5; 9;", expected: 10 },
        { input: "9; return 2 * 5; 9;", expected: 10 },
        {
            input: `
			if (10 > 1) {
				if (10 > 1) {
					return 10;
				}
				return 1;
			}
			`,
            expected: 10,
        },
    ];
    for (const test of tests) {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    }
});

test("test error handling", () => {
    const tests = [
        {
            input: "5 + true;",
            expected: "type mismatch: INTEGER + BOOLEAN",
        },
        {
            input: "5 + true; 5;",
            expected: "type mismatch: INTEGER + BOOLEAN",
        },
        {
            input: "-true",
            expected: "unknown operator: -BOOLEAN",
        },
        {
            input: "true + false;",
            expected: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "5; true + false; 5",
            expected: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "if (10 > 1) { true + false; }",
            expected: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: `
			if (10 > 1) {
				if (10 > 1) {
					return true + false;
				}
				return 1;
			}
			`,
            expected: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "foobar",
            expected: "identifier not found: foobar",
        },
        {
            input: `"Hello" - "World"`,
            expected: "unknown operator: STRING - STRING",
        },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        expect(evaluated).toBeInstanceOf(ErrorObj);
        const error = evaluated as ErrorObj;
        expect(error.message).toEqual(test.expected);
    }
});

test("test let statements", () => {
    const tests = [
        { input: "let a = 5; a;", expected: 5 },
        { input: "let a = 5 * 5; a;", expected: 25 },
        { input: "let a = 5; let b = a; b;", expected: 5 },
        { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 },
    ];
    for (const test of tests) {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    }
});

test("test function object", () => {
    const input = "fn(x) { x + 2; };";
    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(FunctionObj);
    const functionObj = evaluated as FunctionObj;
    expect(functionObj.parameters.length).toEqual(1);
    expect(functionObj.parameters[0].toString()).toEqual("x");
    expect(functionObj.body.toString()).toEqual("(x + 2)");
});

test("test function application", () => {
    const tests = [
        { input: "let identity = fn(x) { x; }; identity(5);", expected: 5 },
        {
            input: "let identity = fn(x) { return x; }; identity(5);",
            expected: 5,
        },
        { input: "let double = fn(x) { x * 2; }; double(5);", expected: 10 },
        { input: "let add = fn(x, y) { x + y; }; add(5, 5);", expected: 10 },
        {
            input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));",
            expected: 20,
        },
        { input: "fn(x) { x; }(5)", expected: 5 },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    }
});

test("test closures", () => {
    const input = `
        let newAdder = fn(x) {
            fn(y) { x + y };
        };
        let addTwo = newAdder(2);
        addTwo(2);
    `;
    const evaluated = testEval(input);
    testIntegerObject(evaluated, 4);
});

test("test string literals", () => {
    const input = '"Hello World!"';
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(StringObj);
    const str = evaluated as StringObj;
    expect(str.value).toEqual("Hello World!");
});

test("test string concatenation", () => {
    const input = '"Hello" + " " + "World!"';
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(StringObj);
    const str = evaluated as StringObj;
    expect(str.value).toEqual("Hello World!");
});

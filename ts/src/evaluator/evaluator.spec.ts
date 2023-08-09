import { FALSE, NULL, TRUE, evalCode } from ".";
import { Lexer } from "../lexer";
import {
    ArrayObj,
    Bool,
    ErrorObj,
    Float,
    FunctionObj,
    HashObj,
    IObject,
    Integer,
    StringObj,
} from "../object";
import { Environment } from "../object/enviroment";
import { Parser } from "../parser";

function testEval(input: string): IObject | undefined {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const env = Environment.new();
    return evalCode(program, env);
}

test("test evaluating integer expressions", () => {
    const tests = [
        { input: "5;", expected: 5 },
        { input: "10;", expected: 10 },
        { input: "-5;", expected: -5 },
        { input: "-10;", expected: -10 },
        { input: "5 + 5 + 5 + 5 - 10;", expected: 10 },
        { input: "2 * 2 * 2 * 2 * 2;", expected: 32 },
        { input: "-50 + 100 + -50;", expected: 0 },
        { input: "5 * 2 + 10;", expected: 20 },
        { input: "5 + 2 * 10;", expected: 25 },
        { input: "20 + 2 * -10;", expected: 0 },
        { input: "50 / 2 * 2 + 10;", expected: 60 },
        { input: "2 * (5 + 10);", expected: 30 },
        { input: "3 * 3 * 3 + 10;", expected: 37 },
        { input: "3 * (3 * 3) + 10;", expected: 37 },
        { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10;", expected: 50 },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    }
});

function testIntegerObject(obj: IObject | undefined, expected: number) {
    expect(obj).toBeInstanceOf(Integer);
    const integerObj = obj as Integer;
    expect(integerObj.value).toEqual(expected);
}

test("test evaluating float expressions", () => {
    const tests = [
        { input: "5.31;", expected: 5.31 },
        { input: "10.54;", expected: 10.54 },
        { input: "-5.04;", expected: -5.04 },
        { input: "-10.99;", expected: -10.99 },
        { input: "5 + 5.1 + 5 + 5.9 - 10;", expected: 11 },
        { input: "2 * 2.2 * 2 * 2 * 2;", expected: 35.2 },
        { input: "50 / 2.5 * 2 + 10;", expected: 50 },
        { input: "2 * (5 + 10.5);", expected: 31 },
        { input: "3 * (3 * 3) + 10.54;", expected: 37.54 },
        { input: "(5 + 10.5 * 2 + 15 / 3) * 2 + -10;", expected: 52 },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testFloatObject(evaluated, test.expected);
    }
});

function testFloatObject(obj: IObject | undefined, expected: number) {
    expect(obj).toBeInstanceOf(Float);
    const floatObj = obj as Float;
    expect(floatObj.value).toEqual(expected);
}

test("test evaluating boolean expressions", () => {
    const tests = [
        { input: "true;", expected: true },
        { input: "false;", expected: false },
        { input: "1 < 2;", expected: true },
        { input: "1 > 2;", expected: false },
        { input: "1 < 1;", expected: false },
        { input: "1 > 1;", expected: false },
        { input: "1 == 1;", expected: true },
        { input: "1 != 1;", expected: false },
        { input: "1 == 2;", expected: false },
        { input: "1 != 2;", expected: true },
        { input: "true == true;", expected: true },
        { input: "false == false;", expected: true },
        { input: "true == false;", expected: false },
        { input: "true != false;", expected: true },
        { input: "false != true;", expected: true },
        { input: "(1 < 2) == true;", expected: true },
        { input: "(1 < 2) == false;", expected: false },
        { input: "(1 > 2) == true;", expected: false },
        { input: "(1 > 2) == false;", expected: true },
        { input: "(1 <= 1) == true;", expected: true },
        { input: "(1 <= 2) == true;", expected: true },
        { input: "(2 <= 1) == false;", expected: true },
        { input: "(1 >= 1) == true;", expected: true },
        { input: "(1 >= 2) == false;", expected: true },
        { input: "(2 >= 1) == true;", expected: true },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testBooleanObject(evaluated, test.expected);
    }
});

function testBooleanObject(obj: IObject | undefined, expected: boolean) {
    expect(obj).toBeInstanceOf(Bool);
    const bool = obj as Bool;
    expect(bool.value).toEqual(expected);
}

test("test bang(!) operator", () => {
    const tests = [
        { input: "!true;", expected: false },
        { input: "!false;", expected: true },
        { input: "!5;", expected: false },
        { input: "!!true;", expected: true },
        { input: "!!false;", expected: false },
        { input: "!!5;", expected: true },
        { input: "!0;", expected: true },
        { input: "!0.0;", expected: true },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testBooleanObject(evaluated, test.expected);
    }
});

test("test if/else expressions", () => {
    const tests = [
        { input: "if (true) { 10; }", expected: 10 },
        { input: "if (false) { 10; }", expected: undefined },
        { input: "if (1) { 10; }", expected: 10 },
        { input: "if (1 < 2) { 10; }", expected: 10 },
        { input: "if (1 > 2) { 10; }", expected: undefined },
        { input: "if (1 > 2) { 10; } else { 20; }", expected: 20 },
        { input: "if (1 < 2) { 10; } else { 20; }", expected: 10 },
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

function testNullObject(obj: IObject | undefined) {
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
            input: "-true;",
            expected: "unknown operator: -BOOLEAN",
        },
        {
            input: "true + false;",
            expected: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "5; true + false; 5;",
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
            input: "foobar;",
            expected: "identifier not found: foobar",
        },
        {
            input: `"Hello" - "World";`,
            expected: "unknown operator: STRING - STRING",
        },
        {
            input: `{"name": "Monkey"}[fn(x) { x }];`,
            expected: "unusable as hash key: FUNCTION",
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
        { input: "fn(x) { x; }(5);", expected: 5 },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    }
});

test("test closures", () => {
    const input = `
        let newAdder = fn(x) {
            fn(y) { x + y; };
        };
        let addTwo = newAdder(2);
        addTwo(2);
    `;
    const evaluated = testEval(input);
    testIntegerObject(evaluated, 4);
});

test("test string literals", () => {
    const input = '"Hello World!";';
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(StringObj);
    const str = evaluated as StringObj;
    expect(str.value).toEqual("Hello World!");
});

test("test string concatenation", () => {
    const input = '"Hello" + " " + "World!";';
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(StringObj);
    const str = evaluated as StringObj;
    expect(str.value).toEqual("Hello World!");
});

test("test builtin functions", () => {
    const tests = [
        { input: `len("");`, expected: 0 },
        { input: `len("four");`, expected: 4 },
        { input: `len("hello world");`, expected: 11 },
        {
            input: `len(1);`,
            expected: "argument to `len` not supported, got INTEGER",
        },
        {
            input: `len("one", "two");`,
            expected: "wrong number of arguments. got=2, want=1",
        },
    ];
    for (const test of tests) {
        const evaluated = testEval(test.input);
        if (typeof test.expected === "number") {
            testIntegerObject(evaluated, test.expected);
        } else if (typeof test.expected === "string") {
            expect(evaluated).toBeInstanceOf(ErrorObj);
            const errObj = evaluated as ErrorObj;
            expect(errObj.message).toEqual(test.expected);
        }
    }
});

test("test array ltierals", () => {
    const input = "[1, 2 * 2, 3 + 3];";
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(ArrayObj);
});

test("test array index expressions", () => {
    const tests = [
        {
            input: "[1, 2, 3][0];",
            expected: 1,
        },
        {
            input: "[1, 2, 3][1];",
            expected: 2,
        },
        {
            input: "[1, 2, 3][2];",
            expected: 3,
        },
        {
            input: "let i = 0; [1][i];",
            expected: 1,
        },
        {
            input: "[1, 2, 3][1 + 1];",
            expected: 3,
        },
        {
            input: "let myArray = [1, 2, 3]; myArray[2];",
            expected: 3,
        },
        {
            input: "let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];",
            expected: 6,
        },
        {
            input: "let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i];",
            expected: 2,
        },
        {
            input: "[1, 2, 3][3];",
            expected: null,
        },
        {
            input: "[1, 2, 3][-1];",
            expected: null,
        },
    ];
    for (const test of tests) {
        const evaluated = testEval(test.input);
        if (test.expected !== null) {
            testIntegerObject(evaluated, test.expected);
        } else {
            testNullObject(evaluated);
        }
    }
});

test("test hash literals", () => {
    const input = `let two = "two";
	{
		"one": 10 - 9,
		two: 1 + 1,
		"thr" + "ee": 6 / 2,
		4: 4,
		true: 5,
		false: 6
	};`;

    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(HashObj);
    const hash = evaluated as HashObj;

    const expected = new Map([
        [new StringObj("one").hashKey(), 1],
        [new StringObj("two").hashKey(), 2],
        [new StringObj("three").hashKey(), 3],
        [new Integer(4).hashKey(), 4],
        [TRUE.hashKey(), 5],
        [FALSE.hashKey(), 6],
    ]);

    expect(hash.pairs.size).toEqual(expected.size);

    for (const [expectedKey, expectedValue] of expected) {
        const pair = hash.pairs.get(expectedKey);
        expect(pair).toBeDefined();
        if (pair !== undefined) {
            testIntegerObject(pair.value, expectedValue);
        }
    }
});

test("test hash index expressions", () => {
    const tests = [
        {
            input: `{"foo": 5}["foo"];`,
            expected: 5,
        },
        {
            input: `{"foo": 5}["bar"];`,
            expected: undefined,
        },
        {
            input: `let key = "foo"; {"foo": 5}[key];`,
            expected: 5,
        },
        {
            input: `{}["foo"];`,
            expected: undefined,
        },
        {
            input: `{5: 5}[5];`,
            expected: 5,
        },
        {
            input: `{true: 5}[true];`,
            expected: 5,
        },
        {
            input: `{false: 5}[false];`,
            expected: 5,
        },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        if (typeof test.expected === "number") {
            testIntegerObject(evaluated, test.expected);
        } else {
            testNullObject(evaluated);
        }
    }
});

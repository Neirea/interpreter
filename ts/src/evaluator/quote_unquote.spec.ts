import { Quote } from "../object";
import { testEval } from "./evaluator.spec";

test("test quote", () => {
    const tests = [
        {
            input: `quote(5.1);`,
            expected: `5.1`,
        },
        {
            input: `quote(5 + 8.3);`,
            expected: `(5 + 8.3)`,
        },
        {
            input: `quote(foobar);`,
            expected: `foobar`,
        },
        {
            input: `quote(foobar + barfoo);`,
            expected: `(foobar + barfoo)`,
        },
        {
            input: `let foobar = 8;
            quote(foobar);`,
            expected: `foobar`,
        },
        {
            input: `let foobar = 8;
            quote(unquote(foobar));`,
            expected: `8`,
        },
        {
            input: `quote(unquote(true));`,
            expected: `true`,
        },
        {
            input: `quote(unquote(true == false));`,
            expected: `false`,
        },
        {
            input: `quote(unquote(quote(4.4 + 4)));`,
            expected: `(4.4 + 4)`,
        },
        {
            input: `let quotedInfixExpression = quote(4 + 4);
            quote(unquote(4 + 4) + unquote(quotedInfixExpression));`,
            expected: `(8 + (4 + 4))`,
        },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        expect(evaluated).toBeInstanceOf(Quote);
        const quote = evaluated as Quote;

        expect(quote.node).toBeDefined();
        expect(quote.node.toString()).toEqual(test.expected);
    }
});

test("test quoute unquote", () => {
    const tests = [
        {
            input: `quote(unquote(4));`,
            expected: `4`,
        },
        {
            input: `quote(unquote(4 + 4));`,
            expected: `8`,
        },
        {
            input: `quote(8 + unquote(4 + 4));`,
            expected: `(8 + 8)`,
        },
        {
            input: `quote(unquote(4 + 4) + 8);`,
            expected: `(8 + 8)`,
        },
    ];

    for (const test of tests) {
        const evaluated = testEval(test.input);
        expect(evaluated).toBeInstanceOf(Quote);
        const quote = evaluated as Quote;

        expect(quote.node).toBeDefined();
        expect(quote.node.toString()).toEqual(test.expected);
    }
});

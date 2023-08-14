import {
    ArrayLiteral,
    BlockStatement,
    ExpressionStatement,
    FunctionLiteral,
    HashLiteral,
    INode,
    Identifier,
    IfExpression,
    IndexExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
} from ".";
import { Token } from "../token";
import { modify } from "./modify";

test("test modify", () => {
    const tkn = new Token("", "", 0);
    const one = () => new IntegerLiteral(tkn, 1);
    const two = () => new IntegerLiteral(tkn, 2);

    const turnOneIntoTwo: (node: INode | undefined) => INode | undefined = (
        node
    ) => {
        if (!(node instanceof IntegerLiteral)) return node;
        const integer = node as IntegerLiteral;
        if (integer.value !== 1) return node;
        integer.value = 2;
        return integer;
    };

    const tests = [
        {
            input: one(),
            expected: two(),
        },
        {
            input: new Program([new ExpressionStatement(tkn, one())]),
            expected: new Program([new ExpressionStatement(tkn, two())]),
        },
        {
            input: new InfixExpression(tkn, one(), "+", two()),
            expected: new InfixExpression(tkn, two(), "+", two()),
        },
        {
            input: new InfixExpression(tkn, two(), "+", one()),
            expected: new InfixExpression(tkn, two(), "+", two()),
        },
        {
            input: new PrefixExpression(tkn, "-", one()),
            expected: new PrefixExpression(tkn, "-", two()),
        },
        {
            input: new IndexExpression(tkn, one(), one()),
            expected: new IndexExpression(tkn, two(), two()),
        },
        {
            input: new IfExpression(
                tkn,
                one(),
                new BlockStatement(tkn, [new ExpressionStatement(tkn, one())]),
                new BlockStatement(tkn, [new ExpressionStatement(tkn, one())])
            ),
            expected: new IfExpression(
                tkn,
                two(),
                new BlockStatement(tkn, [new ExpressionStatement(tkn, two())]),
                new BlockStatement(tkn, [new ExpressionStatement(tkn, two())])
            ),
        },
        {
            input: new ReturnStatement(tkn, one()),
            expected: new ReturnStatement(tkn, two()),
        },
        {
            input: new LetStatement(tkn, new Identifier(tkn, ""), one()),
            expected: new LetStatement(tkn, new Identifier(tkn, ""), two()),
        },
        {
            input: new FunctionLiteral(
                tkn,
                [],
                new BlockStatement(tkn, [new ExpressionStatement(tkn, one())])
            ),
            expected: new FunctionLiteral(
                tkn,
                [],
                new BlockStatement(tkn, [new ExpressionStatement(tkn, two())])
            ),
        },
        {
            input: new ArrayLiteral(tkn, [one(), one()]),
            expected: new ArrayLiteral(tkn, [two(), two()]),
        },
    ];

    for (const test of tests) {
        const modified = modify(test.input, turnOneIntoTwo);

        expect(modified).toEqual(test.expected);
    }
    const pairs = new Map([
        [one(), one()],
        [one(), one()],
    ]);
    const hashLiteral = new HashLiteral(tkn, pairs);

    modify(hashLiteral, turnOneIntoTwo);

    for (const [key, value] of hashLiteral.pairs) {
        expect(key).toBeInstanceOf(IntegerLiteral);
        const keyValue = (key as IntegerLiteral).value;
        expect(keyValue).toEqual(2);
        expect(value).toBeInstanceOf(IntegerLiteral);
        const val = (key as IntegerLiteral).value;
        expect(val).toEqual(2);
    }
});

import { Token, token } from "../token";
import { Lexer } from ".";

test("test lexer", () => {
    const input = `let five = 5;
		let ten = 10;

		let add = fn(x, y) {
			x + y;
		};

		let result = add(five, ten);
		!-/*5;
		5 < 10 > 5;
        5 <= 10 >= 5;

		if (5 < 10.52) {
			return true;
		} else {
			return false;
		}

		10 == 10;
		10 != 9;
        "foobar"
        "foo bar"
        [1, 2];
        {"foo": "bar"}
        macro(x, y) { x + y; };
        while(true) { x + y; }
	`;
    const tests: Token[] = [
        { type: token.LET, literal: "let", line: 1 },
        { type: token.IDENT, literal: "five", line: 1 },
        { type: token.ASSIGN, literal: "=", line: 1 },
        { type: token.INT, literal: "5", line: 1 },
        { type: token.SEMICOLON, literal: ";", line: 1 },
        { type: token.LET, literal: "let", line: 2 },
        { type: token.IDENT, literal: "ten", line: 2 },
        { type: token.ASSIGN, literal: "=", line: 2 },
        { type: token.INT, literal: "10", line: 2 },
        { type: token.SEMICOLON, literal: ";", line: 2 },
        { type: token.LET, literal: "let", line: 4 },
        { type: token.IDENT, literal: "add", line: 4 },
        { type: token.ASSIGN, literal: "=", line: 4 },
        { type: token.FUNCTION, literal: "fn", line: 4 },
        { type: token.LPAREN, literal: "(", line: 4 },
        { type: token.IDENT, literal: "x", line: 4 },
        { type: token.COMMA, literal: ",", line: 4 },
        { type: token.IDENT, literal: "y", line: 4 },
        { type: token.RPAREN, literal: ")", line: 4 },
        { type: token.LBRACE, literal: "{", line: 4 },
        { type: token.IDENT, literal: "x", line: 5 },
        { type: token.PLUS, literal: "+", line: 5 },
        { type: token.IDENT, literal: "y", line: 5 },
        { type: token.SEMICOLON, literal: ";", line: 5 },
        { type: token.RBRACE, literal: "}", line: 6 },
        { type: token.SEMICOLON, literal: ";", line: 6 },
        { type: token.LET, literal: "let", line: 8 },
        { type: token.IDENT, literal: "result", line: 8 },
        { type: token.ASSIGN, literal: "=", line: 8 },
        { type: token.IDENT, literal: "add", line: 8 },
        { type: token.LPAREN, literal: "(", line: 8 },
        { type: token.IDENT, literal: "five", line: 8 },
        { type: token.COMMA, literal: ",", line: 8 },
        { type: token.IDENT, literal: "ten", line: 8 },
        { type: token.RPAREN, literal: ")", line: 8 },
        { type: token.SEMICOLON, literal: ";", line: 8 },
        { type: token.BANG, literal: "!", line: 9 },
        { type: token.MINUS, literal: "-", line: 9 },
        { type: token.SLASH, literal: "/", line: 9 },
        { type: token.ASTERISK, literal: "*", line: 9 },
        { type: token.INT, literal: "5", line: 9 },
        { type: token.SEMICOLON, literal: ";", line: 9 },
        { type: token.INT, literal: "5", line: 10 },
        { type: token.LT, literal: "<", line: 10 },
        { type: token.INT, literal: "10", line: 10 },
        { type: token.GT, literal: ">", line: 10 },
        { type: token.INT, literal: "5", line: 10 },
        { type: token.SEMICOLON, literal: ";", line: 10 },
        { type: token.INT, literal: "5", line: 11 },
        { type: token.LTE, literal: "<=", line: 11 },
        { type: token.INT, literal: "10", line: 11 },
        { type: token.GTE, literal: ">=", line: 11 },
        { type: token.INT, literal: "5", line: 11 },
        { type: token.SEMICOLON, literal: ";", line: 11 },
        { type: token.IF, literal: "if", line: 13 },
        { type: token.LPAREN, literal: "(", line: 13 },
        { type: token.INT, literal: "5", line: 13 },
        { type: token.LT, literal: "<", line: 13 },
        { type: token.FLOAT, literal: "10.52", line: 13 },
        { type: token.RPAREN, literal: ")", line: 13 },
        { type: token.LBRACE, literal: "{", line: 13 },
        { type: token.RETURN, literal: "return", line: 14 },
        { type: token.TRUE, literal: "true", line: 14 },
        { type: token.SEMICOLON, literal: ";", line: 14 },
        { type: token.RBRACE, literal: "}", line: 15 },
        { type: token.ELSE, literal: "else", line: 15 },
        { type: token.LBRACE, literal: "{", line: 15 },
        { type: token.RETURN, literal: "return", line: 16 },
        { type: token.FALSE, literal: "false", line: 16 },
        { type: token.SEMICOLON, literal: ";", line: 16 },
        { type: token.RBRACE, literal: "}", line: 17 },
        { type: token.INT, literal: "10", line: 19 },
        { type: token.EQ, literal: "==", line: 19 },
        { type: token.INT, literal: "10", line: 19 },
        { type: token.SEMICOLON, literal: ";", line: 19 },
        { type: token.INT, literal: "10", line: 20 },
        { type: token.NOT_EQ, literal: "!=", line: 20 },
        { type: token.INT, literal: "9", line: 20 },
        { type: token.SEMICOLON, literal: ";", line: 20 },
        { type: token.STRING, literal: "foobar", line: 21 },
        { type: token.STRING, literal: "foo bar", line: 22 },
        { type: token.LBRACKET, literal: "[", line: 23 },
        { type: token.INT, literal: "1", line: 23 },
        { type: token.COMMA, literal: ",", line: 23 },
        { type: token.INT, literal: "2", line: 23 },
        { type: token.RBRACKET, literal: "]", line: 23 },
        { type: token.SEMICOLON, literal: ";", line: 23 },
        { type: token.LBRACE, literal: "{", line: 24 },
        { type: token.STRING, literal: "foo", line: 24 },
        { type: token.COLON, literal: ":", line: 24 },
        { type: token.STRING, literal: "bar", line: 24 },
        { type: token.RBRACE, literal: "}", line: 24 },
        { type: token.MACRO, literal: "macro", line: 25 },
        { type: token.LPAREN, literal: "(", line: 25 },
        { type: token.IDENT, literal: "x", line: 25 },
        { type: token.COMMA, literal: ",", line: 25 },
        { type: token.IDENT, literal: "y", line: 25 },
        { type: token.RPAREN, literal: ")", line: 25 },
        { type: token.LBRACE, literal: "{", line: 25 },
        { type: token.IDENT, literal: "x", line: 25 },
        { type: token.PLUS, literal: "+", line: 25 },
        { type: token.IDENT, literal: "y", line: 25 },
        { type: token.SEMICOLON, literal: ";", line: 25 },
        { type: token.RBRACE, literal: "}", line: 25 },
        { type: token.SEMICOLON, literal: ";", line: 25 },
        { type: token.WHILE, literal: "while", line: 26 },
        { type: token.LPAREN, literal: "(", line: 26 },
        { type: token.TRUE, literal: "true", line: 26 },
        { type: token.RPAREN, literal: ")", line: 26 },
        { type: token.LBRACE, literal: "{", line: 26 },
        { type: token.IDENT, literal: "x", line: 26 },
        { type: token.PLUS, literal: "+", line: 26 },
        { type: token.IDENT, literal: "y", line: 26 },
        { type: token.SEMICOLON, literal: ";", line: 26 },
        { type: token.RBRACE, literal: "}", line: 26 },
        { type: token.EOF, literal: "EOF", line: 27 },
    ];

    const lexer = new Lexer(input);

    for (const token of tests) {
        const nextToken = lexer.nextToken();
        expect(nextToken).toEqual(token);
    }
});

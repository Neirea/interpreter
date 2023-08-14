package lexer

import (
	"lang/token"
	"testing"
)

func TestNextToken(t *testing.T) {
	input := `let five = 5;
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
	`
	tests := []struct {
		expectedType    token.TokenType
		expectedLiteral string
		expectedLine    int
	}{
		{token.LET, "let", 1},
		{token.IDENT, "five", 1},
		{token.ASSIGN, "=", 1},
		{token.INT, "5", 1},
		{token.SEMICOLON, ";", 1},
		{token.LET, "let", 2},
		{token.IDENT, "ten", 2},
		{token.ASSIGN, "=", 2},
		{token.INT, "10", 2},
		{token.SEMICOLON, ";", 2},
		{token.LET, "let", 4},
		{token.IDENT, "add", 4},
		{token.ASSIGN, "=", 4},
		{token.FUNCTION, "fn", 4},
		{token.LPAREN, "(", 4},
		{token.IDENT, "x", 4},
		{token.COMMA, ",", 4},
		{token.IDENT, "y", 4},
		{token.RPAREN, ")", 4},
		{token.LBRACE, "{", 4},
		{token.IDENT, "x", 5},
		{token.PLUS, "+", 5},
		{token.IDENT, "y", 5},
		{token.SEMICOLON, ";", 5},
		{token.RBRACE, "}", 6},
		{token.SEMICOLON, ";", 6},
		{token.LET, "let", 8},
		{token.IDENT, "result", 8},
		{token.ASSIGN, "=", 8},
		{token.IDENT, "add", 8},
		{token.LPAREN, "(", 8},
		{token.IDENT, "five", 8},
		{token.COMMA, ",", 8},
		{token.IDENT, "ten", 8},
		{token.RPAREN, ")", 8},
		{token.SEMICOLON, ";", 8},
		{token.BANG, "!", 9},
		{token.MINUS, "-", 9},
		{token.SLASH, "/", 9},
		{token.ASTERISK, "*", 9},
		{token.INT, "5", 9},
		{token.SEMICOLON, ";", 9},
		{token.INT, "5", 10},
		{token.LT, "<", 10},
		{token.INT, "10", 10},
		{token.GT, ">", 10},
		{token.INT, "5", 10},
		{token.SEMICOLON, ";", 10},
		{token.INT, "5", 11},
		{token.LTE, "<=", 11},
		{token.INT, "10", 11},
		{token.GTE, ">=", 11},
		{token.INT, "5", 11},
		{token.SEMICOLON, ";", 11},
		{token.IF, "if", 13},
		{token.LPAREN, "(", 13},
		{token.INT, "5", 13},
		{token.LT, "<", 13},
		{token.FLOAT, "10.52", 13},
		{token.RPAREN, ")", 13},
		{token.LBRACE, "{", 13},
		{token.RETURN, "return", 14},
		{token.TRUE, "true", 14},
		{token.SEMICOLON, ";", 14},
		{token.RBRACE, "}", 15},
		{token.ELSE, "else", 15},
		{token.LBRACE, "{", 15},
		{token.RETURN, "return", 16},
		{token.FALSE, "false", 16},
		{token.SEMICOLON, ";", 16},
		{token.RBRACE, "}", 17},
		{token.INT, "10", 19},
		{token.EQ, "==", 19},
		{token.INT, "10", 19},
		{token.SEMICOLON, ";", 19},
		{token.INT, "10", 20},
		{token.NOT_EQ, "!=", 20},
		{token.INT, "9", 20},
		{token.SEMICOLON, ";", 20},
		{token.STRING, "foobar", 21},
		{token.STRING, "foo bar", 22},
		{token.LBRACKET, "[", 23},
		{token.INT, "1", 23},
		{token.COMMA, ",", 23},
		{token.INT, "2", 23},
		{token.RBRACKET, "]", 23},
		{token.SEMICOLON, ";", 23},
		{token.LBRACE, "{", 24},
		{token.STRING, "foo", 24},
		{token.COLON, ":", 24},
		{token.STRING, "bar", 24},
		{token.RBRACE, "}", 24},
		{token.MACRO, "macro", 25},
		{token.LPAREN, "(", 25},
		{token.IDENT, "x", 25},
		{token.COMMA, ",", 25},
		{token.IDENT, "y", 25},
		{token.RPAREN, ")", 25},
		{token.LBRACE, "{", 25},
		{token.IDENT, "x", 25},
		{token.PLUS, "+", 25},
		{token.IDENT, "y", 25},
		{token.SEMICOLON, ";", 25},
		{token.RBRACE, "}", 25},
		{token.SEMICOLON, ";", 25},
		{token.WHILE, "while", 26},
		{token.LPAREN, "(", 26},
		{token.TRUE, "true", 26},
		{token.RPAREN, ")", 26},
		{token.LBRACE, "{", 26},
		{token.IDENT, "x", 26},
		{token.PLUS, "+", 26},
		{token.IDENT, "y", 26},
		{token.SEMICOLON, ";", 26},
		{token.RBRACE, "}", 26},
		{token.EOF, "", 27},
	}
	l := New(input)
	for i, tt := range tests {
		tok := l.NextToken()
		if tok.Type != tt.expectedType {
			t.Fatalf("tests[%d] - tokentype wrong. expected=%q, got=%q",
				i, tt.expectedType, tok.Type)
		}
		if tok.Literal != tt.expectedLiteral {
			t.Fatalf("tests[%d] - literal wrong. expected=%q, got=%q",
				i, tt.expectedLiteral, tok.Literal)
		}
		if tok.Line != tt.expectedLine {
			t.Fatalf("tests[%d] - line number wrong. expected=%v, got=%v",
				i, tt.expectedLine, tok.Line)
		}
	}
}

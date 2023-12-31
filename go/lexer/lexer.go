package lexer

import (
	"lang/token"
	"strings"
)

type Lexer struct {
	input        string
	position     int  // current position in input (points to current char)
	readPosition int  // current reading position in input (after current char)
	ch           byte // current char under examination
	lineNumber   int
}

func (l *Lexer) readChar() {
	if l.readPosition >= len(l.input) {
		l.ch = 0
	} else {
		l.ch = l.input[l.readPosition]
	}
	l.position = l.readPosition
	l.readPosition += 1
}

func New(input string) *Lexer {
	l := &Lexer{input: input, lineNumber: 1}
	l.readChar()
	return l
}

func (l *Lexer) NextToken() token.Token {
	var tok token.Token

	l.skipWhitespace()

	switch l.ch {
	case '=':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			literal := string(ch) + string(l.ch)
			tok = token.Token{Type: token.EQ, Literal: literal, Line: l.lineNumber}
		} else {
			tok = newToken(token.ASSIGN, l.ch, l.lineNumber)
		}
	case '"':
		str, isErr := l.readString()
		if isErr {
			tok = newToken(token.ILLEGAL, l.ch, l.lineNumber)
		} else {
			tok.Type = token.STRING
			tok.Literal = str
			tok.Line = l.lineNumber
		}

	case '+':
		tok = newToken(token.PLUS, l.ch, l.lineNumber)
	case '-':
		tok = newToken(token.MINUS, l.ch, l.lineNumber)
	case '!':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			literal := string(ch) + string(l.ch)
			tok = token.Token{Type: token.NOT_EQ, Literal: literal, Line: l.lineNumber}
		} else {
			tok = newToken(token.BANG, l.ch, l.lineNumber)
		}
	case '/':
		tok = newToken(token.SLASH, l.ch, l.lineNumber)
	case '*':
		tok = newToken(token.ASTERISK, l.ch, l.lineNumber)
	case '<':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			literal := string(ch) + string(l.ch)
			tok = token.Token{Type: token.LTE, Literal: literal, Line: l.lineNumber}
		} else {
			tok = newToken(token.LT, l.ch, l.lineNumber)
		}
	case '>':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			literal := string(ch) + string(l.ch)
			tok = token.Token{Type: token.GTE, Literal: literal, Line: l.lineNumber}
		} else {
			tok = newToken(token.GT, l.ch, l.lineNumber)
		}
	case ':':
		tok = newToken(token.COLON, l.ch, l.lineNumber)
	case ';':
		tok = newToken(token.SEMICOLON, l.ch, l.lineNumber)
	case '(':
		tok = newToken(token.LPAREN, l.ch, l.lineNumber)
	case ')':
		tok = newToken(token.RPAREN, l.ch, l.lineNumber)
	case ',':
		tok = newToken(token.COMMA, l.ch, l.lineNumber)
	case '{':
		tok = newToken(token.LBRACE, l.ch, l.lineNumber)
	case '}':
		tok = newToken(token.RBRACE, l.ch, l.lineNumber)
	case '[':
		tok = newToken(token.LBRACKET, l.ch, l.lineNumber)
	case ']':
		tok = newToken(token.RBRACKET, l.ch, l.lineNumber)
	case 0:
		tok.Literal = ""
		tok.Line = l.lineNumber
		tok.Type = token.EOF
	default:
		if isLetter(l.ch) {
			tok.Literal = l.readIdentifier()
			tok.Type = token.LookupIdent(tok.Literal)
			tok.Line = l.lineNumber
			return tok
		} else if isDigit(l.ch) {
			tok.Type = token.INT
			tok.Literal = l.readNumber()
			tok.Line = l.lineNumber
			if strings.Contains(tok.Literal, ".") {
				tok.Type = token.FLOAT
			}
			return tok
		} else {
			tok = newToken(token.ILLEGAL, l.ch, l.lineNumber)
		}
	}
	l.readChar()
	return tok
}
func newToken(tokenType token.TokenType, ch byte, lineNumber int) token.Token {
	return token.Token{Type: tokenType, Literal: string(ch), Line: lineNumber}
}
func (l *Lexer) readIdentifier() string {
	position := l.position
	if isLetter(l.ch) {
		l.readChar()
	}
	for isLetterOrDigit(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}
func (l *Lexer) peekChar() byte {
	if l.readPosition >= len(l.input) {
		return 0
	} else {
		return l.input[l.readPosition]
	}
}
func (l *Lexer) skipWhitespace() {
	for l.ch == ' ' || l.ch == '\t' || l.ch == '\n' || l.ch == '\r' {
		if l.ch == '\n' {
			l.lineNumber += 1
		}
		l.readChar()
	}
}
func isLetter(ch byte) bool {
	return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_'
}
func isLetterOrDigit(ch byte) bool {
	return isLetter(ch) || isDigit(ch)
}
func (l *Lexer) readNumber() string {
	position := l.position
	for isDigit(l.ch) {
		l.readChar()
	}
	if l.ch == '.' && isDigit(l.peekChar()) {
		l.readChar()
		for isDigit(l.ch) {
			l.readChar()
		}
	}
	return l.input[position:l.position]
}
func (l *Lexer) readString() (string, bool) {
	position := l.position + 1
	for {
		l.readChar()
		if l.ch == '\\' {
			switch l.peekChar() {
			case 'n':
				l.input = l.input[:l.position] + "\n" + l.input[l.position+2:]
			case 't':
				l.input = l.input[:l.position] + "\t" + l.input[l.position+2:]
			case '\\':
				l.input = l.input[:l.position] + "\\" + l.input[l.position+2:]
			case 'r':
				l.input = l.input[:l.position] + "\r" + l.input[l.position+2:]
			case 'v':
				l.input = l.input[:l.position] + "\r" + l.input[l.position+2:]
			case '"':
				l.input = l.input[:l.position] + "\r" + l.input[l.position+2:]
			case 'a':
				l.input = l.input[:l.position] + "\r" + l.input[l.position+2:]
			case 'b':
				l.input = l.input[:l.position] + "\r" + l.input[l.position+2:]
			case 'f':
				l.input = l.input[:l.position] + "\r" + l.input[l.position+2:]
			}
		}
		if l.ch == 0 {
			return "", true
		}
		if l.ch == '"' {
			break
		}
	}
	return l.input[position:l.position], false
}
func isDigit(ch byte) bool {
	return '0' <= ch && ch <= '9'
}

import { lookupIdent, Token, token, newToken } from "../token";

export class Lexer {
    private position: number = 0;
    private readPosition: number = 0;
    private ch: string = "";
    constructor(private input: string) {
        this.readChar();
    }

    public nextToken(): Token {
        let tok: Token;
        this.skipWhiteSpace();

        switch (this.ch) {
            case "=":
                if (this.peekChar() == "=") {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = newToken(token.EQ, literal);
                } else {
                    tok = newToken(token.ASSIGN, this.ch);
                }
                break;
            case "+":
                tok = newToken(token.PLUS, this.ch);
                break;
            case "-":
                tok = newToken(token.MINUS, this.ch);
                break;
            case "!":
                if (this.peekChar() == "=") {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = newToken(token.NOT_EQ, literal);
                } else {
                    tok = newToken(token.BANG, this.ch);
                }
                break;
            case "/":
                tok = newToken(token.SLASH, this.ch);
                break;
            case "*":
                tok = newToken(token.ASTERISK, this.ch);
                break;
            case "<":
                tok = newToken(token.LT, this.ch);
                break;
            case ">":
                tok = newToken(token.GT, this.ch);
                break;
            case ";":
                tok = newToken(token.SEMICOLON, this.ch);
                break;
            case "(":
                tok = newToken(token.LPAREN, this.ch);
                break;
            case ")":
                tok = newToken(token.RPAREN, this.ch);
                break;
            case ",":
                tok = newToken(token.COMMA, this.ch);
                break;
            case "{":
                tok = newToken(token.LBRACE, this.ch);
                break;
            case "}":
                tok = newToken(token.RBRACE, this.ch);
                break;
            case "\0":
                tok = newToken(token.EOF, "EOF");
                break;
            default:
                if (isLetter(this.ch)) {
                    const literal = this.readIdentifier();
                    const type = lookupIdent(literal);
                    tok = newToken(type, literal);
                    return tok;
                } else if (isDigit(this.ch)) {
                    let type = token.INT;
                    const literal = this.readNumber();
                    if (literal.includes(".")) {
                        type = token.FLOAT;
                    }
                    tok = newToken(type, literal);
                    return tok;
                } else {
                    tok = newToken(token.ILLEGAL, this.ch);
                }
        }
        this.readChar();
        return tok;
    }

    private readChar(): void {
        if (this.readPosition >= this.input.length) {
            this.ch = "\0";
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition++;
    }
    private readNumber(): string {
        const position = this.position;
        while (isDigit(this.ch)) {
            this.readChar();
        }
        if (this.ch === "." && isDigit(this.peekChar())) {
            this.readChar();
            while (isDigit(this.ch)) {
                this.readChar();
            }
        }
        return this.input.slice(position, this.position);
    }
    private readIdentifier(): string {
        const position = this.position;
        if (isLetter(this.ch)) this.readChar();
        while (isLetterOrDigit(this.ch)) {
            this.readChar();
        }
        return this.input.slice(position, this.position);
    }

    private peekChar(): string {
        return this.readPosition >= this.input.length
            ? "\0"
            : this.input[this.readPosition];
    }

    private skipWhiteSpace(): void {
        while (
            this.ch === " " ||
            this.ch === "\t" ||
            this.ch === "\n" ||
            this.ch === "\r"
        ) {
            this.readChar();
        }
    }
}

function isLetter(char: string): boolean {
    return (
        ("a" <= char && char <= "z") ||
        ("A" <= char && char <= "Z") ||
        char == "_"
    );
}

function isLetterOrDigit(char: string) {
    return isLetter(char) || isDigit(char);
}

function isDigit(char: string): boolean {
    return "0" <= char && "9" >= char;
}

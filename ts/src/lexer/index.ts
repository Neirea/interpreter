import { lookupIdent, Token, token, newToken } from "../token";

export class Lexer {
    private position: number = 0;
    private readPosition: number = 0;
    private ch: string = "";
    public lineNumber: number = 1;
    constructor(private input: string) {
        this.readChar();
    }

    public nextToken(): Token {
        let tok: Token;
        this.skipWhiteSpace();

        switch (this.ch) {
            case "=":
                if (this.peekChar() === "=") {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = newToken(token.EQ, literal, this.lineNumber);
                } else {
                    tok = newToken(token.ASSIGN, this.ch, this.lineNumber);
                }
                break;
            case "+":
                tok = newToken(token.PLUS, this.ch, this.lineNumber);
                break;
            case "-":
                tok = newToken(token.MINUS, this.ch, this.lineNumber);
                break;
            case '"': {
                const [str, isErr] = this.readString();
                if (isErr) {
                    tok = newToken(token.ILLEGAL, this.ch, this.lineNumber);
                } else {
                    tok = newToken(token.STRING, str, this.lineNumber);
                }
                break;
            }
            case "!": {
                if (this.peekChar() === "=") {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = newToken(token.NOT_EQ, literal, this.lineNumber);
                } else {
                    tok = newToken(token.BANG, this.ch, this.lineNumber);
                }
                break;
            }
            case "/":
                tok = newToken(token.SLASH, this.ch, this.lineNumber);
                break;
            case "*":
                tok = newToken(token.ASTERISK, this.ch, this.lineNumber);
                break;
            case "<": {
                if (this.peekChar() === "=") {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = newToken(token.LTE, literal, this.lineNumber);
                } else {
                    tok = newToken(token.LT, this.ch, this.lineNumber);
                }
                break;
            }
            case ">": {
                if (this.peekChar() === "=") {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = newToken(token.GTE, literal, this.lineNumber);
                } else {
                    tok = newToken(token.GT, this.ch, this.lineNumber);
                }
                break;
            }
            case ":":
                tok = newToken(token.COLON, this.ch, this.lineNumber);
                break;
            case ";":
                tok = newToken(token.SEMICOLON, this.ch, this.lineNumber);
                break;
            case "(":
                tok = newToken(token.LPAREN, this.ch, this.lineNumber);
                break;
            case ")":
                tok = newToken(token.RPAREN, this.ch, this.lineNumber);
                break;
            case ",":
                tok = newToken(token.COMMA, this.ch, this.lineNumber);
                break;
            case "{":
                tok = newToken(token.LBRACE, this.ch, this.lineNumber);
                break;
            case "}":
                tok = newToken(token.RBRACE, this.ch, this.lineNumber);
                break;
            case "[":
                tok = newToken(token.LBRACKET, this.ch, this.lineNumber);
                break;
            case "]":
                tok = newToken(token.RBRACKET, this.ch, this.lineNumber);
                break;
            case "\0":
                tok = newToken(token.EOF, "EOF", this.lineNumber);
                break;
            default:
                if (isLetter(this.ch)) {
                    const literal = this.readIdentifier();
                    const type = lookupIdent(literal);
                    tok = newToken(type, literal, this.lineNumber);
                    return tok;
                } else if (isDigit(this.ch)) {
                    let type = token.INT;
                    const literal = this.readNumber();
                    if (literal.includes(".")) {
                        type = token.FLOAT;
                    }
                    tok = newToken(type, literal, this.lineNumber);
                    return tok;
                } else {
                    tok = newToken(token.ILLEGAL, this.ch, this.lineNumber);
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
            if (this.ch === "\n") {
                this.lineNumber += 1;
            }
            this.readChar();
        }
    }

    private readString(): [string, boolean] {
        const position = this.position + 1;

        while (true) {
            this.readChar();
            if (this.ch === "\\") {
                const peekCh = this.peekChar();
                switch (peekCh) {
                    case "n":
                        this.input =
                            this.input.slice(0, this.position) +
                            "\n" +
                            this.input.slice(this.position + 2);
                        break;
                    case "t":
                        this.input =
                            this.input.slice(0, this.position) +
                            "\t" +
                            this.input.slice(this.position + 2);
                        break;
                    case "\\":
                        this.input =
                            this.input.slice(0, this.position) +
                            "\\" +
                            this.input.slice(this.position + 2);
                        break;
                    case "r":
                        this.input =
                            this.input.slice(0, this.position) +
                            "\r" +
                            this.input.slice(this.position + 2);
                        break;
                    case "v":
                        this.input =
                            this.input.slice(0, this.position) +
                            "\v" +
                            this.input.slice(this.position + 2);
                        break;
                    case '"':
                        this.input =
                            this.input.slice(0, this.position) +
                            '"' +
                            this.input.slice(this.position + 2);
                        break;
                    case "a":
                        this.input =
                            this.input.slice(0, this.position) +
                            "a" +
                            this.input.slice(this.position + 2);
                        break;
                    case "b":
                        this.input =
                            this.input.slice(0, this.position) +
                            "\b" +
                            this.input.slice(this.position + 2);
                        break;
                    case "f":
                        this.input =
                            this.input.slice(0, this.position) +
                            "\f" +
                            this.input.slice(this.position + 2);
                        break;
                }
            }
            if (this.ch === "\0") {
                return ["", true];
            }
            if (this.ch === '"') {
                break;
            }
        }
        return [this.input.slice(position, this.position), false];
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

export type TokenType = string;

export class Token {
    constructor(
        public type: TokenType,
        public literal: string,
        public line: number
    ) {}
}

export const token = {
    ILLEGAL: "ILLEGAL",
    EOF: "EOF",
    // Identifiers + literals
    IDENT: "IDENT", // add, foobar, x, y, ...
    INT: "INT", // 1343456
    FLOAT: "FLOAT", // 134.3456
    STRING: "STRING",
    // Operators
    ASSIGN: "=",
    EQ: "==",
    NOT_EQ: "!=",
    PLUS: "+",
    MINUS: "-",
    BANG: "!",
    ASTERISK: "*",
    SLASH: "/",
    LT: "<",
    GT: ">",
    LTE: "<=",
    GTE: ">=",
    // Delimiters
    COLON: ":",
    COMMA: ",",
    SEMICOLON: ";",
    LPAREN: "(",
    RPAREN: ")",
    LBRACE: "{",
    RBRACE: "}",
    LBRACKET: "[",
    RBRACKET: "]",
    // Keywords
    FUNCTION: "FUNCTION",
    LET: "LET",
    TRUE: "TRUE",
    FALSE: "FALSE",
    IF: "IF",
    ELSE: "ELSE",
    RETURN: "RETURN",
    MACRO: "MACRO",
    WHILE: "WHILE",
    FOR: "FOR",
};

export const keywords: { [key: string]: TokenType } = {
    fn: token.FUNCTION,
    let: token.LET,
    true: token.TRUE,
    false: token.FALSE,
    if: token.IF,
    else: token.ELSE,
    return: token.RETURN,
    macro: token.MACRO,
    while: token.WHILE,
    for: token.FOR,
};

export function lookupIdent(ident: string): TokenType {
    return keywords[ident] || token.IDENT;
}

export function newToken(
    tokenType: TokenType,
    ch: string,
    line: number
): Token {
    return new Token(tokenType, ch, line);
}

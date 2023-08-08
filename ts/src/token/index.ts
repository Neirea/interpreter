export type TokenType = string;

export class Token {
    constructor(public type: TokenType, public literal: string) {}
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
};

export const keywords: { [key: string]: TokenType } = {
    fn: token.FUNCTION,
    let: token.LET,
    true: token.TRUE,
    false: token.FALSE,
    if: token.IF,
    else: token.ELSE,
    return: token.RETURN,
};

export function lookupIdent(ident: string): TokenType {
    return keywords[ident] || token.IDENT;
}

export function newToken(tokenType: TokenType, ch: string): Token {
    return new Token(tokenType, ch);
}

import {
    ArrayLiteral,
    AssignExpression,
    BlockStatement,
    BooleanLiteral,
    BreakStatement,
    CallExpression,
    Expression,
    ExpressionStatement,
    FloatLiteral,
    ForStatement,
    FunctionLiteral,
    HashLiteral,
    Identifier,
    IfExpression,
    IndexExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    MacroLiteral,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
    StringLiteral,
    WhileStatement,
} from "../ast";
import { Lexer } from "../lexer";
import { Token, TokenType, token } from "../token";

const Precedence = {
    LOWEST: 1,
    EQUALS: 2,
    LESSGREATER: 3,
    SUM: 4,
    PRODUCT: 5,
    PREFIX: 6,
    ASSIGN: 7,
    CALL: 8,
    INDEX: 9,
};

const precedences: { [key: TokenType]: number } = {
    [token.EQ]: Precedence.EQUALS,
    [token.NOT_EQ]: Precedence.EQUALS,
    [token.LT]: Precedence.LESSGREATER,
    [token.GT]: Precedence.LESSGREATER,
    [token.LTE]: Precedence.LESSGREATER,
    [token.GTE]: Precedence.LESSGREATER,
    [token.PLUS]: Precedence.SUM,
    [token.MINUS]: Precedence.SUM,
    [token.SLASH]: Precedence.PRODUCT,
    [token.ASTERISK]: Precedence.PRODUCT,
    [token.ASSIGN]: Precedence.ASSIGN,
    [token.LPAREN]: Precedence.CALL,
    [token.LBRACKET]: Precedence.INDEX,
};

type ParsePrefixFunction = () => Expression | undefined;
type ParseInfixFunction = (
    left: Expression | undefined
) => Expression | undefined;
export type ParseError = {
    message: string;
    line: number;
};

export class Parser {
    private curToken: Token;
    private peekToken: Token;
    public errors: ParseError[] = [];
    private prefixParseFns: {
        [key: TokenType]: ParsePrefixFunction | undefined;
    } = {};
    private infixParseFns: {
        [key: TokenType]: ParseInfixFunction | undefined;
    } = {};
    constructor(private lexer: Lexer) {
        //need to wrap so it doesn't snapshot curToken,peekToken,etc..
        //prefix
        this.registerPrefix(token.TRUE, () => this.parseBoolean());
        this.registerPrefix(token.FALSE, () => this.parseBoolean());
        this.registerPrefix(token.IDENT, () => this.parseIdentifier());
        this.registerPrefix(token.INT, () => this.parseIntegerLiteral());
        this.registerPrefix(token.FLOAT, () => this.parseFloatLiteral());
        this.registerPrefix(token.BANG, () => this.parsePrefixExpression());
        this.registerPrefix(token.MINUS, () => this.parsePrefixExpression());
        this.registerPrefix(token.LPAREN, () => this.parseGroupedExpression());
        this.registerPrefix(token.IF, () => this.parseIfExpression());
        this.registerPrefix(token.FUNCTION, () => this.parseFunctionLiteral());
        this.registerPrefix(token.STRING, () => this.parseStringLiteral());
        this.registerPrefix(token.LBRACKET, () => this.parseArrayLiteral());
        this.registerPrefix(token.LBRACE, () => this.parseHashLiteral());
        this.registerPrefix(token.ILLEGAL, () => this.parseIllegal());
        this.registerPrefix(token.MACRO, () => this.parseMacroLiteral());
        //infix
        this.registerInfix(token.LBRACKET, (l) => this.parseIndexExpression(l));
        this.registerInfix(token.PLUS, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.MINUS, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.SLASH, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.ASTERISK, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.EQ, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.NOT_EQ, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.LTE, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.GTE, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.LT, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.GT, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.LPAREN, (l) => this.parseCallExpression(l));
        this.registerInfix(token.ASSIGN, (l) => this.parseAssignExpression(l));

        this.curToken = this.lexer.nextToken();
        this.peekToken = this.lexer.nextToken();
    }
    private nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }
    private curTokenIs(tokenType: TokenType): boolean {
        return this.curToken.type === tokenType;
    }
    private peekTokenIs(tokenType: TokenType): boolean {
        return this.peekToken.type === tokenType;
    }
    private peekError(tokenType: TokenType) {
        const msg = `expected next token to be ${tokenType}, got ${this.peekToken.type} instead`;
        this.errors.push({ message: msg, line: this.lexer.lineNumber });
    }
    private expectPeek(tokenType: TokenType): boolean {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken();
            return true;
        } else {
            this.peekError(tokenType);
            return false;
        }
    }
    private registerPrefix(
        tokenType: TokenType,
        fn: ParsePrefixFunction | undefined
    ) {
        this.prefixParseFns[tokenType] = fn;
    }
    private registerInfix(
        tokenType: TokenType,
        fn: ParseInfixFunction | undefined
    ) {
        this.infixParseFns[tokenType] = fn;
    }
    private peekPrecedence(): number {
        return precedences[this.peekToken.type] || Precedence.LOWEST;
    }
    private curPrecedence(): number {
        return precedences[this.curToken.type] || Precedence.LOWEST;
    }
    private noPrefixParseFnError(tokenType: TokenType) {
        const msg = `no prefix parse function for ${tokenType} found`;
        this.errors.push({ message: msg, line: this.lexer.lineNumber });
    }

    private parseIdentifier() {
        return new Identifier(this.curToken, this.curToken.literal);
    }

    private parseBoolean() {
        return new BooleanLiteral(this.curToken, this.curTokenIs(token.TRUE));
    }

    private parseStringLiteral() {
        return new StringLiteral(this.curToken, this.curToken.literal);
    }

    private parseIndexExpression(
        left: Expression | undefined
    ): Expression | undefined {
        const tkn = this.curToken;
        this.nextToken();
        const idx = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(token.RBRACKET)) {
            return;
        }
        if (left === undefined) return;
        if (idx === undefined) return;
        return new IndexExpression(tkn, left, idx);
    }

    private parseArrayLiteral(): Expression | undefined {
        const tkn = this.curToken;
        const elements = this.parseExpressionList(token.RBRACKET);
        if (elements === undefined) return;
        return new ArrayLiteral(tkn, elements);
    }

    private parseExpressionList(end: TokenType): Expression[] | undefined {
        const list: Expression[] = [];
        if (this.peekTokenIs(end)) {
            this.nextToken();
            return list;
        }
        this.nextToken();
        const expression = this.parseExpression(Precedence.LOWEST);
        if (expression === undefined) return;
        list.push(expression);
        while (this.peekTokenIs(token.COMMA)) {
            this.nextToken();
            this.nextToken();
            const expression = this.parseExpression(Precedence.LOWEST);
            if (expression === undefined) return;
            list.push(expression);
        }
        if (!this.expectPeek(end)) return;
        return list;
    }

    private parseIntegerLiteral(): Expression | undefined {
        const value = +this.curToken.literal;
        if (isNaN(value)) {
            const msg = `could not parse ${this.curToken.literal} as integer`;
            this.errors.push({ message: msg, line: this.lexer.lineNumber });
            return;
        }
        return new IntegerLiteral(this.curToken, value);
    }
    private parseFloatLiteral(): Expression | undefined {
        const value = +this.curToken.literal;
        if (isNaN(value)) {
            const msg = `could not parse ${this.curToken.literal} as integer`;
            this.errors.push({ message: msg, line: this.lexer.lineNumber });
            return;
        }
        return new FloatLiteral(this.curToken, value);
    }

    private parseExpression(precedence: number): Expression | undefined {
        const prefix = this.prefixParseFns[this.curToken.type];
        if (!prefix) {
            this.noPrefixParseFnError(this.curToken.type);
            return;
        }
        let leftExpr = prefix();
        while (
            !this.peekTokenIs(token.SEMICOLON) &&
            precedence < this.peekPrecedence()
        ) {
            const infix = this.infixParseFns[this.peekToken.type];
            if (!infix) {
                return leftExpr;
            }
            this.nextToken();
            leftExpr = infix(leftExpr);
        }
        return leftExpr;
    }

    private parsePrefixExpression(): Expression | undefined {
        const tkn = this.curToken;
        const operator = this.curToken.literal;
        this.nextToken();
        const right = this.parseExpression(Precedence.PREFIX);
        if (right === undefined) return;
        return new PrefixExpression(tkn, operator, right);
    }

    private parseInfixExpression(
        left: Expression | undefined
    ): Expression | undefined {
        const tkn = this.curToken;
        const operator = this.curToken.literal;
        const precedence = this.curPrecedence();
        this.nextToken();
        const right = this.parseExpression(precedence);
        if (right === undefined) return;
        if (left === undefined) return;
        return new InfixExpression(tkn, left, operator, right);
    }

    private parseHashLiteral(): Expression | undefined {
        const tkn = this.curToken;
        const pairs = new Map<Expression, Expression>();
        while (!this.peekTokenIs(token.RBRACE)) {
            this.nextToken();
            const key = this.parseExpression(Precedence.LOWEST);
            if (!this.expectPeek(token.COLON) || key === undefined) {
                return;
            }
            this.nextToken();
            const value = this.parseExpression(Precedence.LOWEST);
            if (value === undefined) return;
            pairs.set(key, value);
            if (
                !this.peekTokenIs(token.RBRACE) &&
                !this.expectPeek(token.COMMA)
            ) {
                return;
            }
        }
        if (!this.expectPeek(token.RBRACE)) {
            return;
        }
        return new HashLiteral(tkn, pairs);
    }

    private parseGroupedExpression(): Expression | undefined {
        this.nextToken();
        const exp = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(token.RPAREN)) {
            return;
        }
        return exp;
    }

    private parseIfExpression(): Expression | undefined {
        const tkn = this.curToken;
        if (!this.expectPeek(token.LPAREN)) {
            return;
        }
        this.nextToken();
        const condition = this.parseExpression(Precedence.LOWEST);
        if (condition === undefined) return;
        if (!this.expectPeek(token.RPAREN)) {
            return;
        }
        if (!this.expectPeek(token.LBRACE)) {
            return;
        }
        const consequence = this.parseBlockStatement();
        const expression = new IfExpression(tkn, condition, consequence);

        if (this.peekTokenIs(token.ELSE)) {
            this.nextToken();
            if (!this.expectPeek(token.LBRACE)) {
                return;
            }
            expression.alternative = this.parseBlockStatement();
        }
        return expression;
    }

    private parseWhileStatement(): Statement | undefined {
        const tkn = this.curToken;
        if (!this.expectPeek(token.LPAREN)) return;
        this.nextToken();
        const condition = this.parseExpression(Precedence.LOWEST);
        if (condition === undefined) return;
        if (!this.expectPeek(token.RPAREN)) return;
        if (!this.expectPeek(token.LBRACE)) return;
        const body = this.parseBlockStatement();
        this.skipSemicolon();
        return new WhileStatement(tkn, condition, body);
    }

    private parseForStatement(): Statement | undefined {
        const tkn = this.curToken;
        if (!this.expectPeek(token.LPAREN)) return;
        this.nextToken();
        let init: Expression | undefined;
        if (!this.curTokenIs(token.SEMICOLON)) {
            init = this.parseExpression(Precedence.LOWEST);
            if (!this.expectPeek(token.SEMICOLON)) return;
        }
        this.nextToken();
        const condition = this.parseExpression(Precedence.LOWEST);
        if (condition === undefined) return;
        if (!this.expectPeek(token.SEMICOLON)) return;
        this.nextToken();
        let update: Expression | undefined;
        if (!this.curTokenIs(token.RPAREN)) {
            update = this.parseExpression(Precedence.LOWEST);
            if (!this.expectPeek(token.RPAREN)) return;
        }
        this.nextToken();
        const body = this.parseBlockStatement();
        return new ForStatement(tkn, init, condition, update, body);
    }

    private parseFunctionLiteral(): Expression | undefined {
        const tkn = this.curToken;
        if (!this.expectPeek(token.LPAREN)) {
            return;
        }
        const params = this.parseFunctionParameters();
        if (params === undefined) return;
        if (!this.expectPeek(token.LBRACE)) {
            return;
        }
        const body = this.parseBlockStatement();
        return new FunctionLiteral(tkn, params, body);
    }

    private parseFunctionParameters(): Identifier[] | undefined {
        const identifiers: Identifier[] = [];
        if (this.peekTokenIs(token.RPAREN)) {
            this.nextToken();
            return identifiers;
        }
        this.nextToken();
        const ident = new Identifier(this.curToken, this.curToken.literal);
        identifiers.push(ident);
        while (this.peekTokenIs(token.COMMA)) {
            this.nextToken();
            this.nextToken();
            const ident = new Identifier(this.curToken, this.curToken.literal);
            identifiers.push(ident);
        }
        if (!this.expectPeek(token.RPAREN)) {
            return;
        }
        return identifiers;
    }

    private parseCallExpression(
        func: Expression | undefined
    ): Expression | undefined {
        const tkn = this.curToken;
        const args = this.parseExpressionList(token.RPAREN);
        if (args === undefined) return;
        if (func === undefined) return;
        return new CallExpression(tkn, func, args);
    }

    public parseProgram(): Program {
        const program = new Program([]);
        while (!this.curTokenIs(token.EOF)) {
            const stmt = this.parseStatement();
            if (stmt) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }
        return program;
    }

    private parseStatement(): Statement | undefined {
        switch (this.curToken.type) {
            case token.LET:
                return this.parseLetStatement();
            case token.RETURN:
                return this.parseReturnStatement();
            case token.WHILE:
                return this.parseWhileStatement();
            case token.FOR:
                return this.parseForStatement();
            case token.BREAK:
                return this.parseBreakStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement(): LetStatement | undefined {
        const tkn = this.curToken;
        if (!this.expectPeek(token.IDENT)) return;
        const name = new Identifier(this.curToken, this.curToken.literal);
        if (!this.expectPeek(token.ASSIGN)) return;
        this.nextToken();
        const value = this.parseExpression(Precedence.LOWEST);
        if (!value) return;
        if (this.checkSemicolonError()) return;
        return new LetStatement(tkn, name, value);
    }

    private parseAssignExpression(
        left: Expression | undefined
    ): AssignExpression | undefined {
        if (!(left instanceof Identifier)) {
            const msg = `expected valid identifier. got=${left}`;
            this.errors.push({ message: msg, line: this.curToken.line });
            return;
        }
        const tkn = this.curToken;
        this.nextToken();
        const value = this.parseExpression(Precedence.LOWEST);
        if (value === undefined) return;
        return new AssignExpression(tkn, left, value);
    }

    private parseReturnStatement(): ReturnStatement | undefined {
        const tkn = this.curToken;
        this.nextToken();
        const returnValue = this.parseExpression(Precedence.LOWEST);
        if (returnValue === undefined) return;
        const stmt = new ReturnStatement(tkn, returnValue);
        if (this.checkSemicolonError()) {
            return;
        }
        return stmt;
    }

    private parseBreakStatement(): BreakStatement | undefined {
        const tkn = this.curToken;
        if (this.checkSemicolonError()) return;
        return new BreakStatement(tkn);
    }

    private parseExpressionStatement(): ExpressionStatement | undefined {
        const tkn = this.curToken;
        const expr = this.parseExpression(Precedence.LOWEST);
        if (expr === undefined) return;

        const exprStmt = new ExpressionStatement(tkn, expr);

        switch (expr.tokenLiteral()) {
            case "if":
                this.skipSemicolon();
                break;
            case "fn":
                this.skipSemicolon();
                break;
            default:
                if (this.checkSemicolonError()) {
                    return;
                }
        }
        return exprStmt;
    }

    private parseBlockStatement(): BlockStatement {
        const block = new BlockStatement(this.curToken, []);
        this.nextToken();
        while (!this.curTokenIs(token.RBRACE) && !this.curTokenIs(token.EOF)) {
            const stmt = this.parseStatement();
            if (stmt) {
                block.statements.push(stmt);
            }
            this.nextToken();
        }
        return block;
    }

    private parseIllegal(): Expression {
        this.peekError('"');
        return new StringLiteral(this.curToken, this.curToken.literal);
    }

    private skipSemicolon() {
        while (this.peekTokenIs(token.SEMICOLON)) {
            this.nextToken();
        }
    }

    private parseMacroLiteral(): Expression | undefined {
        const tkn = this.curToken;

        if (!this.expectPeek(token.LPAREN)) {
            return;
        }
        const params = this.parseFunctionParameters();

        if (!params) return;

        if (!this.expectPeek(token.LBRACE)) {
            return;
        }
        const body = this.parseBlockStatement();
        return new MacroLiteral(tkn, params, body);
    }

    private checkSemicolonError(): boolean {
        if (this.peekTokenIs(token.SEMICOLON)) {
            this.skipSemicolon();
            return false;
        } else {
            this.peekError(";");
            this.skipSemicolon();
            return true;
        }
    }
}

import {
    BlockStatement,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FloatLiteral,
    FunctionLiteral,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
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
    CALL: 7,
};

const precedences: { [key: TokenType]: number } = {
    [token.EQ]: Precedence.EQUALS,
    [token.NOT_EQ]: Precedence.EQUALS,
    [token.LT]: Precedence.LESSGREATER,
    [token.GT]: Precedence.LESSGREATER,
    [token.PLUS]: Precedence.SUM,
    [token.MINUS]: Precedence.SUM,
    [token.SLASH]: Precedence.PRODUCT,
    [token.ASTERISK]: Precedence.PRODUCT,
    [token.LPAREN]: Precedence.CALL,
};

type ParsePrefixFunction = () => Expression | undefined;
type ParseInfixFunction = (
    left: Expression | undefined
) => Expression | undefined;

export class Parser {
    private curToken: Token;
    private peekToken: Token;
    constructor(
        private lexer: Lexer,
        public errors: string[] = [],
        private prefixParseFns: {
            [key: TokenType]: ParsePrefixFunction | undefined;
        } = {},
        private infixParseFns: {
            [key: TokenType]: ParseInfixFunction | undefined;
        } = {}
    ) {
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
        //infix
        this.registerInfix(token.PLUS, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.MINUS, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.SLASH, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.ASTERISK, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.EQ, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.NOT_EQ, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.LT, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.GT, (l) => this.parseInfixExpression(l));
        this.registerInfix(token.LPAREN, (l) => this.parseCallExpression(l));

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
        this.errors.push(msg);
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
        this.errors.push(msg);
    }

    private parseIdentifier() {
        return new Identifier(this.curToken, this.curToken.literal);
    }

    private parseBoolean() {
        return new BooleanLiteral(this.curToken, this.curTokenIs(token.TRUE));
    }

    private parseIntegerLiteral(): Expression | undefined {
        const value = +this.curToken.literal;
        if (isNaN(value)) {
            const msg = `could not parse ${this.curToken.literal} as integer`;
            this.errors.push(msg);
            return;
        }
        return new IntegerLiteral(this.curToken, value);
    }
    private parseFloatLiteral(): Expression | undefined {
        const value = +this.curToken.literal;
        if (isNaN(value)) {
            const msg = `could not parse ${this.curToken.literal} as integer`;
            this.errors.push(msg);
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
        if (right == null) return;
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
        if (right == null) return;
        if (left == null) return;
        return new InfixExpression(tkn, left, operator, right);
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
        if (condition == null) return;
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

    private parseFunctionLiteral(): Expression | undefined {
        const tkn = this.curToken;
        if (!this.expectPeek(token.LPAREN)) {
            return;
        }
        const params = this.parseFunctionParameters();
        if (params == null) return;
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
        const args = this.parseCallArguments();
        if (args == null) return;
        if (func == null) return;
        return new CallExpression(tkn, func, args);
    }

    private parseCallArguments(): Expression[] | undefined {
        const args: Expression[] = [];
        if (this.peekTokenIs(token.RPAREN)) {
            this.nextToken();
            return args;
        }
        this.nextToken();
        const expr = this.parseExpression(Precedence.LOWEST);
        if (expr == null) return args;
        args.push(expr);
        while (this.peekTokenIs(token.COMMA)) {
            this.nextToken();
            this.nextToken();
            const expr = this.parseExpression(Precedence.LOWEST);
            if (expr == null) return;
            args.push(expr);
        }
        if (!this.expectPeek(token.RPAREN)) {
            return;
        }
        return args;
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
        if (this.peekTokenIs(token.SEMICOLON)) {
            this.nextToken();
        }
        return new LetStatement(tkn, name, value);
    }

    private parseReturnStatement(): ReturnStatement | undefined {
        const tkn = this.curToken;
        this.nextToken();
        const returnValue = this.parseExpression(Precedence.LOWEST);
        if (returnValue == null) return;
        const stmt = new ReturnStatement(tkn, returnValue);
        if (this.peekTokenIs(token.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }

    private parseExpressionStatement(): ExpressionStatement | undefined {
        const tkn = this.curToken;
        const expr = this.parseExpression(Precedence.LOWEST);
        if (expr == null) return;
        if (this.peekTokenIs(token.SEMICOLON)) {
            this.nextToken();
        }
        return new ExpressionStatement(tkn, expr);
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
}

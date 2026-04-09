import { Token, TokenType } from "./token";
import {
    NodeType,
    Program,
    HookStatement,
    HookPulloutStatement,
    FunctionDefinition,
    VariableDeclaration,
    WhileStatement,
    ExpressionStatement,
    FunctionCall,
    MemberAccess,
    TypeCast,
    BinaryExpression,
    Identifier,
    NumberLiteral,
    StringLiteral,
    Expression,
    Type,
    ASTNode,
} from "./ast";

export class Parser {
    private tokens: Token[] = [];
    private pos: number = 0;

    parse(tokens: Token[]): Program {
        this.tokens = tokens;
        this.pos = 0;

        const body: ASTNode[] = [];

        while (!this.isAtEnd()) {
            const stmt = this.parseStatement();
            if (stmt) {
                body.push(stmt);
            }
        }

        return { type: NodeType.PROGRAM, body };
    }

    private parseStatement(): ASTNode | null {
        const token = this.current();

        switch (token.type) {
            case TokenType.HOOK:
                return this.parseHookStatement();
            case TokenType.VAR:
                return this.parseVariableDeclaration();
            case TokenType.WHILE:
                return this.parseWhileStatement();
            case TokenType.DOLLAR:
                return this.parseFunctionDefinition();
            case TokenType.IDENT:
                return this.parseExpressionStatement();
            default:
                this.pos++;
                return null;
        }
    }

    private parseHookStatement(): HookStatement | HookPulloutStatement {
        this.expect(TokenType.HOOK);
        this.expect(TokenType.STRING);
        const moduleName = this.current().literal as string;

        if (this.check(TokenType.PULLOUT)) {
            this.advance();
            this.expect(TokenType.IDENT);
            const symbols: string[] = [this.previous().value];

            while (this.check(TokenType.COMMA)) {
                this.advance();
                this.expect(TokenType.IDENT);
                symbols.push(this.previous().value);
            }

            this.expect(TokenType.SEMICOLON);
            return { type: NodeType.HOOK_PULLOUT_STATEMENT, moduleName, symbols };
        }

        this.expect(TokenType.SEMICOLON);
        return { type: NodeType.HOOK_STATEMENT, moduleName };
    }

    private parseVariableDeclaration(): VariableDeclaration {
        this.expect(TokenType.VAR);
        this.expect(TokenType.TYPE_INT);
        const varType: Type = "int";
        this.expect(TokenType.IDENT);
        const name = this.previous().value;
        this.expect(TokenType.ASSIGN);
        const initializer = this.parseExpression();
        this.expect(TokenType.SEMICOLON);

        return { type: NodeType.VARIABLE_DECLARATION, name, varType, initializer };
    }

    private parseWhileStatement(): WhileStatement {
        this.expect(TokenType.WHILE);
        this.expect(TokenType.LPAREN);
        const condition = this.parseExpression();
        this.expect(TokenType.RPAREN);
        this.expect(TokenType.LBRACE);

        const body: ASTNode[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            const stmt = this.parseStatement();
            if (stmt) {
                body.push(stmt);
            }
        }

        this.expect(TokenType.RBRACE);
        return { type: NodeType.WHILE_STATEMENT, condition, body };
    }

    private parseFunctionDefinition(): FunctionDefinition {
        this.expect(TokenType.DOLLAR);
        this.expect(TokenType.DEFINE);
        const returnType: Type = this.parseType();
        this.expect(TokenType.IDENT);
        const name = this.previous().value;

        this.expect(TokenType.LPAREN);
        const params: { name: string; paramType: Type }[] = [];

        if (!this.check(TokenType.RPAREN)) {
            do {
                const paramType = this.parseType();
                this.expect(TokenType.IDENT);
                params.push({ name: this.previous().value, paramType });
            } while (this.check(TokenType.COMMA));
        }

        this.expect(TokenType.RPAREN);
        this.expect(TokenType.LBRACE);

        const body: ASTNode[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            const stmt = this.parseStatement();
            if (stmt) {
                body.push(stmt);
            }
        }

        this.expect(TokenType.RBRACE);

        return { type: NodeType.FUNCTION_DEFINITION, name, params, returnType, body, exported: true };
    }

    private parseExpression(): Expression {
        return this.parseAdditive();
    }

    private parseAdditive(): Expression {
        let left = this.parseMultiplicative();

        while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
            const operator = this.advance().value;
            const right = this.parseMultiplicative();
            left = { type: NodeType.BINARY_EXPRESSION, left, operator, right } as BinaryExpression;
        }

        return left;
    }

    private parseMultiplicative(): Expression {
        let left = this.parseCall();

        while (this.check(TokenType.STAR) || this.check(TokenType.SLASH)) {
            const operator = this.advance().value;
            const right = this.parseCall();
            left = { type: NodeType.BINARY_EXPRESSION, left, operator, right } as BinaryExpression;
        }

        return left;
    }

    private parseCall(): Expression {
        let expr = this.parsePrimary();

        while (true) {
            if (this.check(TokenType.LPAREN)) {
                expr = this.finishFunctionCall(expr as Expression);
            } else if (this.check(TokenType.DOT)) {
                this.advance();
                this.expect(TokenType.IDENT);
                const property = this.previous().value;
                expr = { type: NodeType.MEMBER_ACCESS, object: expr, property } as MemberAccess;
            } else if (this.check(TokenType.ARROW)) {
                this.advance();
                const targetType = this.parseType();
                expr = { type: NodeType.TYPE_CAST, expression: expr, targetType } as TypeCast;
            } else {
                break;
            }
        }

        return expr;
    }

    private finishFunctionCall(callee: Expression): FunctionCall {
        this.expect(TokenType.LPAREN);
        const arguments_: Expression[] = [];

        if (!this.check(TokenType.RPAREN)) {
            do {
                arguments_.push(this.parseExpression());
            } while (this.check(TokenType.COMMA));
        }

        this.expect(TokenType.RPAREN);
        return { type: NodeType.FUNCTION_CALL, callee, arguments: arguments_ };
    }

    private parsePrimary(): Expression {
        if (this.check(TokenType.NUMBER)) {
            const value = this.advance().literal as number;
            return { type: NodeType.NUMBER_LITERAL, value } as NumberLiteral;
        }

        if (this.check(TokenType.STRING)) {
            const value = this.advance().literal as string;
            return { type: NodeType.STRING_LITERAL, value } as StringLiteral;
        }

        if (this.check(TokenType.IDENT)) {
            const name = this.advance().value;
            return { type: NodeType.IDENTIFIER, name } as Identifier;
        }

        if (this.check(TokenType.LPAREN)) {
            this.advance();
            const expr = this.parseExpression();
            this.expect(TokenType.RPAREN);
            return expr;
        }

        this.advance();
        return { type: NodeType.IDENTIFIER, name: "" } as Identifier;
    }

    private parseType(): Type {
        if (this.check(TokenType.TYPE_INT)) {
            this.advance();
            return "int";
        }
        if (this.check(TokenType.TYPE_STRING)) {
            this.advance();
            return "string";
        }
        if (this.check(TokenType.TYPE_VOID)) {
            this.advance();
            return "void";
        }
        return "int";
    }

    private parseExpressionStatement(): ExpressionStatement {
        const expression = this.parseExpression();
        this.expect(TokenType.SEMICOLON);
        return { type: NodeType.EXPRESSION_STATEMENT, expression };
    }

    private current(): Token {
        return this.tokens[this.pos];
    }

    private previous(): Token {
        return this.tokens[this.pos - 1];
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.pos++;
        return this.previous();
    }

    private check(type: TokenType): boolean {
        return !this.isAtEnd() && this.current().type === type;
    }

    private expect(type: TokenType): void {
        if (this.check(type)) {
            this.advance();
        } else {
            this.advance();
        }
    }

    private isAtEnd(): boolean {
        return this.current().type === TokenType.EOF;
    }
}

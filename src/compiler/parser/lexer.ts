import { Token, TokenType } from "./token";

const KEYWORDS: Record<string, TokenType> = {
    hook: TokenType.HOOK,
    pullout: TokenType.PULLOUT,
    var: TokenType.VAR,
    while: TokenType.WHILE,
    define: TokenType.DEFINE,
    int: TokenType.TYPE_INT,
    string: TokenType.TYPE_STRING,
    void: TokenType.TYPE_VOID,
};

export class Lexer {
    private source: string;
    private pos: number = 0;
    private tokens: Token[] = [];

    constructor(source: string) {
        this.source = source;
    }

    tokenize(): Token[] {
        while (this.pos < this.source.length) {
            this.skipWhitespace();
            if (this.pos >= this.source.length) break;

            const char = this.source[this.pos];

            if (char === '"') {
                this.readString();
            } else if (this.isDigit(char)) {
                this.readNumber();
            } else if (this.isAlpha(char)) {
                this.readIdentifier();
            } else {
                this.readOperator();
            }
        }

        this.tokens.push({ type: TokenType.EOF, value: "" });
        return this.tokens;
    }

    private skipWhitespace(): void {
        while (this.pos < this.source.length) {
            const char = this.source[this.pos];
            if (char === " " || char === "\t" || char === "\n" || char === "\r") {
                this.pos++;
            } else if (char === "#") {
                while (this.pos < this.source.length && this.source[this.pos] !== "\n") {
                    this.pos++;
                }
            } else {
                break;
            }
        }
    }

    private readString(): void {
        this.pos++;
        const start = this.pos;
        while (this.pos < this.source.length && this.source[this.pos] !== '"') {
            this.pos++;
        }
        const value = this.source.slice(start, this.pos);
        this.tokens.push({ type: TokenType.STRING, value, literal: value });
        this.pos++;
    }

    private readNumber(): void {
        const start = this.pos;
        while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
            this.pos++;
        }
        const value = this.source.slice(start, this.pos);
        this.tokens.push({ type: TokenType.NUMBER, value, literal: parseInt(value, 10) });
    }

    private readIdentifier(): void {
        const start = this.pos;
        while (this.pos < this.source.length && this.isAlphaNumeric(this.source[this.pos])) {
            this.pos++;
        }
        const value = this.source.slice(start, this.pos);
        const type = KEYWORDS[value] || TokenType.IDENT;
        this.tokens.push({ type, value });
    }

    private readOperator(): void {
        const char = this.source[this.pos];
        switch (char) {
            case "(":
                this.tokens.push({ type: TokenType.LPAREN, value: "(" });
                this.pos++;
                break;
            case ")":
                this.tokens.push({ type: TokenType.RPAREN, value: ")" });
                this.pos++;
                break;
            case "{":
                this.tokens.push({ type: TokenType.LBRACE, value: "{" });
                this.pos++;
                break;
            case "}":
                this.tokens.push({ type: TokenType.RBRACE, value: "}" });
                this.pos++;
                break;
            case ";":
                this.tokens.push({ type: TokenType.SEMICOLON, value: ";" });
                this.pos++;
                break;
            case ",":
                this.tokens.push({ type: TokenType.COMMA, value: "," });
                this.pos++;
                break;
            case "=":
                if (this.peek() === ">") {
                    this.pos += 2;
                    this.tokens.push({ type: TokenType.ARROW, value: "->" });
                } else {
                    this.tokens.push({ type: TokenType.ASSIGN, value: "=" });
                    this.pos++;
                }
                break;
            case "<":
                this.tokens.push({ type: TokenType.LT, value: "<" });
                this.pos++;
                break;
            case ">":
                this.tokens.push({ type: TokenType.GT, value: ">" });
                this.pos++;
                break;
            case ".":
                this.tokens.push({ type: TokenType.DOT, value: "." });
                this.pos++;
                break;
            case "+":
                this.tokens.push({ type: TokenType.PLUS, value: "+" });
                this.pos++;
                break;
            case "-":
                if (this.peek() === ">") {
                    this.pos += 2;
                    this.tokens.push({ type: TokenType.ARROW, value: "->" });
                } else {
                    this.tokens.push({ type: TokenType.MINUS, value: "-" });
                    this.pos++;
                }
                break;
            case "*":
                this.tokens.push({ type: TokenType.STAR, value: "*" });
                this.pos++;
                break;
            case "/":
                this.tokens.push({ type: TokenType.SLASH, value: "/" });
                this.pos++;
                break;
            case "$":
                this.tokens.push({ type: TokenType.DOLLAR, value: "$" });
                this.pos++;
                break;
            default:
                this.pos++;
        }
    }

    private peek(): string {
        return this.source[this.pos + 1] || "";
    }

    private isDigit(char: string): boolean {
        return char >= "0" && char <= "9";
    }

    private isAlpha(char: string): boolean {
        return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_";
    }

    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }
}

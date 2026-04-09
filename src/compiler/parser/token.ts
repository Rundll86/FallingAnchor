export enum TokenType {
    HOOK,
    PULLOUT,
    VAR,
    WHILE,
    DEFINE,
    DOLLAR,
    IDENT,
    STRING,
    NUMBER,
    TYPE_INT,
    TYPE_STRING,
    TYPE_VOID,
    LPAREN,
    RPAREN,
    LBRACE,
    RBRACE,
    SEMICOLON,
    COMMA,
    ASSIGN,
    LT,
    GT,
    ARROW,
    DOT,
    PLUS,
    MINUS,
    STAR,
    SLASH,
    EOF,
}

export interface Token {
    type: TokenType;
    value: string;
    literal?: string | number;
}

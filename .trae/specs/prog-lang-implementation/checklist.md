# Checklist

- [ ] Token 类型枚举正确定义所有 token 类型
- [ ] Token 数据结构包含 type, value, literal 字段
- [ ] Lexer 能正确识别 `hook` 关键字
- [ ] Lexer 能正确识别 `->` (ARROW) 和 `->>` (MEMBER_ACCESS) 符号
- [ ] Lexer 能正确识别字符串和数字字面量
- [ ] Lexer 测试用例 `var int x = 42;` 解析正确
- [ ] Lexer 测试用例 `i -> string` 解析正确
- [ ] Lexer 测试用例 `stdout.write(x)` 解析正确

- [ ] AST 节点类型完整（Program, HookStatement, HookPulloutStatement, FunctionDefinition, VariableDeclaration, WhileStatement, FunctionCall, MemberAccess, TypeCast, BinaryExpression, Identifier, NumberLiteral, StringLiteral）
- [ ] TypeCast 节点包含 expression 和 targetType 字段
- [ ] FunctionCall 节点包含 callee 和 arguments 字段

- [ ] Compiler 能解析 `hook "stdout";` 语句
- [ ] Compiler 能解析 `hook "stdout" pullout write,read;` 语句
- [ ] Compiler 能解析 `var int i=0;` 语句
- [ ] Compiler 能解析 `while(i<10){}` 语句
- [ ] Compiler 能解析 `stdout.write(i -> string)` 函数调用
- [ ] Compiler 正确将 `i -> string` 构建为 TypeCast 节点作为 FunctionCall 的参数

- [ ] Runtime 能执行变量声明并将变量存入环境
- [ ] Runtime 能执行函数调用
- [ ] Runtime 能执行类型转换表达式
- [ ] Runtime 能执行 while 循环

- [ ] 集成测试 controls.fa 能正确运行
- [ ] 集成测试 output.fa 能正确运行

# Tasks

- [ ] Task 1: 定义 Token 类型枚举和 Token 结构
  - [ ] SubTask 1.1: 创建 Token 类型枚举（HOOK, VAR, WHILE, IDENT, NUMBER, STRING 等）
  - [ ] SubTask 1.2: 创建 Token 数据结构（type, value, literal）

- [ ] Task 2: 实现 Lexer 词法分析器
  - [ ] SubTask 2.1: 实现字符读取和 Token 生成逻辑
  - [ ] SubTask 2.2: 实现关键字识别（hook, var, while, define）
  - [ ] SubTask 2.3: 实现类型转换符号 `->` 和成员访问符号 `->>` 的识别
  - [ ] SubTask 2.4: 实现字符串和数字字面量的识别
  - [ ] SubTask 2.5: 编写 Lexer 单元测试

- [ ] Task 3: 定义 AST 节点类型
  - [ ] SubTask 3.1: 创建 AST 节点基类/接口
  - [ ] SubTask 3.2: 创建表达式节点（Identifier, NumberLiteral, StringLiteral, TypeCast, BinaryExpression, MemberAccess, FunctionCall）
  - [ ] SubTask 3.3: 创建语句节点（Program, HookStatement, HookPulloutStatement, FunctionDefinition, VariableDeclaration, WhileStatement, ExpressionStatement）

- [ ] Task 4: 实现 Compiler 语法分析器
  - [ ] SubTask 4.1: 实现 Parser 基础结构
  - [ ] SubTask 4.2: 实现 hook 语句解析（HookStatement, HookPulloutStatement）
  - [ ] SubTask 4.3: 实现变量声明解析（VariableDeclaration）
  - [ ] SubTask 4.4: 实现 while 循环解析（WhileStatement）
  - [ ] SubTask 4.5: 实现函数定义解析（FunctionDefinition）
  - [ ] SubTask 4.6: 实现成员访问和函数调用解析（MemberAccess, FunctionCall）
  - [ ] SubTask 4.7: 实现类型转换表达式解析（TypeCast）
  - [ ] SubTask 4.8: 编写 Compiler 单元测试

- [ ] Task 5: 实现 Runtime 运行时
  - [ ] SubTask 5.1: 实现执行上下文（Context/Environment）
  - [ ] SubTask 5.2: 实现语句执行（Statement Executor）
  - [ ] SubTask 5.3: 实现表达式求值（Expression Evaluator）
  - [ ] SubTask 5.4: 实现函数调用逻辑
  - [ ] SubTask 5.5: 实现类型转换逻辑
  - [ ] SubTask 5.6: 编写 Runtime 单元测试

- [ ] Task 7: 集成测试
  - [ ] SubTask 7.1: 使用 controls.fa 示例进行集成测试
  - [ ] SubTask 7.2: 使用 output.fa 示例进行集成测试

# Task Dependencies
- Task 3 依赖 Task 1（Token 定义）
- Task 4 依赖 Task 2 和 Task 3（Lexer 和 AST 定义）
- Task 5 依赖 Task 3（AST 定义）
- Task 7 依赖 Task 2, 4, 5（Lexer, Compiler, Runtime 实现）

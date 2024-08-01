//プログラム全体
class Program {
  constructor(...expressions){
    this.expressions = expressions
  }
}
// 式を表すクラス
class Expression {}
// 代入を表すクラス
class Assignment extends Expression {
  constructor(name, expr) {
    super();
    this.name = name;
    this.expr = expr;
  }
}
// 二項演算子（+、-、*、/）のためのクラス
class BinExpr extends Expression {
  constructor(operator, lhs, rhs) {
    super();
    this.operator = operator;
    this.lhs = lhs;
    this.rhs = rhs;
  }
}
// 整数値のためのクラス
class Num extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
}
// 変数参照のためのクラス
class VarRef extends Expression {
  constructor(name){
    super();
    this.name = name;
  }
}
function evalProgram(program) {
  const env = {};
  let result = null;
  program.expressions.forEach((e) => {
    result = eval(e, env);
  });
  return result;
}

function eval(expr, env) {
  if(expr instanceof BinExpr) {
    const resultL = eval(expr.lhs, env);
    const resultR = eval(expr.rhs, env);
    switch(expr.operator) {
      case "+":
        return resultL + resultR;
      case "-":
        return resultL - resultR;
      case "*":
        return resultL * resultR;
      case "/":
        return resultL / resultR;
    }
  } else if(expr instanceof Num) {
     return expr.value;
  } else if(expr instanceof VarRef) {
     return env[expr.name];
  } else if(expr instanceof Assignment) {
     const result = eval(expr.expr);
     env[expr.name] = result;
     return result;
  } else {
     console.assert(false, "should not reach here");
  }
}
const program = new Program(
  new Assignment("a",
    new BinExpr("+",
      new Num(3),
      new BinExpr("*", new Num(4), new Num(2))
    )
  ),
  new BinExpr("+", new VarRef("a"), new Num(3))
);
console.log("result = " + evalProgram(program)); // result = 14

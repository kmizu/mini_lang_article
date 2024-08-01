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
} // 二項演算子（+、-、*、/）のためのクラス
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

// 条件分岐のためのクラス
class If extends Expression {
  constructor(cond, thenExpr, elseExpr) {
    super();
    this.cond = cond;
    this.thenExpr = thenExpr;
    this.elseExpr = elseExpr;
  }
}

// 繰り返しのためのクラス
class While extends Expression {
  constructor(cond, body) {
    super();
    this.cond = cond;
    this.body = body;
  }
}

// 連接のためのクラス
class Seq extends Expression {
  constructor(...bodies) {
    super();
    this.bodies = bodies;
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
      case "<":
        return resultL < resultR ? 1 : 0;
      case ">":
        return resultL > resultR ? 1 : 0;
      case "<=":
        return resultL <= resultR ? 1 : 0;
      case ">=":
        return resultL >= resultR ? 1 : 0;
      case "==":
        return resultL === resultR ? 1 : 0;
      case "!=":
        return resultL !== resultR ? 1 : 0;
    }
  } else if(expr instanceof Num) {
     return expr.value;
  } else if(expr instanceof VarRef) {
     return env[expr.name];
  } else if(expr instanceof Assignment) {
     const result = eval(expr.expr, env);
     env[expr.name] = result;
     return result;
  } else if(expr instanceof Seq) {
     let result = null;
     expr.bodies.forEach((e) => {
        result = eval(e, env);
     });
     return result;
  } else if(expr instanceof If) {
     if(eval(expr.cond, env) !== 0) {
       return eval(expr.thenExpr, env);
     }else {
       return eval(expr.elseExpr, env);
     }
  } else if(expr instanceof While) {
     while(eval(expr.cond, env) !== 0) {
       eval(expr.body, env);
     }
     return 0;
  } else {
     console.assert(false, "should not reach here");
  }
}
const program = new Program(
  // sum = 0
  new Assignment("sum", new Num(0)),
  // i = 0
  new Assignment("i", new Num(0)),
  new While(
    // i <= 10
    new BinExpr("<=", new VarRef("i"), new Num(10)),
    new Seq(
      // sum = sum + i
      new Assignment("sum", new BinExpr("+", new VarRef("sum"), new VarRef("i"))),
      // i = i + 1
      new Assignment("i", new BinExpr("+", new VarRef("i"), new Num(1)))
    )
  ),
  new VarRef("sum")
);
console.log("result = " + evalProgram(program)); // result = 55

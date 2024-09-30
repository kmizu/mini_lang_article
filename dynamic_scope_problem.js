//プログラム全体
class Program {
  constructor(defs, ...expressions){
    this.defs = defs;
    this.expressions = expressions;
  }
}
//関数定義を表すクラス
class FunDef {
  constructor(name, args, body) {
    this.name = name;
    this.args = args;
    this.body = body;
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

// 関数呼び出しのためのクラス
class FunCall extends Expression {
  constructor(name, ...args) {
    super();
    this.name = name;
    this.args = args;
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
  program.defs.forEach((d) => {
    env[d.name] = d;
  });
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
  } else if(expr instanceof FunCall) {
     const def = env[expr.name];
     if(!def) throw `function ${expr.name} is not defined`;

     const args = expr.args.map((a) => eval(a, env));

     const newEnv = Object.assign({}, env);
     for(let i = 0; i < def.args.length; i++) {
       newEnv[def.args[i]] = args[i];
     }
     return eval(def.body, newEnv);
  } else {
     console.assert(false, "should not reach here");
  }
}
const program = new Program(
  // function refA(n) {
  //   return a;
  // }
  // function main() {
  //   a = 3;
  //   return refA();
  // }
  [
    new FunDef("refA", [],
      new VarRef("a"),
    ),
    new FunDef("main", [],
      new Assignment("a", new Num(3)),
      new FunCall("refA"),
    )
  ],
  new FunCall("main")
);
console.log("result = " + evalProgram(program)); // 3

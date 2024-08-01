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
// 組み込み関数のためのクラス
class BuiltinFun {
  constructor(name, func) {
    this.name = name;
    this.func = func;
  }
}

function evalProgram(program) {
  const env = {};
  const funEnv = {};
  const builtinFunEnv = {
    'print': new BuiltinFun('print', (args) => {
      console.log(...args);
      return args[0];
    }),
    'input': new BuiltinFun('input', () => {
      return prompt('Enter input:');
    }),
    'add': new BuiltinFun('add', (args) => args.reduce((a, b) => a + b, 0)),
    'mul': new BuiltinFun('mul', (args) => args.reduce((a, b) => a * b, 1)),
  };
  let result = null;
  program.defs.forEach((d) => {
    funEnv[d.name] = d;
  });
  program.expressions.forEach((e) => {
    result = eval(e, env, funEnv, builtinFunEnv);
  });
  return result;
}

function eval(expr, env, funEnv, builtinFunEnv) {
  if(expr instanceof BinExpr) {
    const resultL = eval(expr.lhs, env, funEnv, builtinFunEnv);
    const resultR = eval(expr.rhs, env, funEnv, builtinFunEnv);
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
     if (!(expr.name in env)) {
       throw new Error(`variable ${expr.name} is not defined`);
     }
     return env[expr.name];

     return env[expr.name];
  } else if(expr instanceof Assignment) {
     const result = eval(expr.expr, env, funEnv, builtinFunEnv);
     env[expr.name] = result;
     return result;
  } else if(expr instanceof Seq) {
     let result = null;
     expr.bodies.forEach((e) => {
        result = eval(e, env, funEnv, builtinFunEnv);
     });
     return result;
  } else if(expr instanceof If) {
     if(eval(expr.cond, env, funEnv, builtinFunEnv) !== 0) {
       return eval(expr.thenExpr, env, funEnv, builtinFunEnv);
     }else {
       return eval(expr.elseExpr, env, funEnv, builtinFunEnv);
     }
  } else if(expr instanceof While) {
     while(eval(expr.cond, env, funEnv, builtinFunEnv) !== 0) {
       eval(expr.body, env, funEnv, builtinFunEnv);
     }
     return 0;
  } else if(expr instanceof FunCall) {
     const def = funEnv[expr.name] || builtinFunEnv[expr.name];
     if(!def) throw `function ${expr.name} is not defined`;

     const args = expr.args.map((a) => eval(a, env, funEnv, builtinFunEnv));

     if (def instanceof BuiltinFun) {
       return def.func(args);
     }

     const newEnv = {}
     for(let i = 0; i < def.args.length; i++) {
       newEnv[def.args[i]] = args[i];
     }
     return eval(def.body, newEnv, funEnv, builtinFunEnv);
  } else {
     console.assert(false, `should not reach here ${expr}`);
  }
}

const program = new Program(
  [
    new FunDef("print_add", ["x", "y"],
      new FunCall("print", 
        new FunCall("add", 
          new FunCall("mul", new VarRef("x"), new VarRef("y")),
          new Num(3)
        )
      )
    )
  ],
  new FunCall("print_add", new Num(5), new Num(3))
);

evalProgram(program);

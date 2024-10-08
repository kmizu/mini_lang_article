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
  }); // 関数定義を登録
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
      //関数名から関数定義本体を引っ張ってくる
     const def = env[expr.name];
     //関数定義が存在しなければ例外を投げる
     if(!def) throw `function ${expr.name} is not defined`;

     //実引数の処理。mapを使うと簡潔に書ける
     const args = expr.args.map((a) => eval(a, env));

     //関数を呼び出すときは、今までの環境を「コピー」して新しい環境を作る
     //これだと動的スコープになるので注意が必要
     const newEnv = Object.assign({}, env);
     //新しい環境で仮引数名 -> 実引数の対応付けを作る
     for(let i = 0; i < def.args.length; i++) {
       newEnv[def.args[i]] = args[i];
     }
     //新しい環境で関数本体を評価して結果を返す
     return eval(def.body, newEnv);
  } else {
     console.assert(false, "should not reach here");
  }
}
const program = new Program(
  // function fact(n) {
  //   return n < 2 ? 1 : n * fact(n - 1)
  // }
  [new FunDef("fact", ["n"],
     // n < 2 ? 1 : n * fact(n - 1)
     new If(
       // n < 2
       new BinExpr("<", new VarRef("n"), new Num(2)),
       // 1
       new Num(1),
       // n * fact(n - 1)
       new BinExpr("*",
          new VarRef("n"),
          new FunCall("fact", new BinExpr("-", new VarRef("n"), new Num(1)))
       )
     )
   )],
  // fact(5)
  new FunCall("fact", new Num(5))
);
console.log("fact(5) = " + evalProgram(program)); // fact(5) = 120

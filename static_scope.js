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
  const funEnv = {};
  let result = null;
  program.defs.forEach((d) => {
    funEnv[d.name] = d;
  }); // 関数定義を登録
  program.expressions.forEach((e) => {
    result = eval(e, env, funEnv);
  });
  return result;
}

function eval(expr, env, funEnv) {
  if(expr instanceof BinExpr) {
    const resultL = eval(expr.lhs, env, funEnv);
    const resultR = eval(expr.rhs, env, funEnv);
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
     const result = eval(expr.expr, env, funEnv);
     env[expr.name] = result;
     return result;
  } else if(expr instanceof Seq) {
     let result = null;
     expr.bodies.forEach((e) => {
        result = eval(e, env, funEnv);
     });
     return result;
  } else if(expr instanceof If) {
     if(eval(expr.cond, env, funEnv) !== 0) {
       return eval(expr.thenExpr, env, funEnv);
     }else {
       return eval(expr.elseExpr, env, funEnv);
     }
  } else if(expr instanceof While) {
     while(eval(expr.cond, env, funEnv) !== 0) {
       eval(expr.body, env, funEnv);
     }
     return 0;
  } else if(expr instanceof FunCall) {
      //関数名から関数定義本体を引っ張ってくる
     const def = funEnv[expr.name];
     console.log(expr.name);
     //関数定義が存在しなければ例外を投げる
     if(!def) throw `function ${expr.name} is not defined`;

     //実引数の処理。mapを使うと簡潔に書ける
     const args = expr.args.map((a) => eval(a, env, funEnv));

     //関数を呼び出すときは、まず空の環境を作る
     const newEnv = {}
     //新しい環境で仮引数名 -> 実引数の対応付けを作る
     for(let i = 0; i < def.args.length; i++) {
       newEnv[def.args[i]] = args[i];
     }
     //新しい環境で関数本体を評価して結果を返す
     return eval(def.body, newEnv, funEnv);
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
                  new Seq(
                    new Assignment("a", new Num(3)),
                    new FunCall("refA")
                  )
          )
  ],
  new FunCall("main")
);
console.log("result  = " + evalProgram(program)); // undefined

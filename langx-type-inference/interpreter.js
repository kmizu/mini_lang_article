// Base Type class
class Type {}

// Primitive types (Number, String, Boolean)
class PrimitiveType extends Type {
  constructor(name) {
    super();
    this.name = name;
  }
}

// Function types
class FunctionType extends Type {
  constructor(paramTypes, returnType) {
    super();
    this.paramTypes = paramTypes; // Array of Type
    this.returnType = returnType; // Type
  }
}

// List type
class ListType extends Type {
  constructor(elementType) {
    super();
    this.elementType = elementType; // Type
  }
}

// Dictionary type
class DictType extends Type {
  constructor(keyType, valueType) {
    super();
    this.keyType = keyType; // Type
    this.valueType = valueType; // Type
  }
}

// Type variable for parametric polymorphism
class TypeVariable extends Type {
  constructor(name) {
    super();
    this.name = name;
  }
}

// Helper functions for type variables
let typeVarCounter = 0;
function freshTypeVariable(prefix = 'T') {
  return new TypeVariable(`${prefix}${typeVarCounter++}`);
}

// Function to reset type variable counter (useful for tests)
function resetTypeVarCounter() {
  typeVarCounter = 0;
}

// Modify FunDef to include parameter types and return type
class FunDef {
  constructor(name, params, returnType, body, typeParams = []) {
    this.name = name;
    this.params = params; // Array of { name: string, type: Type }
    this.returnType = returnType; // Type
    this.body = body;
    this.typeParams = typeParams; // Array of TypeVariable
  }
}

// Base expression class
class Expression {}

// Assignment class
class Assignment extends Expression {
  constructor(name, expr) {
    super();
    this.name = name;
    this.expr = expr;
  }
}

// Binary expression class
class BinExpr extends Expression {
  constructor(operator, lhs, rhs) {
    super();
    this.operator = operator;
    this.lhs = lhs;
    this.rhs = rhs;
  }
}

// Number class (supports integers and decimals)
class Num extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
}

// Variable reference class
class VarRef extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }
}

// Function call class
class FunCall extends Expression {
  constructor(name, ...args) {
    super();
    this.name = name;
    this.args = args;
  }
}

// If expression class
class If extends Expression {
  constructor(cond, thenExpr, elseExpr) {
    super();
    this.cond = cond;
    this.thenExpr = thenExpr;
    this.elseExpr = elseExpr;
  }
}

// While loop class
class While extends Expression {
  constructor(cond, body) {
    super();
    this.cond = cond;
    this.body = body;
  }
}

// Sequence class
class Seq extends Expression {
  constructor(...bodies) {
    super();
    this.bodies = bodies;
  }
}

// List class
class List extends Expression {
  constructor(elements) {
    super();
    this.elements = elements;
  }
}

// String literal class
class StringLit extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
}

// Dictionary class
class Dict extends Expression {
  constructor(entries) {
    super();
    this.entries = entries;
  }
}

// Boolean literal class
class BooleanLit extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
}

// Built-in function class (modified to include types)
class BuiltinFun {
  constructor(name, func, type, typeParams = []) {
    this.name = name;
    this.func = func;
    this.type = type; // FunctionType
    this.typeParams = typeParams; // Array of TypeVariable
  }
}

// Type checking functions
function isTypeEqual(t1, t2) {
  if (t1 instanceof PrimitiveType && t2 instanceof PrimitiveType) {
    return t1.name === t2.name;
  } else if (t1 instanceof TypeVariable && t2 instanceof TypeVariable) {
    return t1.name === t2.name;
  } else if (t1 instanceof ListType && t2 instanceof ListType) {
    return isTypeEqual(t1.elementType, t2.elementType);
  } else if (t1 instanceof DictType && t2 instanceof DictType) {
    return (
      isTypeEqual(t1.keyType, t2.keyType) &&
      isTypeEqual(t1.valueType, t2.valueType)
    );
  } else if (t1 instanceof FunctionType && t2 instanceof FunctionType) {
    if (t1.paramTypes.length !== t2.paramTypes.length) {
      return false;
    }
    for (let i = 0; i < t1.paramTypes.length; i++) {
      if (!isTypeEqual(t1.paramTypes[i], t2.paramTypes[i])) {
        return false;
      }
    }
    return isTypeEqual(t1.returnType, t2.returnType);
  } else {
    return false;
  }
}

function matchTypes(t1, t2, typeSubstitution) {
  if (t1 instanceof TypeVariable) {
    const tvarName = t1.name;
    if (tvarName in typeSubstitution) {
      return matchTypes(typeSubstitution[tvarName], t2, typeSubstitution);
    } else {
      typeSubstitution[tvarName] = t2;
      return true;
    }
  } else if (t2 instanceof TypeVariable) {
    return matchTypes(t2, t1, typeSubstitution);
  } else if (t1 instanceof PrimitiveType && t2 instanceof PrimitiveType) {
    return t1.name === t2.name;
  } else if (t1 instanceof ListType && t2 instanceof ListType) {
    return matchTypes(t1.elementType, t2.elementType, typeSubstitution);
  } else if (t1 instanceof DictType && t2 instanceof DictType) {
    return (
      matchTypes(t1.keyType, t2.keyType, typeSubstitution) &&
      matchTypes(t1.valueType, t2.valueType, typeSubstitution)
    );
  } else if (t1 instanceof FunctionType && t2 instanceof FunctionType) {
    if (t1.paramTypes.length !== t2.paramTypes.length) {
      return false;
    }
    for (let i = 0; i < t1.paramTypes.length; i++) {
      if (!matchTypes(t1.paramTypes[i], t2.paramTypes[i], typeSubstitution)) {
        return false;
      }
    }
    return matchTypes(t1.returnType, t2.returnType, typeSubstitution);
  } else {
    return false;
  }
}

function substituteTypeVariables(type, typeSubstitution) {
  if (type instanceof TypeVariable) {
    const tvarName = type.name;
    if (tvarName in typeSubstitution) {
      return substituteTypeVariables(
        typeSubstitution[tvarName],
        typeSubstitution
      );
    } else {
      return type;
    }
  } else if (type instanceof ListType) {
    const elemType = substituteTypeVariables(
      type.elementType,
      typeSubstitution
    );
    return new ListType(elemType);
  } else if (type instanceof DictType) {
    const keyType = substituteTypeVariables(type.keyType, typeSubstitution);
    const valueType = substituteTypeVariables(type.valueType, typeSubstitution);
    return new DictType(keyType, valueType);
  } else if (type instanceof FunctionType) {
    const paramTypes = type.paramTypes.map((t) =>
      substituteTypeVariables(t, typeSubstitution)
    );
    const returnType = substituteTypeVariables(
      type.returnType,
      typeSubstitution
    );
    return new FunctionType(paramTypes, returnType);
  } else {
    return type;
  }
}

function instantiateFunctionType(funcType, typeParams) {
  const typeSubstitution = {};
  typeParams.forEach((tp) => {
    typeSubstitution[tp.name] = freshTypeVariable(tp.name);
  });
  const instantiatedType = substituteTypeVariables(funcType, typeSubstitution);
  return instantiatedType;
}

function matchFunctionTypes(funcType, argTypes, typeSubstitution) {
  if (funcType.paramTypes.length !== argTypes.length) {
    return false;
  }
  for (let i = 0; i < argTypes.length; i++) {
    if (!matchTypes(funcType.paramTypes[i], argTypes[i], typeSubstitution)) {
      return false;
    }
  }
  return true;
}

function typeCheck(expr, typeEnv, funTypeEnv) {
  if (expr instanceof BinExpr) {
    const leftType = typeCheck(expr.lhs, typeEnv, funTypeEnv);
    const rightType = typeCheck(expr.rhs, typeEnv, funTypeEnv);
    const operator = expr.operator;

    // Type checking for binary expressions
    if (['+', '-', '*', '/', '%'].includes(operator)) {
      if (
        isTypeEqual(leftType, new PrimitiveType('Number')) &&
        isTypeEqual(rightType, new PrimitiveType('Number'))
      ) {
        return new PrimitiveType('Number');
      } else if (
        operator === '+' &&
        isTypeEqual(leftType, new PrimitiveType('String')) &&
        isTypeEqual(rightType, new PrimitiveType('String'))
      ) {
        return new PrimitiveType('String');
      } else if (
        operator === '+' &&
        leftType instanceof ListType &&
        rightType instanceof ListType &&
        isTypeEqual(leftType.elementType, rightType.elementType)
      ) {
        return new ListType(leftType.elementType);
      } else {
        throw new Error(
          `Unsupported operand types for ${operator}: ${leftType.name} and ${rightType.name}`
        );
      }
    } else if (['<', '>', '<=', '>=', '==', '!='].includes(operator)) {
      return new PrimitiveType('Boolean');
    } else {
      throw new Error(`Unsupported operator: ${operator}`);
    }
  } else if (expr instanceof Num) {
    return new PrimitiveType('Number');
  } else if (expr instanceof StringLit) {
    return new PrimitiveType('String');
  } else if (expr instanceof BooleanLit) {
    return new PrimitiveType('Boolean');
  } else if (expr instanceof VarRef) {
    const varType = typeEnv[expr.name] || funTypeEnv[expr.name]?.type;
    if (!varType) {
      throw new Error(`Variable ${expr.name} is not defined`);
    }
    return varType;
  } else if (expr instanceof Assignment) {
    const exprType = typeCheck(expr.expr, typeEnv, funTypeEnv);
    typeEnv[expr.name] = exprType;
    return exprType;
  } else if (expr instanceof Seq) {
    let resultType = null;
    expr.bodies.forEach((e) => {
      resultType = typeCheck(e, typeEnv, funTypeEnv);
    });
    return resultType;
  } else if (expr instanceof If) {
    const condType = typeCheck(expr.cond, typeEnv, funTypeEnv);
    if (!isTypeEqual(condType, new PrimitiveType('Boolean'))) {
      throw new Error('Condition expression must be Boolean');
    }
    const thenType = typeCheck(expr.thenExpr, typeEnv, funTypeEnv);
    const elseType = typeCheck(expr.elseExpr, typeEnv, funTypeEnv);
    if (!isTypeEqual(thenType, elseType)) {
      throw new Error('Types of then and else branches must be the same');
    }
    return thenType;
  } else if (expr instanceof While) {
    const condType = typeCheck(expr.cond, typeEnv, funTypeEnv);
    if (!isTypeEqual(condType, new PrimitiveType('Boolean'))) {
      throw new Error('Condition expression must be Boolean');
    }
    typeCheck(expr.body, typeEnv, funTypeEnv);
    return null;
  } else if (expr instanceof FunCall) {
    const funcInfo = funTypeEnv[expr.name];
    if (!funcInfo) {
      throw new Error(`Function ${expr.name} is not defined`);
    }
    let funcType = funcInfo.type;
    if (funcInfo.typeParams && funcInfo.typeParams.length > 0) {
      funcType = instantiateFunctionType(funcType, funcInfo.typeParams);
    }
    const argTypes = expr.args.map((arg) => typeCheck(arg, typeEnv, funTypeEnv));
    const typeSubstitution = {};
    if (!matchFunctionTypes(funcType, argTypes, typeSubstitution)) {
      throw new Error(`Argument types do not match for function ${expr.name}`);
    }
    const returnType = substituteTypeVariables(
      funcType.returnType,
      typeSubstitution
    );
    return returnType;
  } else if (expr instanceof List) {
    const elemTypes = expr.elements.map((elem) =>
      typeCheck(elem, typeEnv, funTypeEnv)
    );
    const firstElemType = elemTypes[0];
    for (let t of elemTypes) {
      if (!isTypeEqual(t, firstElemType)) {
        throw new Error('All elements of the list must have the same type');
      }
    }
    return new ListType(firstElemType);
  } else if (expr instanceof Dict) {
    const keyTypes = [];
    const valueTypes = [];
    expr.entries.forEach(({ key, value }) => {
      const keyType = typeCheck(key, typeEnv, funTypeEnv);
      const valueType = typeCheck(value, typeEnv, funTypeEnv);
      keyTypes.push(keyType);
      valueTypes.push(valueType);
    });
    const firstKeyType = keyTypes[0];
    const firstValueType = valueTypes[0];
    for (let t of keyTypes) {
      if (!isTypeEqual(t, firstKeyType)) {
        throw new Error('All keys of the dictionary must have the same type');
      }
    }
    for (let t of valueTypes) {
      if (!isTypeEqual(t, firstValueType)) {
        throw new Error('All values of the dictionary must have the same type');
      }
    }
    return new DictType(firstKeyType, firstValueType);
  } else {
    throw new Error(`Unknown expression type: ${expr.constructor.name}`);
  }
}

function typeCheckFunction(def, funTypeEnv) {
  const typeEnv = {};
  def.params.forEach((param) => {
    typeEnv[param.name] = param.type;
  });
  const bodyType = typeCheck(def.body, typeEnv, funTypeEnv);
  if (!isTypeEqual(bodyType, def.returnType)) {
    throw new Error(`Return type mismatch in function ${def.name}`);
  }
}

function typeCheckProgram(program) {
  const typeEnv = {};
  const funTypeEnv = {};

  // Process built-in functions
  Object.keys(builtinFunEnv).forEach((name) => {
    funTypeEnv[name] = builtinFunEnv[name];
  });

  // Process function definitions
  program.defs.forEach((def) => {
    const paramTypes = def.params.map((param) => param.type);
    const funcType = new FunctionType(paramTypes, def.returnType);
    funTypeEnv[def.name] = {
      type: funcType,
      def: def,
      typeParams: def.typeParams,
    };
  });

  // Type check function bodies
  program.defs.forEach((def) => {
    typeCheckFunction(def, funTypeEnv);
  });

  // Type check expressions
  program.expressions.forEach((expr) => {
    typeCheck(expr, typeEnv, funTypeEnv);
  });
}

// The built-in functions with types
const builtinFunEnv = {};

// Reset the type variable counter
resetTypeVarCounter();

// Define built-in functions with types
builtinFunEnv['print'] = new BuiltinFun(
  'print',
  (args) => {
    console.log(...args);
    return args[0];
  },
  new FunctionType([freshTypeVariable('T')], freshTypeVariable('T')),
  [freshTypeVariable('T')]
);

// 'len' :: forall T. (List<T> | String) -> Number
builtinFunEnv['len'] = new BuiltinFun(
  'len',
  (args) => {
    if (args.length !== 1) throw new Error('len expects exactly one argument');
    const arg = args[0];
    if (typeof arg === 'string' || Array.isArray(arg)) {
      return arg.length;
    } else {
      throw new Error('len expects a string or array');
    }
  },
  new FunctionType([freshTypeVariable('T')], new PrimitiveType('Number')),
  [freshTypeVariable('T')]
);

// 'map' :: forall T, U. (List<T>, (T) -> U) -> List<U>
builtinFunEnv['map'] = new BuiltinFun(
  'map',
  (args, env, funEnv, builtinFunEnv) => {
    if (args.length !== 2)
      throw new Error('map expects exactly two arguments');
    const [lst, func] = args;
    if (!Array.isArray(lst))
      throw new Error('map expects an array as the first argument');
    return lst.map((elem) => {
      console.log(func);
      return eval(func, { ...env, [func.func.params[0].name]: elem }, funEnv, builtinFunEnv);
    });
  },
  new FunctionType(
    [
      new ListType(freshTypeVariable('T')),
      new FunctionType([freshTypeVariable('T')], freshTypeVariable('U')),
    ],
    new ListType(freshTypeVariable('U'))
  ),
  [freshTypeVariable('T'), freshTypeVariable('U')]
);

// 'filter' :: forall T. (List<T>, (T) -> Boolean) -> List<T>
builtinFunEnv['filter'] = new BuiltinFun(
  'filter',
  (args, env, funEnv, builtinFunEnv) => {
    if (args.length !== 2)
      throw new Error('filter expects exactly two arguments');
    const [lst, func] = args;
    if (!Array.isArray(lst))
      throw new Error('filter expects an array as the first argument');
    return lst.filter((elem) => {
      return eval(func, { ...env, [func.func.params[0].name]: elem }, funEnv, builtinFunEnv);
    });
  },
  new FunctionType(
    [
      new ListType(freshTypeVariable('T')),
      new FunctionType([freshTypeVariable('T')], new PrimitiveType('Boolean')),
    ],
    new ListType(freshTypeVariable('T'))
  ),
  [freshTypeVariable('T')]
);

// 'reduce' :: forall T, U. (List<T>, (U, T) -> U, U) -> U
builtinFunEnv['reduce'] = new BuiltinFun(
  'reduce',
  (args, env, funEnv, builtinFunEnv) => {
    if (args.length !== 3)
      throw new Error('reduce expects exactly three arguments');
    const [lst, func, initial] = args;
    if (!Array.isArray(lst))
      throw new Error('reduce expects an array as the first argument');
    return lst.reduce((acc, elem) => {
      return eval(
        func,
        { ...env, [func.func.params[0].name]: acc, [func.func.params[1].name]: elem },
        funEnv,
        builtinFunEnv
      );
    }, initial);
  },
  new FunctionType(
    [
      new ListType(freshTypeVariable('T')),
      new FunctionType(
        [freshTypeVariable('U'), freshTypeVariable('T')],
        freshTypeVariable('U')
      ),
      freshTypeVariable('U'),
    ],
    freshTypeVariable('U')
  ),
  [freshTypeVariable('T'), freshTypeVariable('U')]
);

// 'toUpperCase' :: (String) -> String
builtinFunEnv['toUpperCase'] = new BuiltinFun(
  'toUpperCase',
  (args) => {
    if (args.length !== 1)
      throw new Error('toUpperCase expects exactly one argument');
    const str = args[0];
    if (typeof str !== 'string')
      throw new Error('toUpperCase expects a string');
    return str.toUpperCase();
  },
  new FunctionType([new PrimitiveType('String')], new PrimitiveType('String'))
);

// 'split' :: (String, String) -> List<String>
builtinFunEnv['split'] = new BuiltinFun(
  'split',
  (args) => {
    if (args.length !== 2)
      throw new Error('split expects exactly two arguments');
    const [str, separator] = args;
    if (typeof str !== 'string' || typeof separator !== 'string')
      throw new Error('split expects strings as arguments');
    return str.split(separator);
  },
  new FunctionType(
    [new PrimitiveType('String'), new PrimitiveType('String')],
    new ListType(new PrimitiveType('String'))
  )
);

// 'join' :: (List<String>, String) -> String
builtinFunEnv['join'] = new BuiltinFun(
  'join',
  (args) => {
    if (args.length !== 2)
      throw new Error('join expects exactly two arguments');
    const [lst, separator] = args;
    if (!Array.isArray(lst) || typeof separator !== 'string')
      throw new Error('join expects an array and a string');
    return lst.join(separator);
  },
  new FunctionType(
    [new ListType(new PrimitiveType('String')), new PrimitiveType('String')],
    new PrimitiveType('String')
  )
);

// 'keys' :: forall V. (Dict<K, V>) -> List<K>
builtinFunEnv['keys'] = new BuiltinFun(
  'keys',
  (args) => {
    if (args.length !== 1)
      throw new Error('keys expects exactly one argument');
    const obj = args[0];
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj))
      throw new Error('keys expects a dictionary');
    return Object.keys(obj);
  },
  new FunctionType(
    [new DictType(freshTypeVariable('K'), freshTypeVariable('V'))],
    new ListType(freshTypeVariable('K'))
  ),
  [freshTypeVariable('K'), freshTypeVariable('V')]
);

// 'values' :: forall K, V. (Dict<K, V>) -> List<V>
builtinFunEnv['values'] = new BuiltinFun(
  'values',
  (args) => {
    if (args.length !== 1)
      throw new Error('values expects exactly one argument');
    const obj = args[0];
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj))
      throw new Error('values expects a dictionary');
    return Object.values(obj);
  },
  new FunctionType(
    [new DictType(freshTypeVariable('K'), freshTypeVariable('V'))],
    new ListType(freshTypeVariable('V'))
  ),
  [freshTypeVariable('K'), freshTypeVariable('V')]
);

// 'get' :: forall K, V. (Dict<K, V>, K) -> V
builtinFunEnv['get'] = new BuiltinFun(
  'get',
  (args) => {
    if (args.length !== 2)
      throw new Error('get expects exactly two arguments');
    const [obj, key] = args;
    if (typeof obj !== 'object' || obj === null)
      throw new Error('get expects a dictionary as the first argument');
    return obj[key];
  },
  new FunctionType(
    [new DictType(freshTypeVariable('K'), freshTypeVariable('V')), freshTypeVariable('K')],
    freshTypeVariable('V')
  ),
  [freshTypeVariable('K'), freshTypeVariable('V')]
);

// 'hasKey' :: forall K, V. (Dict<K, V>, K) -> Boolean
builtinFunEnv['hasKey'] = new BuiltinFun(
  'hasKey',
  (args) => {
    if (args.length !== 2)
      throw new Error('hasKey expects exactly two arguments');
    const [obj, key] = args;
    if (typeof obj !== 'object' || obj === null)
      throw new Error('hasKey expects a dictionary as the first argument');
    return Object.prototype.hasOwnProperty.call(obj, key);
  },
  new FunctionType(
    [new DictType(freshTypeVariable('K'), freshTypeVariable('V')), freshTypeVariable('K')],
    new PrimitiveType('Boolean')
  ),
  [freshTypeVariable('K'), freshTypeVariable('V')]
);

// 'merge' :: forall K, V. (Dict<K, V>, Dict<K, V>) -> Dict<K, V>
builtinFunEnv['merge'] = new BuiltinFun(
  'merge',
  (args) => {
    if (args.length !== 2)
      throw new Error('merge expects exactly two arguments');
    const [obj1, obj2] = args;
    if (
      typeof obj1 !== 'object' ||
      obj1 === null ||
      typeof obj2 !== 'object' ||
      obj2 === null
    )
      throw new Error('merge expects dictionaries');
    return { ...obj1, ...obj2 };
  },
  new FunctionType(
    [
      new DictType(freshTypeVariable('K'), freshTypeVariable('V')),
      new DictType(freshTypeVariable('K'), freshTypeVariable('V')),
    ],
    new DictType(freshTypeVariable('K'), freshTypeVariable('V'))
  ),
  [freshTypeVariable('K'), freshTypeVariable('V')]
);

// 'and' :: (Boolean, Boolean) -> Boolean
builtinFunEnv['and'] = new BuiltinFun(
  'and',
  (args) => {
    if (args.length !== 2)
      throw new Error('and expects exactly two arguments');
    const [a, b] = args;
    if (typeof a !== 'boolean' || typeof b !== 'boolean')
      throw new Error('and expects booleans');
    return a && b;
  },
  new FunctionType(
    [new PrimitiveType('Boolean'), new PrimitiveType('Boolean')],
    new PrimitiveType('Boolean')
  )
);

// 'or' :: (Boolean, Boolean) -> Boolean
builtinFunEnv['or'] = new BuiltinFun(
  'or',
  (args) => {
    if (args.length !== 2)
      throw new Error('or expects exactly two arguments');
    const [a, b] = args;
    if (typeof a !== 'boolean' || typeof b !== 'boolean')
      throw new Error('or expects booleans');
    return a || b;
  },
  new FunctionType(
    [new PrimitiveType('Boolean'), new PrimitiveType('Boolean')],
    new PrimitiveType('Boolean')
  )
);

// 'not' :: (Boolean) -> Boolean
builtinFunEnv['not'] = new BuiltinFun(
  'not',
  (args) => {
    if (args.length !== 1)
      throw new Error('not expects exactly one argument');
    const [a] = args;
    if (typeof a !== 'boolean')
      throw new Error('not expects a boolean');
    return !a;
  },
  new FunctionType([new PrimitiveType('Boolean')], new PrimitiveType('Boolean'))
);

// The Program class
class Program {
  constructor(defs, ...expressions) {
    this.defs = defs;
    this.expressions = expressions;
  }
}

// The example program with types
const program = new Program(
  [
    // Define a function to double a number
    new FunDef(
      'double',
      [{ name: 'x', type: new PrimitiveType('Number') }],
      new PrimitiveType('Number'),
      new BinExpr('*', new VarRef('x'), new Num(2))
    ),
    // Define a function to check if a number is even
    new FunDef(
      'isEven',
      [{ name: 'x', type: new PrimitiveType('Number') }],
      new PrimitiveType('Boolean'),
      new BinExpr(
        '==',
        new BinExpr('%', new VarRef('x'), new Num(2)),
        new Num(0)
      )
    ),
    // Define a reducer function to sum numbers
    new FunDef(
      'sum',
      [
        { name: 'a', type: new PrimitiveType('Number') },
        { name: 'b', type: new PrimitiveType('Number') },
      ],
      new PrimitiveType('Number'),
      new BinExpr('+', new VarRef('a'), new VarRef('b'))
    ),
  ],
  new Seq(
    // Working with Lists
    new Assignment(
      'numbers',
      new List([new Num(1), new Num(2), new Num(3), new Num(4)])
    ),
    new Assignment(
      'doubledNumbers',
      new FunCall('map', new VarRef('numbers'), new VarRef('double'))
    ),
    new FunCall('print', new VarRef('doubledNumbers')), // Output: [2, 4, 6, 8]
    new Assignment(
      'evenNumbers',
      new FunCall('filter', new VarRef('numbers'), new VarRef('isEven'))
    ),
    new FunCall('print', new VarRef('evenNumbers')), // Output: [2, 4]
    new Assignment(
      'total',
      new FunCall('reduce', new VarRef('numbers'), new VarRef('sum'), new Num(0))
    ),
    new FunCall('print', new VarRef('total')), // Output: 10

    // Working with Strings
    new Assignment('greeting', new StringLit('Hello, World!')),
    new Assignment(
      'uppercaseGreeting',
      new FunCall('toUpperCase', new VarRef('greeting'))
    ),
    new FunCall('print', new VarRef('uppercaseGreeting')), // Output: "HELLO, WORLD!"
    new Assignment(
      'words',
      new FunCall('split', new VarRef('greeting'), new StringLit(', '))
    ),
    new FunCall('print', new VarRef('words')), // Output: ["Hello", "World!"]
    new Assignment(
      'joinedWords',
      new FunCall('join', new VarRef('words'), new StringLit(' - '))
    ),
    new FunCall('print', new VarRef('joinedWords')), // Output: "Hello - World!"

    // Working with Dictionaries
    new Assignment(
      'person',
      new Dict([
        { key: new StringLit('name'), value: new StringLit('Alice') },
        { key: new StringLit('age'), value: new StringLit('30') },
      ])
    ),
    new FunCall('print', new FunCall('keys', new VarRef('person'))), // Output: ["name", "age"]
    new FunCall('print', new FunCall('values', new VarRef('person'))), // Output: ["Alice", 30]
    new FunCall(
      'print',
      new FunCall('get', new VarRef('person'), new StringLit('name'))
    ), // Output: "Alice"
    new FunCall(
      'print',
      new FunCall('hasKey', new VarRef('person'), new StringLit('email'))
    ), // Output: false
    new Assignment(
      'additionalInfo',
      new Dict([
        { key: new StringLit('email'), value: new StringLit('alice@example.com') },
      ])
    ),
    new Assignment(
      'updatedPerson',
      new FunCall('merge', new VarRef('person'), new VarRef('additionalInfo'))
    ),
    new FunCall('print', new VarRef('updatedPerson')),
    // Output: { name: "Alice", age: 30, email: "alice@example.com" }

    // Working with Booleans
    new Assignment('bool1', new BooleanLit(true)),
    new Assignment('bool2', new BooleanLit(false)),
    new FunCall(
      'print',
      new FunCall('and', new VarRef('bool1'), new VarRef('bool2'))
    ), // Output: false
    new FunCall(
      'print',
      new FunCall('or', new VarRef('bool1'), new VarRef('bool2'))
    ), // Output: true
    new FunCall('print', new FunCall('not', new VarRef('bool2'))) // Output: true
  )
);

// Evaluate the program
function evalProgram(program) {
  const env = {};
  const funEnv = { ...builtinFunEnv };
  let result = null;

  // Add user-defined functions to the environment
  program.defs.forEach((d) => {
    const funcType = new FunctionType(
      d.params.map((param) => param.type),
      d.returnType
    );
    funEnv[d.name] = {
      func: d,
      type: funcType,
      typeParams: d.typeParams,
    };
  });

  program.expressions.forEach((e) => {
    result = evalExpr(e, env, funEnv, builtinFunEnv);
  });

  return result;
}

function evalExpr(expr, env, funEnv, builtinFunEnv) {
  if (expr instanceof BinExpr) {
    const resultL = evalExpr(expr.lhs, env, funEnv, builtinFunEnv);
    const resultR = evalExpr(expr.rhs, env, funEnv, builtinFunEnv);
    switch (expr.operator) {
      case '+':
        if (typeof resultL === 'number' && typeof resultR === 'number') {
          return resultL + resultR;
        } else if (typeof resultL === 'string' || typeof resultR === 'string') {
          return String(resultL) + String(resultR);
        } else if (Array.isArray(resultL) && Array.isArray(resultR)) {
          return resultL.concat(resultR);
        } else {
          throw new Error(
            `Unsupported operand types for +: ${typeof resultL} and ${typeof resultR}`
          );
        }
      case '-':
        if (typeof resultL === 'number' && typeof resultR === 'number') {
          return resultL - resultR;
        } else {
          throw new Error(
            `Unsupported operand types for -: ${typeof resultL} and ${typeof resultR}`
          );
        }
      case '*':
        if (typeof resultL === 'number' && typeof resultR === 'number') {
          return resultL * resultR;
        } else {
          throw new Error(
            `Unsupported operand types for *: ${typeof resultL} and ${typeof resultR}`
          );
        }
      case '/':
        if (typeof resultL === 'number' && typeof resultR === 'number') {
          return resultL / resultR;
        } else {
          throw new Error(
            `Unsupported operand types for /: ${typeof resultL} and ${typeof resultR}`
          );
        }
      case '%':
        if (typeof resultL === 'number' && typeof resultR === 'number') {
          return resultL % resultR;
        } else {
          throw new Error(
            `Unsupported operand types for %: ${typeof resultL} and ${typeof resultR}`
          );
        }
      case '<':
        return resultL < resultR;
      case '>':
        return resultL > resultR;
      case '<=':
        return resultL <= resultR;
      case '>=':
        return resultL >= resultR;
      case '==':
        return resultL === resultR;
      case '!=':
        return resultL !== resultR;
      default:
        throw new Error(`Unsupported operator: ${expr.operator}`);
    }
  } else if (expr instanceof Num) {
    return expr.value;
  } else if (expr instanceof StringLit) {
    return expr.value;
  } else if (expr instanceof BooleanLit) {
    return expr.value;
  } else if (expr instanceof VarRef) {
    if (expr.name in env) {
      return env[expr.name];
    } else if (expr.name in funEnv) {
      return funEnv[expr.name];
    } else {
      throw new Error(`Variable ${expr.name} is not defined`);
    }
  } else if (expr instanceof Assignment) {
    const result = evalExpr(expr.expr, env, funEnv, builtinFunEnv);
    env[expr.name] = result;
    return result;
  } else if (expr instanceof Seq) {
    let result = null;
    expr.bodies.forEach((e) => {
      result = evalExpr(e, env, funEnv, builtinFunEnv);
    });
    return result;
  } else if (expr instanceof If) {
    if (evalExpr(expr.cond, env, funEnv, builtinFunEnv)) {
      return evalExpr(expr.thenExpr, env, funEnv, builtinFunEnv);
    } else {
      return evalExpr(expr.elseExpr, env, funEnv, builtinFunEnv);
    }
  } else if (expr instanceof While) {
    while (evalExpr(expr.cond, env, funEnv, builtinFunEnv)) {
      evalExpr(expr.body, env, funEnv, builtinFunEnv);
    }
    return null;
  } else if (expr instanceof FunCall) {
    const funcInfo = funEnv[expr.name];
    if (!funcInfo) throw new Error(`Function ${expr.name} is not defined`);

    const args = expr.args.map((a) => evalExpr(a, env, funEnv, builtinFunEnv));

    if (funcInfo instanceof BuiltinFun) {
      return funcInfo.func(args, env, funEnv, builtinFunEnv);
    } else {
      const def = funcInfo.func;
      const newEnv = {};
      for (let i = 0; i < def.params.length; i++) {
        newEnv[def.params[i].name] = args[i];
      }
      return evalExpr(def.body, newEnv, funEnv, builtinFunEnv);
    }
  } else if (expr instanceof List) {
    return expr.elements.map((e) => evalExpr(e, env, funEnv, builtinFunEnv));
  } else if (expr instanceof Dict) {
    const result = {};
    expr.entries.forEach(({ key, value }) => {
      const evalKey = evalExpr(key, env, funEnv, builtinFunEnv);
      const evalValue = evalExpr(value, env, funEnv, builtinFunEnv);
      result[evalKey] = evalValue;
    });
    return result;
  } else {
    throw new Error(`Unknown expression type: ${expr.constructor.name}`);
  }
}

// First, type check the program
typeCheckProgram(program);

// Then, evaluate the program
evalProgram(program);

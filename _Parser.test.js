/**
* @test
*   @title PunyJS.expression._Parser: iterator in
*/
function expressionParserTest1(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "k in getList()";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"iterator","lookup":{"key":"k"},"operator":"in","collection":{"type":"execution","path":"getList","arguments":[]},"variables":["getList"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: iterator for
*/
function expressionParserTest2(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "k for 10";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"iterator","lookup":{"key":"k"},"operator":"for","collection":{"type":"literal","value":10},"variables":[]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: conditional isin
*/
function expressionParserTest3(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.var1 isin [0, 1, 2]";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"conditional","sideA":{"type":"variable","path":"context.var1"},"operator":"isin","sideB":{"type":"array","members":[{"type":"literal","value":0},{"type":"literal","value":1},{"type":"literal","value":2}]},"variables":["context.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: conditional is
*/
function expressionParserTest4(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.var1 is [object]";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"conditional","sideA":{"type":"variable","path":"context.var1"},"operator":"is","sideB":{"type":"type","value":"object"},"variables":["context.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: variable
*/
function expressionParserTest5(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.var1";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"variable","path":"context.var1","variables":["context.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: bind operation
*/
function expressionParserTest6(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "(context.var1, 'string', 90)=>myFunc";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"bind","path":"myFunc","arguments":[{"type":"variable","path":"context.var1"},{"type":"literal","value":"string"},{"type":"literal","value":90}],"variables":["myFunc","context.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: function execution
*/
function expressionParserTest7(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.myFunc[0]('arg1', state.var1)";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"execution","path":"context.myFunc[0]","arguments":[{"type":"literal","value":"arg1"},{"type":"variable","path":"state.var1"}],"variables":["context.myFunc[0]","state.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: chaining
*/
function expressionParserTest8(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.var1 || state.var1 && myFunc('string')";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"chain","sections":[{"type":"variable","path":"context.var1"},{"type":"logical","value":"||"},{"type":"variable","path":"state.var1"},{"type":"logical","value":"&&"},{"type":"execution","path":"myFunc","arguments":[{"type":"literal","value":"string"}]}],"variables":["context.var1","state.var1","myFunc"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: variable extraction
*/
function expressionParserTest9(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "state.list[context.$mask[state._index]]._display";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree variable should be")
            .value(expressionTree, "variables")
            .stringify()
            .equals('["state._index","context.$mask.$every","context.$mask","state.list.$every._display","state.list.$every","state.list"]')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: regex conditional
*/
function expressionParserTest10(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "app.path.variable isin /[.]path[.]([A-z0-9\-_$]+)([.].+)?$/im";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree variable should be")
            .value(expressionTree, "variables")
            .stringify()
            .equals(`["app.path.variable"]`)
            ;

            test("The expressionTree.sideB.type should be")
            .value(expressionTree, "sideB.type")
            .equals("regex")
            ;

            test("The expressionTree.sideB.pattern should be")
            .value(expressionTree, "sideB.pattern")
            .toString()
            .equals("/[.]path[.]([A-z0-9-_$]+)([.].+)?$/im")
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: regex match
*/
function expressionParserTest11(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "app.path.variable/[.]path[.]([A-z0-9\-_$]+)([.].+)?$/i";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree variable should be")
            .value(expressionTree, "variables")
            .stringify()
            .equals(`["app.path.variable"]`)
            ;

            test("The expressionTree.type should be")
            .value(expressionTree, "type")
            .equals("match")
            ;

            test("The expressionTree.regexp.pattern should be")
            .value(expressionTree, "regexp.pattern")
            .toString()
            .equals("/[.]path[.]([A-z0-9-_$]+)([.].+)?$/i")
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: regex iterator
*/
function expressionParserTest12(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , []
                ]
            );
            expression = "$key,$i,$match in app.path.variable/[.]path[.]([A-z0-9\-_$]+)([.].+)?$/i";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree variables should be")
            .value(expressionTree, "variables")
            .stringify()
            .equals(`["app.path.variable"]`)
            ;

            test("The expression tree type should be")
            .value(expressionTree, "type")
            .equals(`iterator`)
            ;

            test("The expression tree collection should be")
            .value(expressionTree, "collection")
            .stringify()
            .equals(`{"type":"match","value":{"type":"variable","path":"app.path.variable"},"regexp":{"type":"regex","pattern":{}}}`)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: not and not not
*/
function expressionParserTest13(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "!app.path.variable isin /[.]path[.]([A-z0-9\-_$]+)([.].+)?$/im";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expressionTree.variables should be")
            .value(expressionTree, "variables")
            .stringify()
            .equals(`["app.path.variable"]`)
            ;

            test("The expressionTree.not should be")
            .value(expressionTree, "not")
            .equals("!")
            ;

            test("The expressionTree.expression.type should be")
            .value(expressionTree, "expression.type")
            .toString()
            .equals("conditional")
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: concat
*/
function expressionParserTest14(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "ref.parent[ref.index] + '-'+state.title";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("expressionTree should be")
            .value(expressionTree)
            .stringify()
            .equals(`{"type":"operator","operator":"+","expressions":[{"type":"operator","operator":"+","expressions":[{"type":"variable","path":"ref.parent[ref.index]"},{"type":"literal","value":"-"}]},{"type":"variable","path":"state.title"}],"variables":["ref.index","ref.parent.$every","ref.parent","state.title"]}`)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: concat strings with other expression patterns in them
*/
function expressionParserTest15(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "'app.func(-1 && b111)' + `app.variable[1].name` + ''";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("expressionTree should be")
            .value(expressionTree)
            .stringify()
            .equals(`{"type":"operator","operator":"+","expressions":[{"type":"operator","operator":"+","expressions":[{"type":"literal","value":"app.func(-1 && b111)"},{"type":"literal","value":"app.variable[1].name"}]},{"type":"literal","value":""}],"variables":[]}`)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: operators
*/
function expressionParserTest16(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "10**2 + 10 * app.func(app.title) / 100% 2 -app.var1";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("expressionTree should be")
            .value(expressionTree)
            .stringify()
            .equals(`{"type":"operator","operator":"-","expressions":[{"type":"operator","operator":"+","expressions":[{"type":"operator","operator":"**","expressions":[{"type":"literal","value":10},{"type":"literal","value":2}]},{"type":"operator","operator":"%","expressions":[{"type":"operator","operator":"/","expressions":[{"type":"operator","operator":"*","expressions":[{"type":"literal","value":10},{"type":"execution","path":"app.func","arguments":[{"type":"variable","path":"app.title"}]}]},{"type":"literal","value":100}]},{"type":"literal","value":2}]}]},{"type":"variable","path":"app.var1"}],"variables":["app.func","app.title","app.var1"]}`)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.expression._Parser: conditional with string
*/
function expressionParserTest17(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "_myvar === 'test' || _myvar isin ['prod','dev']";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("expressionTree should be")
            .value(expressionTree)
            .stringify()
            .equals(`{"type":"chain","sections":[{"type":"conditional","sideA":{"type":"variable","path":"_myvar"},"operator":"===","sideB":{"type":"literal","value":"test"}},{"type":"logical","value":"||"},{"type":"conditional","sideA":{"type":"variable","path":"_myvar"},"operator":"isin","sideB":{"type":"array","members":[{"type":"literal","value":"prod"},{"type":"literal","value":"dev"}]}}],"variables":["_myvar"]}`)
            ;
        }
    );
}
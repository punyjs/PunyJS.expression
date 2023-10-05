/**
* The expression parser intakes a string expression and returns an abstract syntax tree describing the expression along with a list of variables that are used in the expression.

An expression can be either a conditional statement, returning true/false, an interative statement, returning an iterator object, or a value expression returning the resulting value.

A value expression can be a literal, a variable path, a function execution, or a bind operation.

A literal can be a string `"val"`, a number `1.0`, an array `[10,"",1]`, or an object `{"prop1":"va1"}`

A variable path is a string, without quotes, which is intended to point to an external variable; `context.prop1` or `attributes.hidden`.

A function execution is a variable path followed by parenthised arguments; `context.getSomething("string", state.var1)`.

A bind operation is a parenthised list of arguments, followed by a fat arrow(=>), followed by a variable path that points to a function; `(context.var1, state.var2)=>attributes.myFn`

Additionally, and expression can be a chain of expressions, utilizing the logical "AND" `&&` and logical "OR" `||`; `getHidden($element) || false`.

A conditional has three sections, a left and right side, with an operator in the middle; x == y. Conditional operators include, ==, ===, !=, !==, >, >=, <, <=, is, !is, isin, and !isin.

A loop has three required sections, and several optional parts, the resulting variable name, the word "in" or "for", and an expression that results in an iterable; `key in context.list` or `key,val in getList()`. Additionally, filter and sort sections can be added, as well as a step section for controlling the iteration.

"key in getList(root.var1, [10, 2, 3])"
{
    "variables": ["root.var1","getList"]
    , "type": "loop"
    , "sections": [
        {
            "type": "variable"
            , "value": "key"
        }
        , {
            "type": "operator"
            , "value": "in"
        }
        , {
            "type": "execution"
            , "path": "getList"
            , "arguments": [
                {
                    "type": "variable"
                    , "value": "root.var1"
                }
                , {
                    "type": "literal"
                    , "value": [10, 2, 3]
                }
            ]
        }
    ]
}
* @interface
*   @property {array} varaiables A list of the variables used in the expression
*   @property {object} tree The expression
* @factory
*/
function _Parser(
    utils_eval
    , is_numeric
    , is_string
    , is_nill
    , errors
) {
    /**
    * A regular expression pattern to match literal expressions
    * @property
    */
    const BIND_FUNC_PATT = /^\(([^)]+)\) ?=> ?([A-Za-z0-9$.,"`'\[\]_]+)$/
    /**
    * A regular expression pattern to match object patterns in expressions
    * @property
    */
    , OBJ_PATT = /^\{.*\}$/
    /**
    * A regular expression pattern to match array patterns in expressions
    * @property
    */
    , ARRAY_PATT = /^\[(.*)\]$/
    /**
    * A regular expression pattern to match type patterns in expressions
    * @property
    */
    , TYPE_PATT = /^\[([a-z]+)\]$/
    /**
    * A regular expression pattern for matching the regexp pattern
    * @property
    */
    , REGEXP_PATT = /^(?<!\/)\/(.+)(?<!\/)\/([gimyusd]*)$/
    /**
    * A regular expression pattern for matching a regexp match pattern
    * @property
    */
    , MATCH_PATT = /^([\-A-Za-z0-9$.,()\[\]_\ '"`]+)(?:(?<!\/)\/(.+)(?<!\/)\/([gimyusd]*))$/
    /**
    * A regular expression pattern for matching not and not not
    * @property
    */
    , NOT_PATT = /^([!]{1,2})(.+)$/
    /**
    * A regular expression pattern to match conditional expressions
    * @property
    */
    , COND_PATT =  /^([\-A-Za-z0-9$.,()\[\]_\ '"`<>]+) (is|!is|isin|!isin|==|>|<|!=|>=|<=|!==|===) ([A-z0-9$.,()\[\]_\\ \/\-'"`<>]+|(?<!\/)\/.+(?<!\/)\/[gimyusd]+|"<[0-9]>"|\[(?:[,]?"<[0-9]>")+\])$/i
    /**
    * A regular expression pattern to match iterator expressions
    * @property
    */
    , ITER_PATT = /^([A-Za-z0-9$_]+)(?:, ?([A-Za-z0-9$_]+))?(?:, ?([A-Za-z0-9$_]+))? (in|for) (.+)(?: sort ([A-z0-9$._\[\]]+)(?: (desc|asc))?)?(?: filter (.+))?$/i
    /**
    * A regular expression pattern to match literal expressions
    * @property
    */
    , LITERAL_PATT = /^(?:'[^']*'|"[^"]*"|`[^`]*`|[-]?(?:0b[0-1]+|0x[0-9a-f]+|0o[0-8]+|[0-9]+(?:[.][0-9]+)?(?:e[-]?[0-9]+)?|Infinity)|true|false|null|undefined)$/
    /**
    * A regular expression pattern to match string literal expressions
    * @property
    */
    , STRING_PATT = /(?<![\\])[']((?:[^']|[\\'])*?)(?<![\\])[']|(?<![\\])[`]((?:[^`]|[\`])*?)(?<![\\])[`]|(?<![\\])["]((?:[^"]|[\\"])*?)(?<![\\])["]/g
    /**
    * A regular expression pattern to match string literal placeholders
    * @property
    */
    , STRING_PLACEHOLDER_PATT = /(?<![<\\])[<]([0-9]+)(?<![<\\])[>]/
    /**
    * A regular expression pattern to match string literal placeholders
    * @property
    */
    , OBJ_ARRAY_PLACEHOLDER_PATT = /(?<![<\\])[<]{2}([0-9]+)(?<![<\\])[>]{2}/
    /**
    * A regular expression pattern to split the concat expression
    * @property
    */
    , CONCAT_PATT = /[+]{3}/g
    /**
    * A regular expression pattern to match function patterns in expressions.
    * @property
    */
    , FUNC_PATT = /^([A-Za-z0-9$.,()'"`\[\]_]+) ?\(([^)]+)?\)$/
    /**
    * A regular expression pattern to match logical 'OR' or "AND" expressions
    * @property
    */
    , HAS_AND_OR_PATT = /\&{2}|\|{2}/
    /**
    * A regular expression pattern to split logical 'OR' or "AND" expressions
    * @property
    */
    , SPLIT_AND_OR_PATT = /(.+?) ?(\&{2} ?|\|{2} ?|$)/g
    /**
    * A regular expression pattern to test for a variable path
    * @property
    */
    , VAR_PATT = /^[A-z0-9._$\[\]"'`\<\>]+$/
    /**
    * A regular expression pattern to replace array or oject patterns
    * @property
    */
    , ARRAY_OBJ_PATT = /((?:\[(.*)\])|(?:\{.*\}))/g
    /**
    * A regular expression pattern to replace indexer patterns
    * @property
    */
    , INDXR_PATT = /\[(.+)\]/g
    /**
    * A regular expression pattern to find operators
    * @property
    */
    , OPERATOR_PATT = /(?<![\\])(?:[+\-*/%&|~^]|[*]{2}|[>]{2}|[<]{2}|[>]{3})(?![ ]*[=])/
    /**
    * A list of operators in reverse order of precendence
    * @field
    */
    , operatorPrecedence = {
        ">>>": /(?<![\\])[>]{3}/
        , ">>": /(?<![\\])[>]{2}(?![>])/
        , "<<": /(?<![\\])[<]{2}/
        , "-": /(?<![\\])[-]/
        , "+": /(?<![\\])[+]/
        , "%": /(?<![\\])[%]/
        , "/": /(?<![\\])[\/]/
        , "*": /(?<![\\*])[*](?![*])/
        , "**":  /(?<![\\])[*]{2}/
    }
    ;

    return Parser;

    /**
    * @worker
    */
    function Parser(expressionStr) {
        var variables = []
        //a container to hold the string literals
        , strings = []
        //remove string literals so we don't match anything in their contents
        , strippedExpressionStr = expressionStr.replace(
            STRING_PATT
            , removeStrings.bind(
                null
                , strings
            )
        );
        return parse(
            variables
            , strings
            , strippedExpressionStr
        );
    }

    /**
    * @function
    */
    function removeStrings(strings, match, value1, value2, value3, value4) {
        var value = !is_nill(value1)
            ? value1
            : !is_nill(value2)
                ? value2
                : !is_nill(value3)
                    ? value3
                    : null
        , index = strings.length
        ;
        strings.push(
            value
        );
        return `"<${index}>"`;
    }
    /**
    * @function
    */
    function parse(variables, strings, strippedExpressionStr) {
        var exprTree;
        //first step is to split any "||" or "&&"
        if (strippedExpressionStr.match(HAS_AND_OR_PATT)) {
            exprTree = splitLogical(
                variables
                , strings
                , strippedExpressionStr
            );
        }
        //otherwise just parse the expression
        else {
            exprTree = parseExpression(
                variables
                , strings
                , strippedExpressionStr
            );
        }
        //add the variables to the expression tree
        exprTree.variables = variables;

        return exprTree;
    }
    /**
    * @function
    */
    function splitLogical(variables, strings, expressionStr) {
        var tree = {
            "type": "chain"
            , "sections": []
        };

        expressionStr.replace(
            SPLIT_AND_OR_PATT
            , function replace(match, expr, logical) {
                tree.sections.push(
                    parseExpression(
                        variables
                        , strings
                        , expr.trim()
                    )
                );
                tree.sections.push(
                    {
                        "type": "logical"
                        , "value": logical.trim()
                    }
                );
            }
        );

        //if the last member is a logical, then remove it
        if (tree.sections[tree.sections.length - 1].type === "logical") {
            tree.sections.pop();
        }

        return tree;
    }
    /**
    * @function
    */
    function parseExpression(variables, strings, expressionStr) {
        var match;
        //see if this has a concatination operation
        if (expressionStr.match(CONCAT_PATT)) {
            return parseConcat(
                variables
                , strings
                , expressionStr
            );
        }
        //see if this is an iterator
        else if (!!(match = expressionStr.match(ITER_PATT))) {
            return parseIterator(
                variables
                , strings
                , match
            );
        }
        //maybe a conditional statement
        else if (!!(match = expressionStr.match(COND_PATT))) {
            return parseConditional(
                variables
                , strings
                , match
            );
        }
        //perhaps a regexp match
        else if (!!(match = expressionStr.match(MATCH_PATT))) {
            return parseRegExpMatch(
                variables
                , strings
                , match[1]
                , match[2]
                , match[3]
            );
        }
        //maybe a not pattern
        else if (!!(match = expressionStr.match(NOT_PATT))) {
            return parseNot(
                variables
                , strings
                , match[1]
                , match[2]
            );
        }
        //otherwise its a value expression
        else {
            return parseValueExpression(
                variables
                , strings
                , expressionStr
            );
        }
    }
    /**
    * @function
    */
    function parseConditional(variables, strings, match) {
        var typeMatch
        , treeNode = {
            "type": "conditional"
            , "sideA": parseExpression(
                variables
                , strings
                , match[1]
            )
            , "operator": match[2]
        };

        if ((typeMatch = match[3].match(TYPE_PATT))) {
            treeNode.sideB = {
                "type": "type"
                , "value": typeMatch[1]
            };
        }
        else {
            treeNode.sideB = parseExpression(
                variables
                , strings
                , match[3]
            );
        }

        return treeNode;
    }
    /**
    * @function
    */
    function parseIterator(variables, strings, match) {
        var treeNode = {
            "type": "iterator"
            , "lookup": {
                "key": match[1]
            }
            , "operator": match[4]
            , "collection": parseExpression(
                variables
                , strings
                , match[5]
            )
        };
        if (!!match[2]) {
            treeNode.lookup.value = match[2];
        }
        if (!!match[3]) {
            treeNode.lookup.index = match[3];
        }
        if (!!match[6]) {
            treeNode.sort = {
                "by": match[6]
                , "direction": match[7] || "asc"
            }
        }
        if (!!match[8]) {
            treeNode.filter = parseExpression(
                match[8]
                , strings
                , context
            );
        }
        if (!!match[9]) {
            treeNode.step = is_numeric(match[9])
                && parseInt(match[9])
                || 1
            ;
        }

        return treeNode;
    }
    /**
    * @function
    */
    function parseValueExpression(variables, strings, expressionStr) {
        var match, expr, res;
        //remove any leading or trailing whitespace
        expressionStr = expressionStr.trim();
        //see if this is a literal
        if (LITERAL_PATT.test(expressionStr)) {
            if ((match = expressionStr.match(STRING_PLACEHOLDER_PATT))) {
                expressionStr = `"${strings[match[1]]}"`;
            }
            return {
                "type": "literal"
                , "value": expressionStr === "undefined"
                    ? undefined
                    : utils_eval(expressionStr) //eval so string delimiters are removed
            };
        }
        //not a literal, should be a data value
        else {
            //see if this is a function
            if (!!(match = expressionStr.match(FUNC_PATT))) {
                return parsefunc(
                    variables
                    , strings
                    , match
                );
            }
            //or an array literal
            else if (!!(match = expressionStr.match(ARRAY_PATT))) {
                return parseArray(
                    variables
                    , strings
                    , match[1]
                );
            }
            //or a bind operation
            else if(!!(match = expressionStr.match(BIND_FUNC_PATT))) {
                return parseBindFunc(
                    variables
                    , strings
                    , match
                );
            }
            //or an object literal
            else if (!!(match = expressionStr.match(OBJ_PATT))) {
                return parseObject(
                    variables
                    , strings
                    , match[0]
                );
            }
            //or regular expressions
            else if (!!(match = expressionStr.match(REGEXP_PATT))) {
                return parseRegExp(
                    variables
                    , match[1]
                    , match[2]
                );
            }
            //see if this has any operators in it
            else if (expressionStr.match(OPERATOR_PATT)) {
                return parseOperator(
                    variables
                    , strings
                    , expressionStr
                );
            }
            //or a varaible path
            else if (!!expressionStr.match(VAR_PATT)) {
                addVariables(
                    variables
                    , expressionStr
                );
                return {
                    "type": "variable"
                    , "path": expressionStr
                };
            }
            else {
                throw new Error(
                    `${errors.expression.invalid_expression} ("${expressionStr}")`
                );
            }
        }
    }
    /**
    * @function
    */
    function parsefunc(variables, strings, match) {
        var treeNode = {
            "type": "execution"
            , "path": match[1]
            , "arguments": []
        }
        , args = extractArguments(
            match[2]
        )
        ;
        //add the function name/path to the variables
        addVariables(
            variables
            , match[1]
        );
        args.forEach(
            function parseEachArg(arg) {
                var expr = parseExpression(
                    variables
                    , strings
                    , arg
                );
                treeNode.arguments.push(
                    expr
                );
            }
        );

        return treeNode;
    }
    /**
    * @function
    */
    function parseBindFunc(variables, strings, match) {
        var treeNode = {
            "type": "bind"
            , "path": match[2]
            , "arguments": []
        }
        , args = extractArguments(
            match[1]
        )
        ;
        addVariables(
            variables
            , treeNode.path
        );
        //parse the arguments
        args.forEach(
            function parseEachArg(arg) {
                var expr = parseExpression(
                    variables
                    , strings
                    , arg
                );
                treeNode.arguments.push(
                    expr
                );
            }
        );

        return treeNode;
    }
    /**
    * @function
    */
    function extractArguments(expression) {
        if (!expression) {
            return [];
        }
        //split out anything with commas in it
        var parts = {}, cnt = 0
        , exprNoObjNoArray = expression.replace(
            ARRAY_OBJ_PATT
            , function replaceArray(match, obj) {
                var name = `<<${++cnt}>>`;
                parts[name] = obj;
                return name;
            }
        )
        , args = exprNoObjNoArray.split(",")
        ;
        //loop through the args and update any replaced parts
        return args
        .map(
            function mapArgs(arg) {
                arg = arg.trim();
                arg = arg.replace(
                    OBJ_ARRAY_PLACEHOLDER_PATT
                    , function replacePlacholder(match) {
                        return parts[match];
                    }
                );
                return arg;
            }
        );
    }
    /**
    * @function
    */
    function parseArray(variables, strings, value) {
        var arrayMemebers = value.split(",")
        , treeNode = {
            "type": "array"
            , "members": []
        };

        //loop through the members, parsing each one
        arrayMemebers.forEach(
            function forEachMember(memberStr) {
                var expr = parseExpression(
                    variables
                    , strings
                    , memberStr
                );
                treeNode.members.push(
                    expr
                );
            }
        )

        return treeNode;

    }
    /**
    * @function
    */
    function parseObject(variables, strings, json) {
        var valueObj = JSON.parse(json)
        , treeNode = {
            "type": "object"
            , "properties": {}
        };
        //process the object properties, they could be expressions also
        Object.keys(valueObj)
        .forEach(
            function forEachKey(key) {
                var value = valueObj[key]
                , keyIndex = key.match(STRING_PLACEHOLDER_PATT)[1]
                , propMatch = value.match(STRING_PLACEHOLDER_PATT)
                , propIndex = !!propMatch
                    && propMatch[1]
                , propName = strings[keyIndex]
                , propValue = !!propMatch
                    ? strings[propIndex]
                    : value
                , expr
                ;
                expr = parse(
                    variables
                    , strings
                    , propValue
                );
                treeNode.properties[propName] = expr;
            }
        );

        return treeNode;
    }
    /**
    * @function
    */
    function parseRegExpMatch(variables, strings, lookup, pattern, flags) {
        var treeNode = {
            "type": "match"
            , "value": parseValueExpression(
                variables
                , strings
                , lookup
            )
            , "regexp": parseRegExp(
                variables
                , pattern
                , flags
            )
        };

        return treeNode;
    }
    /**
    * @function
    */
    function parseRegExp(variables, regExp, flags) {
        var treeNode = {
            "type": "regex"
            , "pattern": new RegExp(regExp, flags)
        };

        return treeNode;
    }
    /**
    * @function
    */
    function parseNot(variables, strings, not, expressionStr) {
        var treeNode = {
            "type": "not"
            , "not": not
            , "expression": parseExpression(
                variables
                , strings
                , expressionStr
            )
        };

        return treeNode;
    }
    /**
    * @function
    */
    function parseConcat(variables, strings, expressionStr) {
        var treeNode = {
            "type": "concat"
            , "expressions": expressionStr
                .split(CONCAT_PATT)
                .map(
                    parseExpression.bind(
                        null
                        , variables
                        , strings
                    )
                )
        };

        return treeNode;
    }
    /**
    * @function
    */
    function parseOperator(variables, strings, expressionStr) {
        //find the operator with the highest precendent
        var operator =
            Object.keys(operatorPrecedence)
            .find(
                function findOperator(op) {
                    var regExp = operatorPrecedence[op];
                    return expressionStr.match(regExp);
                }
            )
        , opIndex = expressionStr.lastIndexOf(operator)
        //create the tree node
        , treeNode = {
            "type": "operator"
            , "operator": operator
            //split the expression by the highest order operator
            , "expressions":
                [
                    expressionStr
                        .substring(0, opIndex)
                        .trim()
                    , expressionStr
                        .substring(opIndex + operator.length)
                        .trim()
                ]
                .map(
                    parseExpression.bind(
                        null
                        , variables
                        , strings
                    )
                )
        };

        return treeNode;
    }
    /**
    * @function
    */
    function addVariables(variables, variableStr) {
        //if there are brackets see if the contents are a varaible
        var mainVar = variableStr.replace(
            INDXR_PATT
            , replaceIndexer.bind(
                null
                , variables
            )
        )
        ;
        //if the result of updating indexers makes a different string, use that
        if (mainVar !== variableStr) {
            variables.push(mainVar);
            //add a variable for each $every segment
            mainVar.split(".")
            .forEach(
                function forEachPart(part, index, parts) {
                    if (part === "$every") {
                        //add the variable with the every
                        addVariable(
                            variables
                            , parts
                            .slice(0, index + 1)
                            .join(".")
                        );
                        //add the variable without the $every
                        addVariable(
                            variables
                            , parts
                            .slice(0, index)
                            .join(".")
                        );
                    }
                }
            );
        }
        else {
            addVariable(
                variables
                , variableStr
            );
        }
    }
    /**
    * @function
    */
    function replaceIndexer(variables, match, indexer) {
        if (`${indexer}`.match(LITERAL_PATT)) {
            return match;
        }
        addVariables(
            variables
            , indexer
        );
        return ".$every";
    }
    /**
    * @function
    */
    function addVariable(variables, value) {
        if (variables.indexOf(value) === -1) {
            variables.push(
                value
            );
        }
    }
}
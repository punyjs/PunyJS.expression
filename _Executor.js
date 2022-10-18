/**
*
* @factory
*/
function _Executor(
    utils_getType
    , utils_reference
    , utils_regExp
    , is_func
    , is_object
    , is_array
    , is_numeric
    , is_regexp
    , errors
) {

    return Executor;

    /**
    * @worker
    */
    function Executor(expressionTree, context, options) {
        return handleType(
            expressionTree
            , context
            , options
        );
    }

    /**
    * @function
    */
    function handleType(treeNode, context, options) {
        switch(treeNode.type) {
            case "chain":
                return handleChain(
                    treeNode
                    , context
                    , options
                );
                break;
            case "conditional":
                return handleConditional(
                    treeNode
                    , context
                    , options
                );
                break;
            case "iterator":
                return handleIterator(
                    treeNode
                    , context
                    , options
                );
                break;
            case "literal":
                return treeNode.value;
                break;
            case "variable":
                return handleVariable(
                    treeNode
                    , context
                    , options
                );
                break;
            case "execution":
                return handleExecution(
                    treeNode
                    , context
                    , options
                );
                break;
            case "bind":
                return handleBind(
                    treeNode
                    , context
                    , options
                );
                break;
            case "array":
                return handleArray(
                    treeNode
                    , context
                    , options
                );
                break;
            case "object":
                return handleObject(
                    treeNode
                    , context
                    , options
                );
                break;
            case "type":
                return treeNode.value;
                break;
            case "regex":
                return treeNode.pattern;
                break;
            case "match":
                return handleMatch(
                    treeNode
                    , context
                    , options
                );
                break;
            case "not":
                return handleNot(
                    treeNode
                    , context
                    , options
                );
                break;
            case "concat":
                return handleConcat(
                    treeNode
                    , context
                    , options
                );
                break;
            case "operator":
                return handleOperator(
                    treeNode
                    , context
                    , options
                );
                break;
            default:
                throw new Error(
                    `${errors.expression.invalid_expression_type} (${treeNode.type})`
                );
                break;
        }
    }
    /**
    * @function
    */
    function handleChain(treeNode, context, options) {
        var lastResult, hasResult = false, operator;
        //loop through the sections
        treeNode.sections
        .every(
            function forEachSection(section) {
                var result;
                if (section.type === "logical") {
                    operator = section.value;
                    return true;
                }
                //if there is an OR operator, check the result
                if (hasResult && !!lastResult && operator === "||") {
                    //if the result is truthy then stop the loop
                    return false;
                }
                else {
                    result = handleType(
                        section
                        , context
                        , options
                    );
                    hasResult = true;
                }
                if (!!operator) {
                    if (operator === "&&") {
                        lastResult = lastResult && result;
                    }
                    else {
                        lastResult = result;
                    }
                }
                else {
                    lastResult = result;
                }
                return true;
            }
        );

        return lastResult;
    }
    /**
    * @function
    */
    function handleConditional(treeNode, context, options) {
        var sideA = handleType(
            treeNode.sideA
            , context
            , options
        )
        , sideB = handleType(
            treeNode.sideB
            , context
            , options
        )
        , op = treeNode.operator
        ;
        switch(op) {
            case "==":
                return sideA == sideB;
                break;
            case "===":
                return sideA === sideB;
                break;
            case "!=":
                return sideA != sideB;
                break;
            case "!==":
                return sideA !== sideB;
                break;
            case ">":
                return sideA > sideB;
                break;
            case ">=":
                return sideA >= sideB;
                break;
            case "<":
                return sideA < sideB;
                break;
            case "<=":
                return sideA <= sideB;
                break;
            case "is":
                return utils_getType(sideA) === sideB;
                break;
            case "!is":
                return utils_getType(sideA) !== sideB;
                break;
            case "isin":
                //if sideB is an object then see if the sideA value is in it
                if (is_object(sideB)) {
                    return sideA in sideB;
                }
                //if the sideB is regex then return if sideA matches the pattern
                else if (is_regexp(sideB)) {
                    return !!sideA.match(sideB);
                }
                //otherwise return if sideA has an index in sideB
                else {
                    return sideB.indexOf(sideA) !== -1
                }
                break;
            case "!isin":
                if (is_object(sideB)) {
                    return !(sideA in sideB);
                }
                //if the sideB is regex then return if sideA matches the pattern
                else if (is_regexp(sideB)) {
                    return !sideA.match(sideB);
                }
                else {
                    return sideB.indexOf(sideA) === -1
                }
                break;
            default:
                throw new Error(
                    `${errors.ui.gui.exception.invalid_operator} (${op})`
                );
                break;
        }
    }
    /**
    * @function
    */
    function handleIterator(treeNode, context, options) {
        var result = handleType(
            treeNode.collection
            , context
            , options
        )
        , set = treeNode.operator === "in"
            ? result
            : createCollection(
                result
            )
        , sort = !!treeNode.sort
            && treeNode.sort.by
        , dir = !!treeNode.sort
            && treeNode.sort.direction
        , filter = treeNode.filter
        , step = is_numeric(treeNode.step)
            ? parseInt(treeNode.step)
            : 1
        , coll = filterCollection(
            set
            , filter
            , treeNode.lookup
            , context
            , options
        )
        , keys = Object.keys(coll)
        , indx = 0
        ;
        //sort if we have a sort
        if (!!sort) {
            keys.sort(
                function sortKeys(k1, k2) {
                    var k1Val = sort === treeNode.lookup.key && k1
                        || sort === treeNode.lookup.index && keys.indexOf(k1)
                        || sort === treeNode.lookup.value && coll[k1]
                        || utils_reference(sort, coll[k1]).value
                    , k2Val = sort === treeNode.lookup.key && k2
                        || sort === treeNode.lookup.index && keys.indexOf(k2)
                        || sort === treeNode.lookup.value && coll[k2]
                        || utils_reference(sort, coll[k2]).value
                    ;
                    if (k1Val < k2Val) {
                        return dir === "asc" && -1 || 1;
                    }
                    if (k1Val > k2Val) {
                        return dir === "asc" && 1 || -1;
                    }
                    return 1;
                }
            );
        }
        //if the step is negative then reverse the order
        if (step < 0) {
            indx = keys.length - 1;
        }
        //create the iterator
        return Object.create(null, {
            "lookup": {
                "enumerable": true
                , "get": function () { return treeNode.lookup; }
            }
            , "keys": {
                "enumerable": true
                , "get": function () { return keys; }
            }
            , "index": {
                "enumerable": true
                , "get": function () { return indx; }
            }
            , "length": {
                "enumerable": true
                , "get" : function () { return keys.length; }
            }
            , "collection": {
                "enumerable": true
                , "get": function () { return coll; }
            }
            , "next": {
                "enumerable": true
                , "value": function next() {
                    if (indx < keys.length && indx >= 0) {
                        var key = keys[indx]
                        , data = Object.create(context)
                        ;
                        data[treeNode.lookup.key] = key;
                        !!treeNode.lookup.index
                            && (data[treeNode.lookup.index] = indx)
                        ;
                        !!treeNode.lookup.value
                            && (data[treeNode.lookup.value] = coll[key])
                        ;
                        indx+=step;
                        return data;
                    }
                }
            }
        });
    }
    /**
    * @function
    */
    function handleMatch(treeNode, context, options) {
        var value = handleType(
            treeNode.value
            , context
            , options
        )
        , matches = utils_regExp.getMatches(
            treeNode.regexp.pattern
            , value
        );

        return matches;
    }
    /**
    * Filters the collection or array
    * @function
    */
    function createCollection(count) {
        var coll = new Array(count).fill("");
        return coll.map(
            function mapColl(val, indx) {
                return `${indx}`;
            }
        );
    }
    /**
    * Filters the collection or array
    * @function
    */
    function filterCollection(coll, filter, vars, context, options) {
        if (!!coll && !!filter) {
            var keys = Object.keys(coll)
            , isAr = is_array(coll)
            , filtered = isAr && [] || {}
            ;

            keys.forEach(
                function forEachKey(key, indx) {
                    //create a new object with context as the proto
                    var data = Object.create(context)
                    , result
                    ;
                    //add the vars anvalues to the new object
                    data[vars.key] = key;
                    !!vars.index
                        && (data[vars.index] = indx)
                    ;
                    !!vars.value
                        && (data[vars.value] = coll[key])
                    ;
                    //resolve the
                    result = handleType(
                        filter
                        , data
                        , options
                    );

                    if (!!result) {
                        isAr && filtered.push(coll[key]) ||
                            (filtered[key] = coll[key]);
                    }
                }
            );

            return filtered;
        }
        return coll;
    }
    /**
    * @function
    */
    function handleVariable(treeNode, context, options) {
        var ref = utils_reference(
            treeNode.path
            , context
        );
        if (!ref.found) {
            //if this is a quiet fail then return undefined
            if (!!options && options.quiet === true) {
                return undefined;
            }
            throw new Error(
                `${errors.expression.variable_not_found} ("${treeNode.path}")`
            );
        }
        return ref.value;
    }
    /**
    * @function
    */
    function handleExecution(treeNode, context, options) {
        var fnRef = utils_reference(
            treeNode.path
            , context
        )
        , fn = fnRef.found
            && fnRef.value
        , args = treeNode.arguments
        .map(function mapArg(arg) {
            return handleType(
                arg
                , context
                , options
            );
        });
        if (!fnRef.found) {
            throw new Error(
                `${errors.expression.function_not_found} (${treeNode.path})`
            );
        }
        if(!is_func(fn)) {
            throw new Error(
                `${errors.expression.function_invalid} (${treeNode.path} ${typeof fn})`
            );
        }
        //execute the function
        return fn.apply(null, args);
    }
    /**
    * @function
    */
    function handleBind(treeNode, context, options) {
        var fnRef = utils_reference(
            treeNode.path
            , context
        )
        , fn = fnRef.found
            && fnRef.value
        , args = treeNode.arguments
        .map(
            function mapArg(arg) {
                return handleType(
                    arg
                    , context
                    , options
                );
            }
        );
        if (!fnRef.found) {
            throw new Error(
                `${errors.expression.function_not_found} (${treeNode.path})`
            );
        }
        if(!is_func(fn)) {
            throw new Error(
                `${errors.expression.function_invalid} (${treeNode.path} ${typeof fn})`
            );
        }
        return fn.bind.apply(fn, [null].concat(args));
    }
    /**
    * @function
    */
    function handleArray(treeNode, context, options) {
        return treeNode.members
        .map(
            function mapMember(member) {
                return handleType(
                    member
                    , context
                    , options
                );
            }
        );
    }
    /**
    * @function
    */
    function handleObject(treeNode, context, options) {
        var obj = {};

        Object.keys(treeNode.properties)
        .forEach(
            function forEachProperty(key) {
                var property = treeNode.properties[key]
                , result = handleType(
                    property
                    , context
                    , options
                );
                obj[key] = result;
            }
        );

        return obj;
    }
    /**
    * @function
    */
    function handleNot(treeNode, context, options) {
        var exprResults = handleType(
            treeNode.expression
            , context
            , options
        );

        if (treeNode.not === "!!") {
            return !!exprResults;
        }
        return !exprResults;
    }
    /**
    * @function
    */
    function handleConcat(treeNode, context, options) {
        var results = treeNode
            .expressions
            .map(
                function mapExpressionResult(expression) {
                    return handleType(
                        expression
                        , context
                        , options
                    );
                }
            )
        , concatedValue
        ;
        //loop through the results, adding each to the value
        results.forEach(
            function concatEachResult(result) {
                if (concatedValue === undefined) {
                    concatedValue = result;
                }
                else if (is_array(concatedValue)) {
                    concatedValue = concatedValue.concat(
                        result
                    );
                }
                else if (is_array(result)) {
                    concatedValue = [concatedValue]
                    .concat(
                        result
                    );
                }
                else {
                    concatedValue+= result;
                }
            }
        );

        return concatedValue;
    }
    /**
    * @function
    */
    function handleOperator(treeNode, context, options) {
        //execute the expressions
        var resultA = handleType(
            treeNode.expressions[0]
            , context
            , options
        )
        , resultB = handleType(
            treeNode.expressions[1]
            , context
            , options
        );
        //execute the operator
        switch(treeNode.operator) {
            case "**":
                return resultA ** resultB;
                break;
            case "*":
                return resultA * resultB;
                break;
            case "/":
                return resultA / resultB;
                break;
            case "%":
                return resultA % resultB;
                break;
            case "-":
                return resultA - resultB;
                break;
            case "+":
                if (is_array(resultA)) {
                    return resultA.concat(resultB);
                }
                else if (is_array(resultB)) {
                    return [resultA].concat(resultB);
                }
                return resultA + resultB;
                break;
            case "<<":
                return resultA << resultB;
                break;
            case ">>":
                return resultA >> resultB;
                break;
            case ">>>":
                return resultA >>> resultB;
                break;
        }
    }
}
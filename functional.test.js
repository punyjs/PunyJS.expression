/**
* @test
*   @title PunyJS.expression: functional test
*/
function expressionFunctionalTest(
    controller
    , mock_callback
) {
    var createExpression, state
    , expression1, expression2, expression3, expression4
    , result1, result2
    ;

    arrange(
        async function arrangeFn() {
            createExpression = await controller(
                [
                    ".expression.interface"
                ]
            );
            state = {
                "path1": {
                    "value1": "Kung"
                    , "value2": "Foo"
                }
                , "path2": {
                    "array1": [1, 2, 3]
                    , "array2": [5, 6, 7]
                    , "num1": 0
                    , "num2": 4
                }
            };
        }
    );

    act(
        function actFn() {
            expression1 = createExpression(
                "'Do you like '+++ path1.value1 +++' '+++ path1.value2 +++'?'"
            );
            result1 = expression1.execute(
                state
            );

            expression2 = createExpression(
                "path2.num1 +++ path2.array1 +++ 'b111' +++path2.num2 +++ path2.array2"
            );
            result2 = expression2.execute(
                state
            );
        }
    );

    assert(
        function assertFn(test) {
            test("result1 should be")
            .value(result1)
            .equals('Do you like Kung Foo?')
            ;

            test("result2 should be")
            .value(result2)
            .stringify()
            .equals('[0,1,2,3,"b111",4,5,6,7]')
            ;
        }
    );
}
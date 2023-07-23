package evaluator

import (
	"lang/ast"
	"lang/object"
)

var (
	NULL  = &object.Null{}
	TRUE  = &object.Boolean{Value: true}
	FALSE = &object.Boolean{Value: false}
)

func Eval(node ast.Node) object.Object {
	switch node := node.(type) {
	// Statements
	case *ast.Program:
		return evalStatements(node.Statements)
	case *ast.ExpressionStatement:
		return Eval(node.Expression)
	// Expressions
	case *ast.IntegerLiteral:
		return &object.Integer{Value: node.Value}
	case *ast.FloatLiteral:
		return &object.Float{Value: node.Value}
	case *ast.Boolean:
		return nativeBoolToBooleanObject(node.Value)
	case *ast.PrefixExpression:
		right := Eval(node.Right)
		return evalPrefixExpression(node.Operator, right)
	case *ast.InfixExpression:
		left := Eval(node.Left)
		right := Eval(node.Right)
		return evalInfixExpression(node.Operator, left, right)
	}

	return nil
}

func evalStatements(stmts []ast.Statement) object.Object {
	var result object.Object
	for _, statement := range stmts {
		result = Eval(statement)
	}
	return result
}

func nativeBoolToBooleanObject(input bool) *object.Boolean {
	if input {
		return TRUE
	}
	return FALSE
}

func evalPrefixExpression(operator string, right object.Object) object.Object {
	switch operator {
	case "!":
		return evalBangOperatorExpression(right)
	case "-":
		return evalMinusPrefixOperatorExpression(right)
	default:
		return NULL
	}
}

func evalBangOperatorExpression(right object.Object) object.Object {
	switch right {
	case TRUE:
		return FALSE
	case FALSE:
		return TRUE
	case NULL:
		return TRUE
	default:
		return FALSE
	}
}

func evalMinusPrefixOperatorExpression(right object.Object) object.Object {
	rightType := right.Type()
	switch rightType {
	case object.INTEGER_OBJ:
		value := right.(*object.Integer).Value
		return &object.Integer{Value: -value}
	case object.FLOAT_OBJ:
		value := right.(*object.Float).Value
		return &object.Float{Value: -value}
	default:
		return NULL
	}
}

func evalIntegerInfixExpression(
	operator string,
	leftVal, rightVal int64,
) object.Object {
	switch operator {
	case "+":
		return &object.Integer{Value: leftVal + rightVal}
	case "-":
		return &object.Integer{Value: leftVal - rightVal}
	case "*":
		return &object.Integer{Value: leftVal * rightVal}
	case "/":
		return &object.Integer{Value: leftVal / rightVal}
	default:
		return NULL
	}
}

func evalFloatInfixExpression(
	operator string,
	leftVal, rightVal float64,
) object.Object {
	switch operator {
	case "+":
		return &object.Float{Value: leftVal + rightVal}
	case "-":
		return &object.Float{Value: leftVal - rightVal}
	case "*":
		return &object.Float{Value: leftVal * rightVal}
	case "/":
		return &object.Float{Value: leftVal / rightVal}
	default:
		return NULL
	}
}

func evalInfixExpression(
	operator string,
	left, right object.Object,
) object.Object {
	isLeftInteger := left.Type() == object.INTEGER_OBJ
	isRightInteger := right.Type() == object.INTEGER_OBJ
	isLeftNumber := isLeftInteger || left.Type() == object.FLOAT_OBJ
	isRightNumber := isRightInteger || right.Type() == object.FLOAT_OBJ

	switch {
	case isLeftInteger && isRightInteger:
		leftVal := left.(*object.Integer).Value
		rightVal := right.(*object.Integer).Value
		return evalIntegerInfixExpression(operator, leftVal, rightVal)
	case isLeftNumber && isRightNumber:
		leftVal := getFloatNumber(left)
		rightVal := getFloatNumber(right)
		return evalFloatInfixExpression(operator, leftVal, rightVal)
	default:
		return NULL
	}
}

func getFloatNumber(number object.Object) float64 {
	if number.Type() == object.INTEGER_OBJ {
		return float64(number.(*object.Integer).Value)
	}
	return number.(*object.Float).Value
}

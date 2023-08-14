package ast

type ModifierFunc func(Node) Node

func Modify(node Node, modifier ModifierFunc) Node {
	switch node := node.(type) {
	case *Program:
		for i, statement := range node.Statements {
			stmt, ok := Modify(statement, modifier).(Statement)
			if !ok {
				return nil
			}
			node.Statements[i] = stmt
		}
	case *ExpressionStatement:
		expr, ok := Modify(node.Expression, modifier).(Expression)
		if !ok {
			return nil
		}
		node.Expression = expr
	case *InfixExpression:
		left, lOk := Modify(node.Left, modifier).(Expression)
		if !lOk {
			return nil
		}
		node.Left = left
		right, rOk := Modify(node.Right, modifier).(Expression)
		if !rOk {
			return nil
		}
		node.Right = right
	case *PrefixExpression:
		right, ok := Modify(node.Right, modifier).(Expression)
		if !ok {
			return nil
		}
		node.Right = right
	case *IndexExpression:
		left, lOk := Modify(node.Left, modifier).(Expression)
		if !lOk {
			return nil
		}
		node.Left = left
		index, iOk := Modify(node.Index, modifier).(Expression)
		if !iOk {
			return nil
		}
		node.Index = index
	case *IfExpression:
		condition, ifOk := Modify(node.Condition, modifier).(Expression)
		if !ifOk {
			return nil
		}
		node.Condition = condition
		consequence, elseOK := Modify(node.Consequence, modifier).(*BlockStatement)
		if !elseOK {
			return nil
		}
		node.Consequence = consequence
		if node.Alternative != nil {
			alternative, altOk := Modify(node.Alternative, modifier).(*BlockStatement)

			if !altOk {
				return nil
			}
			node.Alternative = alternative
		}
	case *BlockStatement:
		for i := range node.Statements {
			stmt, ok := Modify(node.Statements[i], modifier).(Statement)
			if !ok {
				return nil
			}
			node.Statements[i] = stmt
		}
	case *ReturnStatement:
		returnValue, ok := Modify(node.ReturnValue, modifier).(Expression)
		if !ok {
			return nil
		}
		node.ReturnValue = returnValue
	case *LetStatement:
		value, ok := Modify(node.Value, modifier).(Expression)
		if !ok {
			return nil
		}
		node.Value = value
	case *FunctionLiteral:
		for i := range node.Parameters {
			param, ok := Modify(node.Parameters[i], modifier).(*Identifier)
			if !ok {
				return nil
			}
			node.Parameters[i] = param
		}
		body, ok := Modify(node.Body, modifier).(*BlockStatement)
		if !ok {
			return nil
		}
		node.Body = body
	case *ArrayLiteral:
		for i := range node.Elements {
			elem, ok := Modify(node.Elements[i], modifier).(Expression)
			if !ok {
				return nil
			}
			node.Elements[i] = elem
		}
	case *HashLiteral:
		newPairs := make(map[Expression]Expression)
		for key, val := range node.Pairs {
			newKey, keyOk := Modify(key, modifier).(Expression)
			if !keyOk {
				return nil
			}
			newVal, valOk := Modify(val, modifier).(Expression)
			if !valOk {
				return nil
			}
			newPairs[newKey] = newVal
		}
		node.Pairs = newPairs
	}

	return modifier(node)
}

package object

func NewEnclosedEnvironment(outer *Environment) *Environment {
	env := NewEnvironment()
	env.outer = outer
	return env
}

func NewEnvironment() *Environment {
	s := make(map[string]Object)
	return &Environment{store: s, outer: nil}
}

type Environment struct {
	store map[string]Object
	outer *Environment
}

func (e *Environment) Get(name string) (Object, bool) {
	obj, ok := e.store[name]
	if !ok && e.outer != nil {
		obj, ok = e.outer.Get(name)
	}
	return obj, ok
}

func (e *Environment) GetEnv(name string) (*Environment, bool) {
	_, ok := e.store[name]
	var env *Environment
	if ok {
		env = e
	}
	if !ok && e.outer != nil {
		_, ok = e.outer.Get(name)
		if ok {
			env = e.outer
		}
	}
	return env, ok
}

func (e *Environment) GetCurrScope(name string) (Object, bool) {
	obj, ok := e.store[name]
	return obj, ok
}

func (e *Environment) Set(name string, val Object) Object {
	e.store[name] = val
	return val
}

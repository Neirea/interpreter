package repl

import (
	"bufio"
	"fmt"
	"io"
	"lang/evaluator"
	"lang/lexer"
	"lang/object"
	"lang/parser"
)

const PROMPT = ">> "

func Start(in io.Reader, out io.Writer) {
	scanner := bufio.NewScanner(in)
	env := object.NewEnvironment()
	for {
		fmt.Fprintf(out, "%v", PROMPT)
		scanned := scanner.Scan()
		if !scanned {
			return
		}
		line := scanner.Text()
		l := lexer.New(line)
		p := parser.New(l)

		program := p.ParseProgram()
		if len(p.Errors()) != 0 {
			printReplParserErrors(out, p.Errors())
			continue
		}
		evaluated := evaluator.Eval(program, env)
		if evaluated != nil {
			io.WriteString(out, evaluated.Inspect())
			io.WriteString(out, "\n")
		}

	}
}

func printReplParserErrors(out io.Writer, errors []parser.ParseError) {
	io.WriteString(out, " parser errors:\n")
	for _, err := range errors {
		io.WriteString(out, "\t"+err.Message+"\n")
	}
}

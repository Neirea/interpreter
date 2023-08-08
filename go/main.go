package main

import (
	"flag"
	"fmt"
	"lang/evaluator"
	"lang/lexer"
	"lang/object"
	"lang/parser"
	"lang/repl"
	"os"
	"os/user"
)

func main() {
	user, err := user.Current()
	if err != nil {
		panic(err)
	}
	fmt.Printf("Hello %s! This is the Monkey programming language!\n",
		user.Username)
	fmt.Printf("Feel free to type in commands\n")

	fileFlag := flag.String("f", "", "File path")
	flag.Parse()

	if len(os.Args) < 2 {
		repl.Start(os.Stdin, os.Stdout)
	} else {
		switch os.Args[1] {
		case "-f":
			HandleFileExecute(fileFlag)
		default:
			fmt.Println("Expected a valid subcommand")
			os.Exit(1)
		}
	}
}

func HandleFileExecute(f *string) {
	if !isValidFilePath(*f) {
		fmt.Println("Expected a valid file path")
		return
	}
	data, err := os.ReadFile(*f)
	if err != nil {
		return
	}
	env := object.NewEnvironment()
	l := lexer.New(string(data))
	p := parser.New(l)
	program := p.ParseProgram()
	if len(p.Errors()) != 0 {
		repl.PrintParserErrors(os.Stdout, p.Errors())
		return
	}
	evaluated := evaluator.Eval(program, env)
	if evaluated != nil {
		fmt.Println(evaluated.Inspect())
	}
}

func isValidFilePath(filePath string) bool {
	_, err := os.Stat(filePath)
	return !os.IsNotExist(err)
}

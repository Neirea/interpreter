package main

import (
	"flag"
	"fmt"
	"io"
	"lang/evaluator"
	"lang/lexer"
	"lang/object"
	"lang/parser"
	"lang/repl"
	"os"
	"os/user"
)

func main() {
	fileFlag := flag.String("f", "", "File path")
	flag.Parse()

	if len(*fileFlag) > 0 {
		if isValidFilePath(*fileFlag) {
			HandleFileExecute(fileFlag)
		} else {
			fmt.Printf("File '%s' not found\n", *fileFlag)
			os.Exit(1)
		}
		return
	}
	// Check for other flags or arguments
	otherFlags := flag.Args()
	if len(otherFlags) > 0 {
		fmt.Println("Unexpected flags or arguments:", otherFlags)
		os.Exit(1)
	}
	user, err := user.Current()
	if err != nil {
		panic(err)
	}
	fmt.Printf("Hello %s! This is the Monkey programming language!\n",
		user.Username)
	fmt.Printf("Feel free to type in commands\n")
	repl.Start(os.Stdin, os.Stdout)
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
		printFileParserErrors(os.Stdout, p.Errors())
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

func printFileParserErrors(out io.Writer, errors []parser.ParseError) {
	io.WriteString(out, " parser errors:\n")
	for _, err := range errors {
		io.WriteString(out, "\tLine "+fmt.Sprint(err.Line)+": "+err.Message+"\n")
	}
}

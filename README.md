# Monkey language interpreter

[Monkey](https://monkeylang.org) interpreter with new features in Golang and Typescript
based on Thorsten Ball's book [Writing an Interpreter in Go](https://interpreterbook.com/).

## Base Features

-   Integers, booleans, strings, arrays, hash maps
-   Arithmetic expressions
-   Variables
-   Conditionals
-   First-class and higher-order functions
-   Closures
-   Recursion
-   Built-in functions
-   Macros

## Additional features

-   **for** and **while** loops
-   **break** to stop the current loop within the scope
-   Variable scopes for **if**, **for** and **while** blocks
-   Assign existing variables without keywords **let**
-   Execute code from files via CLI command
-   Line number in error message for parser and evaluator
-   Float numbers (INT + FLOAT = FLOAT, INT + INT = INT)
-   Allow numbers in identifiers
-   Mandatory semicolon for expression statements
-   Add items to hashmap via **add** built-in function
-   LTE(<=),GTE(>=) operators
-   Fixed bug: "!0" now evaluates correctly to TRUE

## Usage

### Golang

-   run from cli: `go run main.go`
-   run from file: `go run main.go -f "file_name"`

### Typescript

-   run from cli: `npm run start:repl`
-   run from file: `npx ts-node src/index.ts -f "file_name"`

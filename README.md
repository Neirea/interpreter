# Monkey language interpreter

Written and improved in Go and Typescript.
Based on Thorsten Ball's book "Writing An Interpreter In Go".

## Usage

### Golang:

-   run from cli: go run main.go
-   run from file: go run main.go -f "file_name"

### Typescript:

-   run from cli: npm run start:repl
-   run from file: npx ts-node src/index.ts -f "file_name"

## Addedional features:

-   Execute code from files via CLI command
-   Line number in error message for parser and evaluator
-   Float numbers (INT + FLOAT = FLOAT, INT + INT = INT)
-   Allow numbers in identifiers
-   Mandatory semicolon for statements except for functions and if statements
-   LTE(<=),GTE(>=) operators
-   Fixed bug: "!0" now evaluates correctly to TRUE

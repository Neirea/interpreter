import readline from "readline";
import { Lexer } from "../lexer";

const rs = readline.createInterface({
    input: process.stdin,
});

rs.on("line", (input) => {
    const lexer = new Lexer(input);

    while (true) {
        const token = lexer.nextToken();
        console.log(token);
        if (token.Type === "EOF") {
            break;
        }
    }
});

# dep-checker

_A library dependency analysis tool_

In a nutshell, this program figures out which software libraries depend on which other software libraries. The app is a simple interface to interact with a library dependency calculator.

The calculator takes as input the immediate dependencies for various libraries (that is, which libraries import which other libraries), and produces as output the full set of dependencies for those libraries.

To see the algorithm "codified", check out [`src/dep-checker.js`](https://github.com/davidhartsough/dep-checker/blob/master/src/dep-checker.js).

## Input validation criteria

- This tool will only parse text files (.txt) or text field input.
- It will evaluate the text the text line by line but only parse the lines that match the specific format of `[library name] depends on [dependencies]`, where…
  - Any library name or dependent library name must be alphanumeric, although it can contain the symbols: `$`, `@`, `_`, or `-`. Additionally, the library name cannot begin with a number.
  - The dependencies listed must be separated by a space.

Ex: `A depends on X Y Z`, where `A` is the name of the library and `X`, `Y`, and `Z` are the names of the libraries that `A` depends on.

## Testing

Besides using the web app itself to test this dependency checker, you can programmatically test the core function itself at [`src/dep-checker.test.js`](https://github.com/davidhartsough/dep-checker/blob/master/src/dep-checker.test.js).

If you clone this repo and install its modules (`yarn` or `npm i`), you can run Jest tests on the algorithm from within the project directory via `yarn test` (or `npm run test`). The command will launch the test runner in its interactive watch mode. This automatically runs the test file, which will test the core dependency checker functionality on various examples, demonstrating everything from easy to complex inputs and outputs.

---

### Origins

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

(However, the underlying dependency calculator code itself has no dependencies, unironically.)

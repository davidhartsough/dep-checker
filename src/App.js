import React, { useState, useRef } from "react";
import { processDepsInText } from "./dep-checker";
import "./App.css";

/**
 * Parses the text of a file and returns it.
 * @param {Blob} file - A submitted text file (.txt)
 * @returns {Promise<string>} Resolves with the parsed string. Rejects with an error message string.
 */
function parseFile(file) {
  return new Promise(function (resolve, reject) {
    // Try to use the latest Blob.text() web API method.
    if (typeof file.text === "function") {
      return file.text().then(resolve).catch(reject);
    }
    // Fallback on FileReader if the browser doesn't support the newer method.
    const reader = new FileReader();
    reader.onload = ({ target }) => resolve(target.result);
    reader.onerror = () => reject(reader.error.message);
    reader.readAsText(file);
  });
}

export default function App() {
  const [input, setInput] = useState(null);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInput = useRef(null);
  const handleChange = ({ target }) => setTextInput(target.value);
  function reset() {
    setInput(null);
    setOutput(null);
    setError(null);
  }
  function handleText(text) {
    try {
      const data = processDepsInText(text);
      setInput(data.input);
      setOutput(data.output);
    } catch ({ message }) {
      setError(message);
    }
  }
  function onFileSubmit(event) {
    event.preventDefault();
    reset();
    const file = fileInput.current.files[0];
    if (!file) return setError("Whoops. Please upload a text file.");
    setLoading(true);
    parseFile(file)
      .then((text) => {
        handleText(text);
        setLoading(false);
      })
      .catch(() => {
        setError("There was an error parsing the file.");
        setLoading(false);
      });
  }
  function onTextSubmit() {
    reset();
    if (textInput.length < 14) {
      return setError(
        "Please enter at least one dependency listing in the text area field."
      );
    }
    handleText(textInput);
  }
  return (
    <>
      <header>
        <h1>dep-checker</h1>
        <h2>library dependency analysis</h2>
      </header>
      <div className="sections">
        <section>
          <h3>Introduction</h3>
          <p>
            Given a text input, this program will list all of the libraries
            involved and their dependencies.
          </p>
          <div className="examples">
            <div className="example">
              <p>For example, if an input text files reads:</p>
              <pre>
                {`X depends on Y R
Y depends on Z`}
              </pre>
            </div>
            <div className="example">
              <p>Then the expected output would be:</p>
              <pre>
                {`X depends on Y R Z
Y depends on Z`}
              </pre>
            </div>
          </div>
          <p>
            Each line must follow this format. Any library or dependency must be
            alphanumeric but can contain the symbols: <code>$</code>,{" "}
            <code>@</code>, <code>_</code>, or <code>-</code>. Also, library
            names cannot begin with a number.
          </p>
          <ul>
            <li>
              <a href="./input.txt" target="_blank">
                View the sample text file
              </a>
            </li>
            <li>
              <a
                href="https://github.com/davidhartsough/dep-checker"
                target="_blank"
                rel="noopener noreferrer"
              >
                View the source code on GitHub
              </a>
            </li>
          </ul>
        </section>
        <section>
          <h3>Test it out</h3>
          <div className="forms">
            <form onSubmit={onFileSubmit} className="form">
              <fieldset>
                <legend>Upload a text file</legend>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept=".txt"
                    ref={fileInput}
                    size="40"
                    className="file-upload"
                  />
                </div>
                <button type="submit" disabled={loading}>
                  Submit
                </button>
              </fieldset>
            </form>
            <p className="divider">Or</p>
            <div className="form">
              <fieldset>
                <legend>Enter library dependencies</legend>
                <textarea
                  wrap="hard"
                  value={textInput}
                  placeholder={`A depends on B C
B depends on C E
C depends on G
D depends on A F
E depends on F
F depends on H`}
                  onChange={handleChange}
                />
                <button onClick={onTextSubmit}>Submit</button>
              </fieldset>
            </div>
          </div>
        </section>
      </div>
      <footer>
        {loading ? (
          <div className="loader" />
        ) : (
          <>
            {input && (
              <section>
                <h3>Input</h3>
                <pre>{input}</pre>
              </section>
            )}
            {output && (
              <section>
                <h3>Output</h3>
                <pre>{output}</pre>
              </section>
            )}
            {error && (
              <section>
                <p className="error">{error}</p>
              </section>
            )}
          </>
        )}
      </footer>
    </>
  );
}

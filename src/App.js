import React, { useState, useRef } from "react";
import { handleFile, getFullDepDataFromText } from "./dep-checker";
import "./App.css";

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
    setLoading(true);
  }
  function handleResolve(data) {
    setInput(data.input);
    setOutput(data.output);
    setLoading(false);
  }
  function handleReject(error) {
    setError(error);
    setLoading(false);
  }
  function onFileSubmit(event) {
    event.preventDefault();
    reset();
    const file = fileInput.current.files[0];
    handleFile(file).then(handleResolve).catch(handleReject);
  }
  function onTextSubmit() {
    reset();
    try {
      const data = getFullDepDataFromText(textInput);
      handleResolve(data);
    } catch ({ message }) {
      handleReject(message);
    }
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
            <code>@</code>, <code>_</code>, or <code>-</code>.
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
                <button type="submit">Submit</button>
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

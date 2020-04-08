/**
 * Gets the names of the primary libraries defined with an array of dependencies in a dependency list.
 * @param {string[]} depList - An array of strings that are each a library dependency listing.
 * @returns {string[]} An array of library names.
 * @throws {Error} Throws a generic Error object if a library is defined twice.
 */
function getLibsFromDepList(depList) {
  // Get the names of the primary libraries by pulling the first "word" from each line in the list.
  const libs = depList.map((line) => line.substring(0, line.indexOf(" ")));
  // Check for duplicate library listings.
  if (new Set(libs).size !== libs.length) {
    throw Error(
      "Invalid dependency data: There is a duplicate library dependency listing."
    );
  }
  return libs;
}

/**
 * Breaks down a list of dependency listings into a structured object.
 * @param {string[]} depList - An array of strings that are each a library dependency listing.
 * @returns {Object.<string, string[]>} Dependency data structured as: {"lib": ["dep","dep"]}
 * @throws {Error} Throws a generic Error object if a library depends on itself.
 */
function getDepDataFromDepList(depList) {
  const depData = {};
  depList.forEach((line) => {
    const words = line.split(" ");
    // Remove potential duplicates.
    depData[words[0]] = [...new Set(words.slice(3))];
    // Check for a cyclical dependency.
    if (depData[words[0]].includes(words[0])) {
      throw Error("Invalid dependency data: A library depends on itself.");
    }
  });
  return depData;
}

/**
 * Given an initial input dependency listing, calculate the complete dependency graph for all libraries.
 * @param {Object.<string, string[]>} inputDepData - Dependency data structured as {"lib": ["dep","dep"]}
 * @param {string[]} [libraries] - An array of library names
 * @returns {Object.<string, string[]>} Complete dependency graph structured as: {"lib": ["dep", "dep"]}
 */
function getFullDepGraph(inputDepData, libraries) {
  const libs = libraries || Object.keys(inputDepData);
  // Start with the given dependency data as a base.
  const outputDepData = inputDepData;
  // Adds the dependencies to the library's list,
  // and recursively grabs dependencies of those dependencies.
  function recursiveAdd(lib, deps) {
    deps.forEach((dep) => {
      // Ignore a cyclical dependency.
      if (dep === lib) return;
      // Add the dependencies only if it has not already been added.
      if (!outputDepData[lib].includes(dep)) {
        outputDepData[lib].push(dep);
      }
      // See if the dependency has its own dependency list.
      const index = libs.indexOf(dep);
      if (index >= 0) {
        // If so, pull its dependency list,
        // and filter to only the ones that haven't been added yet.
        const depsToAdd = inputDepData[libs[index]].filter(
          (dependency) => !outputDepData[lib].includes(dependency)
        );
        // Repeat this process unless all the dependencies have already been added.
        if (depsToAdd.length > 0) {
          recursiveAdd(lib, depsToAdd);
        }
      }
    });
  }
  Object.entries(inputDepData).forEach(([lib, deps]) => {
    recursiveAdd(lib, deps);
  });
  return outputDepData;
}

/**
 * Converts a given dependency data structure into a formatted multiline string.
 * @param {Object.<string, string[]>} depData - Dependency data structured as: {"lib": ["dep","dep"]}
 * @returns {string} The formatted multiline string outlining the libraries and their dependencies.
 * Each line is formatted as: "lib depends on dep dep dep"
 */
function depDataToString(depData) {
  return Object.entries(depData)
    .map(([lib, deps]) => `${lib} depends on ${deps.join(" ")}`)
    .join("\n");
}

/**
 * Given a multiline string input, checks for a list of formatted library dependencies,
 * and returns an outline of all of the libraries and their complete dependency list.
 * @param {string[]} depList - An array of strings that are each a library dependency listing.
 * @returns {string} The full, formatted dependency list as a multiline string.
 * @throws {Error} Throws generic Error objects if the dependency data is invalid.
 */
function checkDependencies(depList) {
  const libs = getLibsFromDepList(depList);
  const inputDepData = getDepDataFromDepList(depList);
  const outputDepData = getFullDepGraph(inputDepData, libs);
  return depDataToString(outputDepData);
}

// RegEx pattern for a single line defining a library and its dependencies.
const linePattern = /^[A-Za-z_$@][A-Za-z0-9@$_-]* depends on [A-Za-z_$@][A-Za-z0-9@$ _-]*$/;

/**
 * Retrieves the lines of the given text which are a dependency listing.
 * @param {string} text - The full input text data as a string.
 * @returns {string[]} An array of strings, each being a single line defining a library's dependencies.
 * @throws {Error} Throws Error objects if the input text has no listings or isn't formatted correctly.
 */
function getDepListFromText(text) {
  // Check to see if there are any dependencies listed at all.
  if (!text.includes(" depends on ")) {
    throw Error("Invalid input: No dependencies listed.");
  }
  // Get only the lines with a dependency listing.
  const list = text.split(/\r?\n/).filter((line) => linePattern.test(line));
  // If nothing matched the RegEx, then the input has invalid formatting.
  if (list.length < 1) {
    throw Error("Invalid input: Please check the dependency list formatting.");
  }
  return list;
}

/**
 * @typedef Response
 * @type {Object}
 * @property {string} input - A multiline string of only the dependency listings from the text file.
 * @property {string} output - The resulting dependency list.
 */
/**
 * Parses the text input, checks the input's dependency list, and returns a data response object
 * containing both the parsed input dependency list and the calculated output as a complete
 * library dependency graph formatted to a multiline string.
 * @param {string} text - Submitted text input as a string
 * @returns {Response} Returns a Response object
 * @throws {Error} Throws generic Error objects if the input is invalid.
 */
export function getFullDepDataFromText(text) {
  const list = getDepListFromText(text);
  const output = checkDependencies(list);
  return { input: list.join("\n"), output };
}

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

/**
 * Parses a submitted text file (.txt), checks the input's dependency list,
 * and returns a data response containing both the parsed input dependency list
 * and the output as a complete library dependency graph as a multiline string.
 * @param {Blob} file - A submitted text file (.txt)
 * @returns {Promise<Response|string>} Resolves with a Response object,
 * or rejects with an error message string.
 */
export function handleFile(file) {
  return new Promise(function (resolve, reject) {
    parseFile(file)
      .then((text) => {
        try {
          const data = getFullDepDataFromText(text);
          resolve(data);
        } catch ({ message }) {
          reject(message);
        }
      })
      .catch(reject);
  });
}

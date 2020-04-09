/**
 * Tests a line of text to see if it is a valid definition of a library dependency listing.
 * @example
 * // returns true
 * isDepListingLine("A depends on B");
 * @param {string} line - a line from the initial text input
 * @returns {boolean}
 */
function isDepListingLine(line) {
  const linePattern = /^[A-Za-z_$@][A-Za-z0-9@$_-]* depends on [A-Za-z_$@][A-Za-z0-9@$ _-]*$/;
  return linePattern.test(line);
}

/**
 * Retrieves the lines of the given text which are a dependency listing.
 * @example
 * // returns ["A depends on B", "B depends on C D"]
 * getDepListingsFromText("A depends on B\nB depends on C D\nOther line");
 * @param {string} text - The full input text data as a string.
 * @returns {string[]} An array of strings, each being a single line defining a library's dependencies.
 * @throws {Error} Throws Error objects if the input text has no listings or isn't formatted correctly.
 */
function getDepListingsFromText(text) {
  if (!text.includes(" depends on ")) {
    throw Error("Invalid input: No dependencies listed.");
  }
  const depListings = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(isDepListingLine);
  if (depListings.length < 1) {
    throw Error("Invalid input: Please check the dependency list formatting.");
  }
  return depListings;
}

/**
 * Checks the names of the primary libraries defined for any duplicate listings.
 * @example
 * validateDepListingsAreUnique(["A depends on B", "B depends on C D"]);
 * @param {string[]} depList - An array of strings that are each a library dependency listing.
 * @throws {Error} Throws a generic Error object if a library is defined twice.
 */
function validateDepListingsAreUnique(depList) {
  const definedLibraries = depList.map((line) =>
    line.substring(0, line.indexOf(" "))
  );
  if (new Set(definedLibraries).size !== definedLibraries.length) {
    throw Error(
      "Invalid dependency data: There is a duplicate library dependency listing."
    );
  }
}

/**
 * Breaks down a list of dependency listings into a structured object.
 * @example
 * // returns { "A": ["B"], "B": ["C", "D"] }
 * createDepStructureFromDepListings(["A depends on B", "B depends on C D"]);
 * @param {string[]} depListings - Each item in the array must be a library dependency listing.
 * @returns {Object.<string, string[]>} Dependency data structured as: {"lib": ["dep","dep"]}
 * @throws {Error} Throws a generic Error object if a library depends on itself.
 */
function createDepStructureFromDepListings(depListings) {
  const depStructure = {};
  depListings.forEach((line) => {
    const words = line.split(" ");
    const libraryName = words[0];
    const dependencies = [...new Set(words.slice(3))];
    if (dependencies.includes(libraryName)) {
      throw Error(
        "Invalid dependency data: A library directly depends on itself."
      );
    }
    depStructure[libraryName] = dependencies;
  });
  return depStructure;
}

/**
 * Generates the fully expanded dependency structure for all libraries listed in
 * the given input dependency data structure.
 * @example
 * // returns { "A": ["B", "C", "D"], "B": ["C", "D"] }
 * expandDepStructure({ "A": ["B"], "B": ["C", "D"] });
 * @param {Object.<string, string[]>} inputDepStructure - The input dependency data structure
 * @returns {Object.<string, string[]>} The fully expanded dependency structure
 */
function expandDepStructure(inputDepStructure) {
  const libraries = Object.keys(inputDepStructure);
  const outputDepStructure = inputDepStructure;
  // Adds the dependencies to the library's dependency list,
  // and recursively grabs the dependencies of those dependencies.
  function recursiveAdd(lib, deps) {
    deps.forEach((dep) => {
      // Ignore a cyclical dependency.
      if (dep === lib) return;
      if (!outputDepStructure[lib].includes(dep)) {
        outputDepStructure[lib].push(dep);
      }
      // See if the dependency has its own dependency list.
      const index = libraries.indexOf(dep);
      if (index >= 0) {
        // Get the dep's dependency list and filter to only the ones that haven't been added yet.
        const depsToAdd = inputDepStructure[libraries[index]].filter(
          (dependency) => !outputDepStructure[lib].includes(dependency)
        );
        // Repeat this process unless all the dependencies have already been added.
        if (depsToAdd.length > 0) {
          recursiveAdd(lib, depsToAdd);
        }
      }
    });
  }
  Object.entries(inputDepStructure).forEach(([lib, deps]) => {
    recursiveAdd(lib, deps);
  });
  return outputDepStructure;
}

/**
 * Converts a given dependency data structure into a formatted multiline string.
 * @example
 * // returns "A depends on B C D\nB depends on C D"
 * depStructureToString({ "A": ["B", "C", "D"], "B": ["C", "D"] });
 * @param {Object.<string, string[]>} depData - Dependency data structured as: {"lib": ["dep","dep"]}
 * @returns {string} The formatted multiline string outlining the libraries and their dependencies.
 */
function depStructureToString(depData) {
  return Object.entries(depData)
    .map(([lib, deps]) => `${lib} depends on ${deps.join(" ")}`)
    .join("\n");
}

/**
 * @typedef ResponseData
 * @type {Object}
 * @property {string} input - A multiline string of only the dependency listings from input text.
 * @property {string} output - A multiline string of the fully expanded dependency listings.
 */
/**
 * Given a multiline string input, parses the text input, gets the library dependency listings,
 * and returns a data response object that contains both the parsed input dependency listings
 * and the calculated output as a fully expanded library dependency graph formatted to a string.
 * @example
 * // returns { input: "A depends on B\nB depends on C", output: "A depends on B C\nB depends on C" }
 * processDepsInText("A depends on B\nB depends on C\nOther line");
 * @param {string} text - The submitted text input as a string.
 * @returns {ResponseData} A ResponseData package that defines the input and output.
 * @throws {Error} Throws generic Error objects if the input is invalid.
 */
export function processDepsInText(text) {
  const depListings = getDepListingsFromText(text);
  validateDepListingsAreUnique(depListings);
  const inputDepStructure = createDepStructureFromDepListings(depListings);
  const outputDepStructure = expandDepStructure(inputDepStructure);
  return {
    input: depListings.join("\n"),
    output: depStructureToString(outputDepStructure),
  };
}

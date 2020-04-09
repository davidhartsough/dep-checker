import { getFullDepDataFromText } from "./dep-checker";

test("basic", () => {
  const basicInput = `X depends on Y R
Y depends on Z`;
  const basicOutput = `X depends on Y R Z
Y depends on Z`;
  const { input, output } = getFullDepDataFromText(basicInput);
  expect(input).toBe(basicInput);
  expect(output).toBe(basicOutput);
});

test("intermediate", () => {
  const intermediateInput = `A depends on B C
B depends on C E
C depends on G
D depends on A F
E depends on F
F depends on H`;
  const intermediateOutput = `A depends on B C E F H G
B depends on C E G F H
C depends on G
D depends on A F B C G E H
E depends on F H
F depends on H`;
  const { input, output } = getFullDepDataFromText(intermediateInput);
  expect(input).toBe(intermediateInput);
  expect(output).toBe(intermediateOutput);
});

test("difficult", () => {
  const difficultInput = `A depends on B C
B depends on C E
C depends on G
D depends on A F
E depends on F
F depends on H
Z depends on I
Y depends on I
I depends on J K L
L depends on M
M depends on N
O depends on P Q
P depends on K
Q depends on L
R depends on Z T
S depends on A D Z Y I O R`;
  const difficultOutput = `A depends on B C E F H G
B depends on C E G F H
C depends on G
D depends on A F B C G E H
E depends on F H
F depends on H
Z depends on I J K L M N
Y depends on I J K L M N
I depends on J K L M N
L depends on M N
M depends on N
O depends on P Q K L M N
P depends on K
Q depends on L M N
R depends on Z T I J K L M N
S depends on A D Z Y I O R B C G E F H J K L M N P Q T`;
  const { input, output } = getFullDepDataFromText(difficultInput);
  expect(input).toBe(difficultInput);
  expect(output).toBe(difficultOutput);
});

test("ignore extra unrelated lines from input", () => {
  const text = `
testing 123
X depends on Y
X depends
X X depends on X
X
`;
  const { input, output } = getFullDepDataFromText(text);
  expect(input).toBe("X depends on Y");
  expect(output).toBe("X depends on Y");
});

test("ignore extra spaces in lines", () => {
  const text = `A depends on B  C
B  depends on W
C depends  on Y
D depends on  Z
E depends on X   Y    Z     
F depends on X   Y    Z     A
  Space  depends  on  Time  `;
  const { input, output } = getFullDepDataFromText(text);
  expect(input).toBe(`A depends on B C
B depends on W
C depends on Y
D depends on Z
E depends on X Y Z
F depends on X Y Z A
Space depends on Time`);
  expect(output).toBe(`A depends on B C W Y
B depends on W
C depends on Y
D depends on Z
E depends on X Y Z
F depends on X Y Z A B W C
Space depends on Time`);
});

// ---- Test thrown errors ---- //

test("Throw error: No dependency listings", () => {
  const text = `X

 depends
X
on
`;
  expect(() => getFullDepDataFromText(text)).toThrow(
    "Invalid input: No dependencies listed."
  );
});

test("Throw error: Improper formatting", () => {
  expect(() => getFullDepDataFromText(`X depends on  `)).toThrow(
    "Invalid input: Please check the dependency list formatting."
  );
});

test("Throw error: Invalid input", () => {
  const text = `depends on depends on depends
depends
on
 depends on 
depends on depends 
on depends on `;
  expect(() => getFullDepDataFromText(text)).toThrow(
    "Invalid input: Please check the dependency list formatting."
  );
});

test("Throw error: Invalid dependency definitions", () => {
  const text = `X X depends on Y
Y and Z depends on A
depends on A depends on B 
 `;
  expect(() => getFullDepDataFromText(text)).toThrow(
    "Invalid input: Please check the dependency list formatting."
  );
});

test("Throw error: duplicate library dependency definition", () => {
  const text = `X depends on Y R
X depends on Z`;
  expect(() => getFullDepDataFromText(text)).toThrow(
    "Invalid dependency data: There is a duplicate library dependency listing."
  );
});

test("Throw error: cyclical dependency", () => {
  expect(() => getFullDepDataFromText("X depends on X")).toThrow(
    "Invalid dependency data: A library depends on itself."
  );
});

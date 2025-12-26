# Modern JavaScript for C++/Java Developers

This guide teaches modern JavaScript (ES6+) and TypeScript to developers who know C++ or Java. Despite the name, JavaScript is very different from Java!

---

## Table of Contents

1. [JavaScript is NOT Java](#javascript-is-not-java)
2. [Running JavaScript](#running-javascript)
3. [Variables and Types](#variables-and-types)
4. [Strings and Template Literals](#strings-and-template-literals)
5. [Arrays and Objects](#arrays-and-objects)
6. [Functions](#functions)
7. [Arrow Functions](#arrow-functions)
8. [Classes](#classes)
9. [Modules](#modules)
10. [Destructuring](#destructuring)
11. [Spread and Rest Operators](#spread-and-rest-operators)
12. [Promises and Async/Await](#promises-and-asyncawait)
13. [TypeScript Basics](#typescript-basics)
14. [Common Patterns in This Project](#common-patterns-in-this-project)
15. [Common Mistakes](#common-mistakes)
16. [Practice Exercises](#practice-exercises)

---

## JavaScript is NOT Java

Despite the similar name, JavaScript and Java are completely different languages:

| Aspect | Java | JavaScript |
|--------|------|------------|
| Typing | Static | Dynamic |
| Compilation | Compiled to bytecode | Interpreted |
| Classes | Class-based OOP | Prototype-based (classes added later) |
| Threading | Multi-threaded | Single-threaded (event loop) |
| Runtime | JVM | Browser or Node.js |
| Main use | Enterprise backends | Web frontends, Node.js backends |

JavaScript was named to ride Java's popularity in 1995. That's it.

---

## Running JavaScript

### In Browser (Console)

1. Open any web page
2. Press F12 (Developer Tools)
3. Click "Console" tab
4. Type JavaScript code

### In Node.js (Like This Project)

```bash
# Install Node.js first

# Run a file
node myfile.js

# Interactive REPL
node
> console.log("Hello")
Hello
```

### In This Project

The frontend code runs in the browser. The build tool (Next.js) compiles it first.

---

## Variables and Types

### var, let, and const

**Old JavaScript (don't use):**
```javascript
var x = 5;  // Function-scoped, can be re-declared. DON'T USE.
```

**Modern JavaScript (use these):**
```javascript
let x = 5;      // Block-scoped, can be reassigned
const y = 10;   // Block-scoped, cannot be reassigned

x = 6;          // OK
// y = 11;      // Error!

const obj = { a: 1 };
obj.a = 2;      // OK! The reference is constant, not the contents
// obj = {};    // Error! Can't reassign
```

**Rule:** Use `const` by default. Use `let` when you need to reassign.

### Types

JavaScript has 7 primitive types:

```javascript
// Primitives
const str = "hello";        // string
const num = 42;             // number (no int vs float distinction!)
const big = 9007199254740991n;  // bigint (for huge numbers)
const bool = true;          // boolean
const nothing = null;       // null
const notDefined = undefined;  // undefined
const sym = Symbol("id");   // symbol (unique identifier)

// Objects (everything else)
const obj = { name: "Alice" };
const arr = [1, 2, 3];
const func = function() {};
```

### Checking Types

```javascript
console.log(typeof "hello");     // "string"
console.log(typeof 42);          // "number"
console.log(typeof true);        // "boolean"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object" (historical bug!)
console.log(typeof {});          // "object"
console.log(typeof []);          // "object" (arrays are objects)

// Better array check
console.log(Array.isArray([]));  // true
```

### Type Coercion (Beware!)

JavaScript automatically converts types, which can be confusing:

```javascript
console.log("5" + 3);       // "53" (string concatenation)
console.log("5" - 3);       // 2 (numeric subtraction)
console.log("5" == 5);      // true (loose equality - converts types)
console.log("5" === 5);     // false (strict equality - no conversion)

console.log(Boolean(""));   // false
console.log(Boolean("0"));  // true (non-empty string)
console.log(Boolean(0));    // false
console.log(Boolean([]));   // true (empty array is truthy!)
```

**Rule:** Always use `===` and `!==` for comparisons.

### null vs undefined

```javascript
let x;                  // undefined (declared but not assigned)
let y = null;           // null (explicitly "no value")

console.log(x === undefined);  // true
console.log(y === null);       // true

// Check for both
if (x == null) {        // true for both null and undefined
    console.log("x is null or undefined");
}
```

---

## Strings and Template Literals

### Old Style (Don't Use)

```javascript
var name = "Alice";
var greeting = "Hello, " + name + "!";
```

### Template Literals (Use These!)

```javascript
const name = "Alice";
const age = 30;

// Interpolation with backticks
const greeting = `Hello, ${name}!`;
const message = `You are ${age} years old.`;

// Expressions
const math = `2 + 2 = ${2 + 2}`;

// Multi-line strings
const multiline = `
This is
a multi-line
string
`;

// Tagged templates (advanced)
const highlight = (strings, ...values) => {
    return strings.reduce((acc, str, i) =>
        acc + str + (values[i] ? `<b>${values[i]}</b>` : ''), '');
};
const html = highlight`Hello ${name}, you are ${age}`;
// "Hello <b>Alice</b>, you are <b>30</b>"
```

### String Methods

```javascript
const s = "Hello, World!";

s.length;                    // 13
s.toUpperCase();            // "HELLO, WORLD!"
s.toLowerCase();            // "hello, world!"
s.includes("World");        // true
s.startsWith("Hello");      // true
s.endsWith("!");            // true
s.indexOf("o");             // 4 (first occurrence)
s.slice(0, 5);              // "Hello"
s.split(", ");              // ["Hello", "World!"]
s.replace("World", "JS");   // "Hello, JS!"
s.trim();                   // Removes whitespace from both ends
s.padStart(20, "-");        // "-------Hello, World!"
```

---

## Arrays and Objects

### Arrays

```javascript
// Create
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, "two", true, null];

// Access
console.log(numbers[0]);     // 1
console.log(numbers.length); // 5

// Modify
numbers.push(6);             // Add to end
numbers.pop();               // Remove from end
numbers.unshift(0);          // Add to beginning
numbers.shift();             // Remove from beginning

// Array methods (very important!)
const doubled = numbers.map(x => x * 2);           // [2, 4, 6, 8, 10]
const evens = numbers.filter(x => x % 2 === 0);    // [2, 4]
const sum = numbers.reduce((acc, x) => acc + x, 0); // 15
const found = numbers.find(x => x > 3);            // 4
const index = numbers.findIndex(x => x > 3);       // 3
const hasThree = numbers.includes(3);              // true
const allPositive = numbers.every(x => x > 0);     // true
const anyEven = numbers.some(x => x % 2 === 0);    // true

// Sort (modifies in place!)
numbers.sort((a, b) => a - b);  // Ascending
numbers.sort((a, b) => b - a);  // Descending

// Iterate
numbers.forEach(x => console.log(x));

for (const num of numbers) {
    console.log(num);
}
```

### Objects

```javascript
// Create
const person = {
    name: "Alice",
    age: 30,
    city: "NYC"
};

// Access
console.log(person.name);         // "Alice"
console.log(person["name"]);      // "Alice"

const key = "age";
console.log(person[key]);         // 30

// Modify
person.age = 31;
person.job = "Engineer";          // Add new property
delete person.city;               // Remove property

// Check if property exists
console.log("name" in person);    // true
console.log(person.hasOwnProperty("name")); // true

// Get keys, values, entries
Object.keys(person);              // ["name", "age", "job"]
Object.values(person);            // ["Alice", 31, "Engineer"]
Object.entries(person);           // [["name", "Alice"], ["age", 31], ...]

// Iterate
for (const key in person) {
    console.log(`${key}: ${person[key]}`);
}

for (const [key, value] of Object.entries(person)) {
    console.log(`${key}: ${value}`);
}
```

### Shorthand Properties

```javascript
const name = "Alice";
const age = 30;

// Old way
const person1 = { name: name, age: age };

// Shorthand (when variable name matches property name)
const person2 = { name, age };
```

---

## Functions

### Traditional Functions

```javascript
function add(a, b) {
    return a + b;
}

// Function expression
const multiply = function(a, b) {
    return a * b;
};
```

### Default Parameters

```javascript
function greet(name, greeting = "Hello") {
    return `${greeting}, ${name}!`;
}

greet("Alice");           // "Hello, Alice!"
greet("Bob", "Hi");       // "Hi, Bob!"
```

### Rest Parameters

```javascript
function sum(...numbers) {
    return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);             // 6
sum(1, 2, 3, 4, 5);       // 15
```

---

## Arrow Functions

Arrow functions are a concise syntax introduced in ES6:

```javascript
// Traditional
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => {
    return a + b;
};

// Shorter: implicit return (no braces)
const add = (a, b) => a + b;

// Single parameter: no parentheses needed
const double = x => x * 2;

// No parameters
const sayHello = () => console.log("Hello");
```

### Arrow Functions vs Regular Functions

```javascript
// Key difference: 'this' binding

const obj = {
    name: "Alice",

    // Regular function: 'this' refers to obj
    regularGreet: function() {
        console.log(`Hello, ${this.name}`);
    },

    // Arrow function: 'this' is inherited from outer scope
    arrowGreet: () => {
        console.log(`Hello, ${this.name}`);  // 'this' is NOT obj!
    }
};

obj.regularGreet();  // "Hello, Alice"
obj.arrowGreet();    // "Hello, undefined" (or error)
```

**Rule:** Use arrow functions for callbacks. Use regular functions for object methods.

---

## Classes

### Basic Class

```javascript
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    greet() {
        return `Hello, I'm ${this.name}`;
    }

    birthday() {
        this.age++;
    }
}

const alice = new Person("Alice", 30);
console.log(alice.greet());  // "Hello, I'm Alice"
alice.birthday();
console.log(alice.age);      // 31
```

### Inheritance

```javascript
class Student extends Person {
    constructor(name, age, school) {
        super(name, age);
        this.school = school;
    }

    study() {
        return `${this.name} is studying at ${this.school}`;
    }
}

const bob = new Student("Bob", 20, "MIT");
console.log(bob.greet());    // "Hello, I'm Bob"
console.log(bob.study());    // "Bob is studying at MIT"
```

### Static Methods

```javascript
class MathUtils {
    static add(a, b) {
        return a + b;
    }

    static PI = 3.14159;
}

console.log(MathUtils.add(3, 4));  // 7
console.log(MathUtils.PI);          // 3.14159
```

### Getters and Setters

```javascript
class Temperature {
    constructor(celsius) {
        this._celsius = celsius;
    }

    get celsius() {
        return this._celsius;
    }

    set celsius(value) {
        if (value < -273.15) {
            throw new Error("Below absolute zero!");
        }
        this._celsius = value;
    }

    get fahrenheit() {
        return this._celsius * 9/5 + 32;
    }
}

const temp = new Temperature(25);
console.log(temp.celsius);     // 25
console.log(temp.fahrenheit);  // 77
temp.celsius = 30;
```

### Private Fields (ES2022)

```javascript
class BankAccount {
    #balance = 0;  // Private field

    deposit(amount) {
        this.#balance += amount;
    }

    getBalance() {
        return this.#balance;
    }
}

const account = new BankAccount();
account.deposit(100);
console.log(account.getBalance());  // 100
// console.log(account.#balance);   // SyntaxError!
```

---

## Modules

### Named Exports

**math.js:**
```javascript
export const PI = 3.14159;

export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}
```

**main.js:**
```javascript
import { add, multiply, PI } from './math.js';

console.log(add(3, 4));       // 7
console.log(PI);              // 3.14159

// Import with alias
import { add as sum } from './math.js';

// Import all
import * as math from './math.js';
console.log(math.add(3, 4));
```

### Default Exports

**person.js:**
```javascript
export default class Person {
    constructor(name) {
        this.name = name;
    }
}
```

**main.js:**
```javascript
import Person from './person.js';  // No braces for default

const alice = new Person("Alice");
```

### Mixed Exports

**utils.js:**
```javascript
export default function mainFunction() { }

export function helper1() { }
export function helper2() { }
export const VERSION = "1.0.0";
```

**main.js:**
```javascript
import mainFunction, { helper1, VERSION } from './utils.js';
```

---

## Destructuring

### Array Destructuring

```javascript
const numbers = [1, 2, 3, 4, 5];

// Old way
const first = numbers[0];
const second = numbers[1];

// Destructuring
const [a, b, c] = numbers;
console.log(a, b, c);  // 1 2 3

// Skip elements
const [x, , z] = numbers;
console.log(x, z);  // 1 3

// Rest
const [head, ...rest] = numbers;
console.log(head);  // 1
console.log(rest);  // [2, 3, 4, 5]

// Default values
const [p = 0, q = 0] = [1];
console.log(p, q);  // 1 0

// Swap variables
let m = 1, n = 2;
[m, n] = [n, m];
console.log(m, n);  // 2 1
```

### Object Destructuring

```javascript
const person = { name: "Alice", age: 30, city: "NYC" };

// Old way
const name = person.name;
const age = person.age;

// Destructuring
const { name, age } = person;
console.log(name, age);  // "Alice" 30

// Rename
const { name: personName, age: personAge } = person;
console.log(personName);  // "Alice"

// Default values
const { name, job = "Unknown" } = person;
console.log(job);  // "Unknown"

// Nested
const user = {
    name: "Bob",
    address: {
        city: "LA",
        zip: "90001"
    }
};
const { address: { city } } = user;
console.log(city);  // "LA"
```

### Function Parameter Destructuring

```javascript
// Array
function sum([a, b]) {
    return a + b;
}
sum([1, 2]);  // 3

// Object
function greet({ name, age }) {
    return `${name} is ${age}`;
}
greet({ name: "Alice", age: 30 });  // "Alice is 30"

// With defaults
function createUser({ name, role = "user" } = {}) {
    return { name, role };
}
createUser({ name: "Alice" });  // { name: "Alice", role: "user" }
```

---

## Spread and Rest Operators

### Spread Operator (...)

```javascript
// Arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4, 5, 6]

// Copy array
const copy = [...arr1];

// Add elements
const withZero = [0, ...arr1];  // [0, 1, 2, 3]

// Objects
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 };  // { a: 1, b: 2, c: 3, d: 4 }

// Override properties
const updated = { ...obj1, b: 99 };  // { a: 1, b: 99 }

// Function calls
const numbers = [1, 2, 3];
Math.max(...numbers);  // 3 (same as Math.max(1, 2, 3))
```

### Rest Operator (...)

```javascript
// Function parameters
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}

// Destructuring
const [first, ...others] = [1, 2, 3, 4];
console.log(first);   // 1
console.log(others);  // [2, 3, 4]

const { a, ...rest } = { a: 1, b: 2, c: 3 };
console.log(a);     // 1
console.log(rest);  // { b: 2, c: 3 }
```

---

## Promises and Async/Await

### The Problem: Asynchronous Code

JavaScript is single-threaded but handles async operations (network, file I/O) through callbacks:

```javascript
// Old callback style (callback hell)
getUser(userId, function(user) {
    getOrders(user.id, function(orders) {
        getProduct(orders[0].productId, function(product) {
            console.log(product);
        });
    });
});
```

### Promises

A Promise represents a value that may be available now, later, or never:

```javascript
// Creating a Promise
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        const success = true;
        if (success) {
            resolve("Data loaded!");
        } else {
            reject(new Error("Failed to load"));
        }
    }, 1000);
});

// Using a Promise
promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log("Done"));

// Chaining
fetch('/api/user')
    .then(response => response.json())
    .then(user => fetch(`/api/orders/${user.id}`))
    .then(response => response.json())
    .then(orders => console.log(orders))
    .catch(error => console.error(error));
```

### Async/Await (Preferred)

`async/await` makes asynchronous code look synchronous:

```javascript
// Async function
async function loadData() {
    try {
        const response = await fetch('/api/user');
        const user = await response.json();

        const ordersResponse = await fetch(`/api/orders/${user.id}`);
        const orders = await ordersResponse.json();

        return orders;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// Call it
loadData().then(orders => console.log(orders));

// Or from another async function
async function main() {
    const orders = await loadData();
    console.log(orders);
}
```

### Parallel Execution

```javascript
// Sequential (slow)
async function sequential() {
    const a = await fetchA();  // Wait
    const b = await fetchB();  // Then wait
    return [a, b];
}

// Parallel (fast)
async function parallel() {
    const [a, b] = await Promise.all([
        fetchA(),
        fetchB()
    ]);
    return [a, b];
}

// Race (first to complete wins)
const result = await Promise.race([
    fetchFromServer1(),
    fetchFromServer2()
]);
```

---

## TypeScript Basics

TypeScript adds static types to JavaScript. This project uses TypeScript for the frontend.

### Basic Types

```typescript
// Primitives
const name: string = "Alice";
const age: number = 30;
const isActive: boolean = true;

// Arrays
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ["Alice", "Bob"];

// Objects
const person: { name: string; age: number } = {
    name: "Alice",
    age: 30
};
```

### Interfaces

```typescript
interface Person {
    name: string;
    age: number;
    email?: string;  // Optional
}

const alice: Person = {
    name: "Alice",
    age: 30
};

// Function with typed parameters
function greet(person: Person): string {
    return `Hello, ${person.name}!`;
}
```

### Type Aliases

```typescript
type ID = string | number;
type Status = "pending" | "approved" | "rejected";

const userId: ID = "abc123";
const status: Status = "pending";
```

### Generics

```typescript
// Generic function
function identity<T>(arg: T): T {
    return arg;
}

identity<string>("hello");
identity<number>(42);

// Generic interface
interface Response<T> {
    data: T;
    status: number;
}

const userResponse: Response<Person> = {
    data: { name: "Alice", age: 30 },
    status: 200
};
```

### Common React Types

```typescript
// Component props
interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

// State
const [count, setCount] = useState<number>(0);

// Event handlers
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.target);
};
```

---

## Common Patterns in This Project

### Fetch API

```typescript
// GET request
const response = await fetch('/api/reports');
const data = await response.json();

// POST request
const response = await fetch('/api/analysis/youtube', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        url: 'https://youtube.com/watch?v=abc',
        model: 'sonnet'
    })
});
```

### React State Pattern

```typescript
const [reports, setReports] = useState<Report[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    async function loadReports() {
        setLoading(true);
        try {
            const data = await api.getReports();
            setReports(data.reports);
        } catch (e) {
            setError("Failed to load reports");
        } finally {
            setLoading(false);
        }
    }
    loadReports();
}, []);
```

---

## Common Mistakes

### 1. Using var

```javascript
// Don't
var x = 5;

// Do
const x = 5;
let y = 10;
```

### 2. Using == Instead of ===

```javascript
// Don't
if (x == "5") { }

// Do
if (x === "5") { }
```

### 3. Forgetting async/await

```javascript
// Wrong
function loadData() {
    const data = fetch('/api/data');  // Returns Promise, not data!
    return data;
}

// Right
async function loadData() {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
}
```

### 4. Modifying State Directly

```javascript
// Wrong (React)
const [items, setItems] = useState([1, 2, 3]);
items.push(4);  // Mutates array directly!

// Right
setItems([...items, 4]);  // Creates new array
```

### 5. Misunderstanding 'this'

```javascript
class Counter {
    count = 0;

    // Wrong: 'this' is undefined when called as callback
    increment() {
        this.count++;
    }

    // Right: Arrow function preserves 'this'
    increment = () => {
        this.count++;
    }
}
```

---

## Practice Exercises

### Exercise 1: Array Operations

Use array methods to solve:

```javascript
const products = [
    { name: "Laptop", price: 1000 },
    { name: "Phone", price: 500 },
    { name: "Tablet", price: 300 },
    { name: "Watch", price: 200 }
];

// 1. Get names of products over $400
// 2. Calculate total price of all products
// 3. Find the most expensive product
```

### Exercise 2: Async Function

Write an async function that:
1. Fetches user data from `/api/user`
2. Waits 1 second (use `setTimeout` with Promise)
3. Returns the user's name

### Exercise 3: Class

Create a `TodoList` class with:
- `items` array
- `add(item)` method
- `remove(index)` method
- `list()` method that returns all items

---

## What's Next?

Now that you understand JavaScript, move on to:

1. **[REACT_FUNDAMENTALS.md](REACT_FUNDAMENTALS.md)** - Learn React components and hooks
2. **[ASYNC_PROGRAMMING.md](ASYNC_PROGRAMMING.md)** - Deep dive into async patterns

---

*Modern JavaScript for C++/Java Developers - Created 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*

# Python for C++/Java Developers

This guide teaches Python to developers who already know C++ or Java. We'll focus on the differences and common pitfalls.

---

## Table of Contents

1. [First Impressions](#first-impressions)
2. [Syntax Differences](#syntax-differences)
3. [Variables and Types](#variables-and-types)
4. [Data Structures](#data-structures)
5. [Functions](#functions)
6. [Classes and OOP](#classes-and-oop)
7. [Modules and Packages](#modules-and-packages)
8. [Error Handling](#error-handling)
9. [File I/O](#file-io)
10. [Python-Specific Features](#python-specific-features)
11. [Type Hints](#type-hints)
12. [Common Mistakes](#common-mistakes)
13. [Practice Exercises](#practice-exercises)

---

## First Impressions

### Hello World Comparison

**C++:**
```cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

**Java:**
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

**Python:**
```python
print("Hello, World!")
```

That's it. No includes, no class wrapper, no main function, no semicolons.

### Key Differences at a Glance

| Feature | C++/Java | Python |
|---------|----------|--------|
| Compilation | Compiled | Interpreted |
| Typing | Static | Dynamic |
| Braces | `{ }` for blocks | Indentation |
| Semicolons | Required | Not used |
| Main function | Required | Optional |
| Memory management | Manual (C++) / GC (Java) | Garbage collected |

---

## Syntax Differences

### Blocks Use Indentation, Not Braces

**C++/Java:**
```cpp
if (x > 0) {
    doSomething();
    doSomethingElse();
}
```

**Python:**
```python
if x > 0:
    do_something()
    do_something_else()
```

The colon `:` starts a block. Indentation (4 spaces by convention) defines the block scope.

**Warning:** Mixing tabs and spaces causes errors. Use spaces only.

### No Semicolons

**C++/Java:**
```cpp
int x = 5;
int y = 10;
int z = x + y;
```

**Python:**
```python
x = 5
y = 10
z = x + y
```

You can use semicolons to put multiple statements on one line, but don't:
```python
x = 5; y = 10  # Legal but not recommended
```

### Comments

**C++/Java:**
```cpp
// Single line comment
/* Multi-line
   comment */
```

**Python:**
```python
# Single line comment

"""
Multi-line string used as comment
(called a docstring when inside a function/class)
"""
```

### Naming Conventions

| Type | C++/Java | Python |
|------|----------|--------|
| Variables | `camelCase` | `snake_case` |
| Functions | `camelCase` | `snake_case` |
| Classes | `PascalCase` | `PascalCase` |
| Constants | `UPPER_CASE` | `UPPER_CASE` |
| Private | `private` keyword | `_underscore_prefix` |

---

## Variables and Types

### Dynamic Typing

In C++/Java, you declare the type:
```cpp
int x = 5;
String name = "Alice";
```

In Python, types are inferred:
```python
x = 5           # x is an int
name = "Alice"  # name is a str

# Types can change (but don't do this!)
x = "now a string"  # x is now a str
```

### Basic Types

| C++/Java | Python | Example |
|----------|--------|---------|
| `int` | `int` | `x = 42` |
| `double`/`float` | `float` | `x = 3.14` |
| `boolean`/`bool` | `bool` | `x = True` (capital T!) |
| `char` | `str` (single char) | `x = 'a'` |
| `String` | `str` | `x = "hello"` |
| `null`/`NULL` | `None` | `x = None` |

### Checking Types

```python
x = 42
print(type(x))        # <class 'int'>
print(isinstance(x, int))  # True
```

### Type Conversion

```python
# String to int
x = int("42")         # x = 42

# Int to string
s = str(42)           # s = "42"

# Float to int (truncates)
x = int(3.9)          # x = 3

# String to float
x = float("3.14")     # x = 3.14
```

### Strings

Strings in Python are more flexible than in C/C++:

```python
# Single or double quotes
s1 = 'hello'
s2 = "hello"          # Same thing

# Multi-line strings
s3 = """This is a
multi-line string"""

# String formatting (f-strings - use these!)
name = "Alice"
age = 30
s = f"Name: {name}, Age: {age}"  # "Name: Alice, Age: 30"

# String operations
s = "hello"
print(len(s))         # 5
print(s.upper())      # "HELLO"
print(s[0])           # "h"
print(s[1:4])         # "ell" (slicing)
print("ell" in s)     # True
print(s + " world")   # "hello world"
print(s * 3)          # "hellohellohello"
```

**Important:** Strings are immutable (like Java, unlike C char arrays).

---

## Data Structures

### Lists (like ArrayList or vector)

```python
# Create a list
numbers = [1, 2, 3, 4, 5]
mixed = [1, "two", 3.0, True]  # Can mix types (but don't)

# Access elements (0-indexed)
print(numbers[0])     # 1
print(numbers[-1])    # 5 (last element - Python specific!)

# Slicing
print(numbers[1:3])   # [2, 3] (elements 1 and 2)
print(numbers[:3])    # [1, 2, 3] (first 3)
print(numbers[2:])    # [3, 4, 5] (from index 2)

# Modify
numbers[0] = 10       # [10, 2, 3, 4, 5]
numbers.append(6)     # [10, 2, 3, 4, 5, 6]
numbers.insert(0, 0)  # [0, 10, 2, 3, 4, 5, 6]

# Remove
numbers.pop()         # Remove last, returns it
numbers.remove(10)    # Remove first occurrence of 10
del numbers[0]        # Remove by index

# Length
print(len(numbers))   # Number of elements

# Check membership
print(3 in numbers)   # True
```

### Dictionaries (like HashMap or unordered_map)

```python
# Create a dictionary
person = {
    "name": "Alice",
    "age": 30,
    "city": "NYC"
}

# Access
print(person["name"])           # "Alice"
print(person.get("name"))       # "Alice"
print(person.get("job", "N/A")) # "N/A" (default if key missing)

# Modify
person["age"] = 31              # Update
person["job"] = "Engineer"      # Add new key

# Remove
del person["city"]
job = person.pop("job")         # Remove and return

# Iterate
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(f"{key}: {value}")

# Check key exists
if "name" in person:
    print("Name exists")
```

### Tuples (immutable list)

```python
# Create a tuple
point = (10, 20)
rgb = (255, 128, 0)

# Access (like list)
print(point[0])       # 10

# Cannot modify!
# point[0] = 5        # Error!

# Unpacking
x, y = point          # x = 10, y = 20

# Common use: return multiple values
def get_stats():
    return 10, 20, 30  # Returns tuple

min_val, max_val, avg = get_stats()
```

### Sets (like HashSet)

```python
# Create a set
numbers = {1, 2, 3, 4, 5}
numbers = set([1, 2, 2, 3])  # {1, 2, 3} (no duplicates)

# Operations
numbers.add(6)
numbers.remove(1)
print(2 in numbers)   # True

# Set operations
a = {1, 2, 3}
b = {2, 3, 4}
print(a | b)          # {1, 2, 3, 4} (union)
print(a & b)          # {2, 3} (intersection)
print(a - b)          # {1} (difference)
```

### Comparison Table

| C++/Java | Python | Notes |
|----------|--------|-------|
| `ArrayList<T>` / `vector<T>` | `list` | Mutable, ordered |
| `LinkedList<T>` | `collections.deque` | Fast append/pop both ends |
| `HashMap<K,V>` / `unordered_map` | `dict` | Key-value pairs |
| `TreeMap<K,V>` / `map` | `dict` (3.7+) | Maintains insertion order |
| `HashSet<T>` / `unordered_set` | `set` | Unique elements |
| `Tuple` (Java record) | `tuple` | Immutable sequence |
| `Array` / `T[]` | `list` | Python lists are dynamic |

---

## Functions

### Basic Function Syntax

**C++:**
```cpp
int add(int a, int b) {
    return a + b;
}
```

**Python:**
```python
def add(a, b):
    return a + b
```

No return type declaration. The `def` keyword defines a function.

### Default Arguments

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))              # "Hello, Alice!"
print(greet("Bob", "Hi"))          # "Hi, Bob!"
```

### Keyword Arguments

```python
def create_user(name, age, city):
    return {"name": name, "age": age, "city": city}

# Positional (like C++/Java)
user1 = create_user("Alice", 30, "NYC")

# Keyword (Python-specific)
user2 = create_user(name="Bob", city="LA", age=25)

# Mixed
user3 = create_user("Charlie", city="SF", age=35)
```

### Variable Arguments

```python
# *args - variable positional arguments
def sum_all(*numbers):
    total = 0
    for n in numbers:
        total += n
    return total

print(sum_all(1, 2, 3))       # 6
print(sum_all(1, 2, 3, 4, 5)) # 15

# **kwargs - variable keyword arguments
def create_dict(**kwargs):
    return kwargs

print(create_dict(name="Alice", age=30))
# {'name': 'Alice', 'age': 30}
```

### Lambda Functions (like Java lambdas)

**Java:**
```java
Function<Integer, Integer> square = x -> x * x;
```

**Python:**
```python
square = lambda x: x * x
print(square(5))  # 25

# Often used with map, filter, sorted
numbers = [3, 1, 4, 1, 5]
sorted_numbers = sorted(numbers, key=lambda x: -x)  # [5, 4, 3, 1, 1]
```

### Functions Are First-Class Objects

```python
def apply_operation(func, x, y):
    return func(x, y)

def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

print(apply_operation(add, 3, 4))       # 7
print(apply_operation(multiply, 3, 4))  # 12
```

---

## Classes and OOP

### Basic Class

**Java:**
```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void birthday() {
        age++;
    }
}
```

**Python:**
```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def get_name(self):
        return self.name

    def birthday(self):
        self.age += 1
```

Key differences:
- `__init__` instead of constructor with class name
- `self` instead of `this` (and it's explicit!)
- No access modifiers (public/private)
- No type declarations

### The `self` Parameter

Every method must take `self` as the first parameter. It's like `this` in Java/C++ but explicit:

```python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1  # Must use self.count, not just count

    def get_count(self):
        return self.count

c = Counter()
c.increment()        # Python passes 'self' automatically
print(c.get_count()) # 1
```

### Class vs Instance Variables

```python
class Dog:
    # Class variable (shared by all instances)
    species = "Canis familiaris"

    def __init__(self, name):
        # Instance variable (unique to each instance)
        self.name = name

dog1 = Dog("Buddy")
dog2 = Dog("Max")

print(dog1.species)  # "Canis familiaris"
print(dog2.species)  # "Canis familiaris"
print(dog1.name)     # "Buddy"
print(dog2.name)     # "Max"
```

### Inheritance

**Java:**
```java
public class Student extends Person {
    private String school;

    public Student(String name, int age, String school) {
        super(name, age);
        this.school = school;
    }
}
```

**Python:**
```python
class Student(Person):
    def __init__(self, name, age, school):
        super().__init__(name, age)
        self.school = school
```

### Multiple Inheritance

Python supports multiple inheritance (C++ does too, Java doesn't):

```python
class A:
    def method_a(self):
        return "A"

class B:
    def method_b(self):
        return "B"

class C(A, B):  # Inherits from both A and B
    pass

c = C()
print(c.method_a())  # "A"
print(c.method_b())  # "B"
```

### Private/Protected Convention

Python doesn't have `private`/`protected` keywords. Instead, it uses conventions:

```python
class MyClass:
    def __init__(self):
        self.public = "Anyone can access"
        self._protected = "Conventionally protected"
        self.__private = "Name-mangled private"

    def get_private(self):
        return self.__private

obj = MyClass()
print(obj.public)      # Works
print(obj._protected)  # Works (but shouldn't access externally)
# print(obj.__private) # Error!
print(obj.get_private())  # Works
print(obj._MyClass__private)  # Works (name mangling) but don't do this
```

### Static and Class Methods

```python
class MathUtils:
    pi = 3.14159

    @staticmethod
    def add(a, b):
        return a + b

    @classmethod
    def circle_area(cls, radius):
        return cls.pi * radius * radius

print(MathUtils.add(3, 4))         # 7
print(MathUtils.circle_area(5))    # 78.53975
```

### Properties (Getters/Setters)

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Temperature below absolute zero!")
        self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9/5 + 32

temp = Temperature(25)
print(temp.celsius)     # 25 (uses getter)
print(temp.fahrenheit)  # 77.0
temp.celsius = 30       # Uses setter
```

---

## Modules and Packages

### Importing Modules

**C++:**
```cpp
#include <iostream>
#include <vector>
```

**Java:**
```java
import java.util.ArrayList;
import java.util.HashMap;
```

**Python:**
```python
# Import entire module
import os
print(os.getcwd())

# Import specific items
from os import getcwd, listdir
print(getcwd())

# Import with alias
import numpy as np
arr = np.array([1, 2, 3])

# Import everything (not recommended)
from os import *
```

### Creating Your Own Module

**mymodule.py:**
```python
def greet(name):
    return f"Hello, {name}!"

PI = 3.14159

class Calculator:
    def add(self, a, b):
        return a + b
```

**main.py:**
```python
import mymodule

print(mymodule.greet("Alice"))
print(mymodule.PI)
calc = mymodule.Calculator()

# Or
from mymodule import greet, Calculator
print(greet("Bob"))
```

### Package Structure

A package is a directory with `__init__.py`:

```
mypackage/
    __init__.py
    module1.py
    module2.py
    subpackage/
        __init__.py
        module3.py
```

```python
from mypackage import module1
from mypackage.subpackage import module3
```

### The `if __name__ == "__main__"` Pattern

```python
def main():
    print("Running as main program")

if __name__ == "__main__":
    main()
```

This code only runs when the file is executed directly, not when imported.

---

## Error Handling

### Try/Except (like Try/Catch)

**Java:**
```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Division by zero!");
} finally {
    System.out.println("Cleanup");
}
```

**Python:**
```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Division by zero: {e}")
except Exception as e:
    print(f"Some other error: {e}")
else:
    print("No error occurred")  # Runs if no exception
finally:
    print("Cleanup")
```

### Raising Exceptions

```python
def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

try:
    divide(10, 0)
except ValueError as e:
    print(e)
```

### Custom Exceptions

```python
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f"Cannot withdraw {amount} with balance {balance}")

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount
```

---

## File I/O

### Reading Files

**C++:**
```cpp
#include <fstream>
#include <string>

std::ifstream file("data.txt");
std::string line;
while (std::getline(file, line)) {
    std::cout << line << std::endl;
}
file.close();
```

**Python:**
```python
# Method 1: Manual close
file = open("data.txt", "r")
content = file.read()
file.close()

# Method 2: With statement (recommended - auto-closes)
with open("data.txt", "r") as file:
    content = file.read()

# Read lines
with open("data.txt", "r") as file:
    for line in file:
        print(line.strip())
```

### Writing Files

```python
# Write (overwrites)
with open("output.txt", "w") as file:
    file.write("Hello, World!\n")
    file.write("Second line\n")

# Append
with open("output.txt", "a") as file:
    file.write("Appended line\n")

# Write multiple lines
lines = ["Line 1", "Line 2", "Line 3"]
with open("output.txt", "w") as file:
    file.writelines(line + "\n" for line in lines)
```

### Working with Paths

```python
from pathlib import Path

# Create path object
path = Path("folder/subfolder/file.txt")

# Path operations
print(path.exists())        # True/False
print(path.is_file())       # True/False
print(path.is_dir())        # True/False
print(path.name)            # "file.txt"
print(path.stem)            # "file"
print(path.suffix)          # ".txt"
print(path.parent)          # Path("folder/subfolder")

# Join paths
new_path = Path("folder") / "subfolder" / "file.txt"

# List directory
for item in Path("folder").iterdir():
    print(item)

# Find files
for txt_file in Path(".").glob("**/*.txt"):
    print(txt_file)
```

---

## Python-Specific Features

### List Comprehensions

A concise way to create lists:

```python
# Traditional loop
squares = []
for x in range(10):
    squares.append(x ** 2)

# List comprehension (Pythonic)
squares = [x ** 2 for x in range(10)]

# With condition
evens = [x for x in range(20) if x % 2 == 0]

# Nested
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### Dictionary Comprehensions

```python
# Create dict from two lists
keys = ["a", "b", "c"]
values = [1, 2, 3]
d = {k: v for k, v in zip(keys, values)}
# {'a': 1, 'b': 2, 'c': 3}

# Transform dict
original = {"a": 1, "b": 2}
squared = {k: v ** 2 for k, v in original.items()}
# {'a': 1, 'b': 4}
```

### Generators

Lazy evaluation (like streams in Java 8):

```python
# Generator expression (lazy - doesn't compute until needed)
squares = (x ** 2 for x in range(1000000))
# Takes almost no memory

# Generator function
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
print(next(fib))  # 0
print(next(fib))  # 1
print(next(fib))  # 1
print(next(fib))  # 2
```

### Context Managers (with statement)

```python
# Custom context manager
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        return self

    def __exit__(self, *args):
        import time
        self.elapsed = time.time() - self.start
        print(f"Elapsed: {self.elapsed:.2f}s")

with Timer() as t:
    # Do some work
    sum([i for i in range(1000000)])
# Prints: Elapsed: 0.05s
```

### Decorators

Functions that wrap other functions:

```python
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Finished {func.__name__}")
        return result
    return wrapper

@log_calls
def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))
# Output:
# Calling greet
# Finished greet
# Hello, Alice!
```

---

## Type Hints

Python 3.5+ supports optional type hints (like TypeScript):

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

def add(a: int, b: int) -> int:
    return a + b

# With complex types
from typing import List, Dict, Optional, Tuple

def process(items: List[str]) -> Dict[str, int]:
    return {item: len(item) for item in items}

def find_user(user_id: int) -> Optional[str]:
    # Returns str or None
    users = {1: "Alice", 2: "Bob"}
    return users.get(user_id)

def get_stats() -> Tuple[int, int, float]:
    return (10, 20, 15.5)
```

Type hints are NOT enforced at runtime - they're for documentation and IDE support.

---

## Common Mistakes

### 1. Forgetting `self`

```python
class Counter:
    def __init__(self):
        count = 0  # Wrong! This is a local variable

    def increment(self):
        self.count += 1  # Error: 'Counter' has no attribute 'count'
```

**Fix:**
```python
class Counter:
    def __init__(self):
        self.count = 0  # Correct - instance variable
```

### 2. Mutable Default Arguments

```python
def add_item(item, items=[]):  # DANGER!
    items.append(item)
    return items

print(add_item("a"))  # ['a']
print(add_item("b"))  # ['a', 'b'] - Unexpected!
```

**Fix:**
```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### 3. Confusing `=` and `==` in Conditions

```python
# Python doesn't allow this (unlike C/C++)
if x = 5:  # SyntaxError!
    pass

# Must use ==
if x == 5:
    pass
```

### 4. Integer Division

```python
# Python 3
print(7 / 2)   # 3.5 (float division)
print(7 // 2)  # 3 (integer division)

# In C/C++/Java, 7/2 = 3
```

### 5. Scope Issues

```python
x = 10

def modify():
    x = 20  # This creates a LOCAL variable, doesn't modify global

modify()
print(x)  # 10 - unchanged!

# To modify global:
def modify_global():
    global x
    x = 20

modify_global()
print(x)  # 20
```

### 6. List Copying

```python
a = [1, 2, 3]
b = a        # b is the SAME list as a (reference)
b.append(4)
print(a)     # [1, 2, 3, 4] - a was modified!

# To copy:
b = a.copy()        # Shallow copy
b = list(a)         # Also shallow copy
import copy
b = copy.deepcopy(a)  # Deep copy (for nested structures)
```

---

## Practice Exercises

### Exercise 1: FizzBuzz

Write a function that prints numbers 1-100. For multiples of 3, print "Fizz". For multiples of 5, print "Buzz". For both, print "FizzBuzz".

```python
def fizzbuzz():
    # Your code here
    pass
```

### Exercise 2: Anagram Checker

Write a function that checks if two strings are anagrams:

```python
def is_anagram(s1: str, s2: str) -> bool:
    # Your code here
    pass

# Test
print(is_anagram("listen", "silent"))  # True
print(is_anagram("hello", "world"))    # False
```

### Exercise 3: Simple Class

Create a `BankAccount` class with:
- `balance` attribute
- `deposit(amount)` method
- `withdraw(amount)` method (raise exception if insufficient funds)
- `get_balance()` method

```python
class BankAccount:
    # Your code here
    pass
```

### Exercise 4: File Word Counter

Write a function that reads a file and returns a dictionary of word frequencies:

```python
def count_words(filename: str) -> dict:
    # Your code here
    pass
```

---

## What's Next?

Now that you understand Python basics, move on to:

1. **[ASYNC_PROGRAMMING.md](ASYNC_PROGRAMMING.md)** - Learn `async/await` patterns
2. **[FASTAPI_GUIDE.md](FASTAPI_GUIDE.md)** - Build web APIs with Python

---

*Python for C++/Java Developers - Created 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*

const fs = require("fs");

function Dicklang(size = 32768) {
  this.memory = new Array(size).fill(0);
  this.code = [];
  this.ptr = 0;
  this.pc = 0;
  this.jumpTo = {};
}

Dicklang.prototype.load = function (code) {
  const rawCode = code
    .split("내껀")[1]
    .split("커")[0]
    .split("");
  let read = 0;

  while (read < rawCode.length) {
    if (rawCode[read] === "오" && rawCode[read + 1] === "지" && rawCode[read + 2] === "게" ) {
      this.code.push(">");
      read += 3;
    } else if (rawCode[read] === "조" && rawCode[read + 1] === "지" && rawCode[read + 2] === "게" ) {
      this.code.push("<");
      read += 3;
    } else if (rawCode[read] === "겁" && rawCode[read + 1] === "나") {
      this.code.push("+");
      read += 2;
    } else if (rawCode[read] === "존" && rawCode[read + 1] === "나") {
      this.code.push("-");
      read += 2;
    } else if (rawCode[read] === "완" && rawCode[read + 1] === "전") {
      this.code.push("[");
      read += 2;
    } else if (rawCode[read] === "엄" && rawCode[read + 1] === "청") {
      this.code.push("]");
      read += 2;
    } else if (rawCode[read] === "시" && rawCode[read + 1] === "발") {
      this.code.push(".");
      read += 2;
    } else if (rawCode[read] === "정" && rawCode[read + 1] === "말") {
      this.code.push(",");
      read += 2;
    } else {
      read += 1;
    }
  }
};

Dicklang.prototype.preprocess = function () {
  // 점프 위치 기록
  const stack = [];
  for (let i = 0; i < this.code.length; i += 1) {
    const command = this.code[i];
    if (command === "[") {
      stack.push(i);
    } else if (command === "]") {
      if (stack.length === 0) throw new Error("Syntax error");

      this.jumpTo[i] = stack.pop();
      this.jumpTo[this.jumpTo[i]] = i;
    }
  }

  if (stack.length > 0) throw new Error("Syntax error");
};

Dicklang.prototype.increasePtr = function () {
  if (this.ptr >= this.memory.length - 1) throw new Error("Out of memory");
  this.ptr += 1;
};

Dicklang.prototype.decreasePtr = function () {
  if (this.ptr <= 0) throw new Error("Out of memory");
  this.ptr -= 1;
};

Dicklang.prototype.increaseValue = function () {
  this.memory[this.ptr] += 1;
};

Dicklang.prototype.decreaseValue = function () {
  this.memory[this.ptr] -= 1;
};

Dicklang.prototype.printValue = function () {
  process.stdout.write(String.fromCharCode(this.memory[this.ptr]));
};

Dicklang.prototype.storingValue = function () {
  let buffer = Buffer.alloc(1);
  fs.readSync(0, buffer, 0, 1);
  this.memory[this.ptr] = buffer.toString("utf8").charCodeAt(0);
};

Dicklang.prototype.jump = function (command) {
  if (command === "[" && this.memory[this.ptr] === 0) {
    this.pc = this.jumpTo[this.pc];
  } else if (command === "]" && this.memory[this.ptr] !== 0) {
    this.pc = this.jumpTo[this.pc];
  }
};

Dicklang.prototype.run = function () {
  this.preprocess();

  while (this.pc < this.code.length) {
    const command = this.code[this.pc];

    if (command === ">") this.increasePtr();
    else if (command === "<") this.decreasePtr();
    else if (command === "+") this.increaseValue();
    else if (command === "-") this.decreaseValue();
    else if (command === ".") this.printValue();
    else if (command === ",") this.storingValue();
    else if (command === "[" || command === "]") this.jump(command);

    this.pc += 1;
  }
};

fs.readFile(process.argv[2], function (err, data) {
  if (err) throw new Error(err.message);
  const dick = new Dicklang();
  dick.load(data.toString());
  dick.run();
  process.stdout.write("\n");
});

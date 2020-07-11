// Credit to: https://github.com/timetocode/node-game-loop

function hrtimeMs() {
  let time = process.hrtime();
  return time[0] * 1000 + time[1] / 1000000;
}

class GameLoop {
  runGameLoop = false;
  previous = 0;
  tickRate = 20;
  tick = 0;
  updateFn: Function | null = null;

  startGameLoop(updateFunction = null, newTickRate = this.tickRate) {
    this.runGameLoop = true;
    this.previous = hrtimeMs();
    this.tickRate = newTickRate;
    this.updateFn = updateFunction;

    this.loop(); // starts the loop
  }

  stopGameLoop() {
    this.runGameLoop = false;
  }

  loop() {
    let tickLengthMs = 1000 / this.tickRate;
    if (this.runGameLoop) {
      setTimeout(this.loop.bind(this), tickLengthMs);
    }

    let now = hrtimeMs();
    let delta = (now - this.previous) / 1000;
    // console.log('delta', delta);

    if (this.updateFn) {
      this.updateFn(delta, this.tick); // game logic would go here
    }

    this.previous = now;
    this.tick++;
  }
}

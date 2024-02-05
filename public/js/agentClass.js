function Circle(id, status, time, x, y, r) {
  this.id = id;
  this.status = status;
  this.time = time;
  this.x = x;
  this.y = y;
  this.r = r;
  this.minRadius = r;
  this.maxRadius = r;
  this.color = statusDictionary[this.status];
  this.draw = function () {
    c.beginPath();
    c.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    // c.shadowBlur = 2;
    // c.shadowColor = this.color;
    c.fill();
  };
  this.updatePosition = function (x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.minRadius = r;
    this.maxRadius = r + 5;
    this.draw();
  };
  this.updateStatus = function (s, t) {
    this.status = s;
    this.time = t;
    this.color = statusDictionary[s];
    let lenofside = Math.sqrt(2 * this.r ** 2);
    c.clearRect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
    c.beginPath();
    c.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  };
  this.getId = function () {
    return this.id;
  };
  this.getStatus = function () {
    return this.status;
  };
  this.getTime = function () {
    return this.time;
  };
}

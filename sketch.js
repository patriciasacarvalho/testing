let data;
let points = [];
let yearSlider;

function preload() {
  data = loadTable('combined_stations.csv', 'csv', 'header');
}

function setup() {
  var width = document.getElementById('column_width').offsetWidth;
  let myCanvas1 = createCanvas(width, 500);
  myCanvas1.parent('mySketch');

  yearSlider = createSlider(2018, 2022, 2000);
  let sliderX = (width - yearSlider.width) / 2; // Center the slider
  let sliderY = height + 40;
  yearSlider.position(sliderX, sliderY);
  yearSlider.style('width', '250px');

  // Filter data for CHARLES RIVER, StationID = 012
  let charlesRiver012Data = data.rows.filter(
    (row) =>
      row.get("Region") === "CHARLES RIVER" && row.get("StationID") === "012"
  );
  let charlesRiver166Data = data.rows.filter(
    (row) =>
      row.get("Region") === "CHARLES RIVER" && row.get("StationID") === "166"
  );

  let filteredData = charlesRiver012Data.concat(charlesRiver166Data);

  for (let i = 0; i < data.getRowCount(); i++) {
    let row = data.getRow(i);
    let enterococcusCount = row.getNum('Enterococcus');
    let rainfallIntensity = row.getNum('Logan_rainfall_in');
    let color = getColor(enterococcusCount);
    let year = getYearFromDate(row.get('sample_date'));

    let point = new Point(rainfallIntensity, enterococcusCount, color, year);
    points.push(point);
  }
}

function draw() {
  background(255);
  drawAxes();

  fill(0);
  textAlign(LEFT);
  textSize(16);
  text('Selected Year: ' + yearSlider.value(), 20, height + 40);

  let selectedYear = yearSlider.value();
  for (let i = 0; i < points.length; i++) {
    points[i].display(selectedYear);

    if (dist(mouseX, mouseY, points[i].x, points[i].y) < 10) {
      points[i].displayTooltip();
    }
  }
}

function getColor(enterococcusCount) {
  return enterococcusCount > 61 ? color(255, 0, 0) : color(150);
}

function drawAxes() {
  stroke(0);
  line(0, height / 2, width, height / 2);
  line(width / 2, 0, width / 2, height);

  fill(0);
  textAlign(CENTER);
  textSize(12);
  text("0.01 - 0.25", width * 0.2, height / 2 + 20);
  text("0.51 - 0.75", width * 0.4, height / 2 + 20);
  text("0.76 - 1.0", width * 0.6, height / 2 + 20);
  text("1.01 - 1.5", width * 0.8, height / 2 + 20);
  text("1.51 - 3.0", width - 20, height / 2 + 20);

  // X-axis legend
  fill(0);
  textAlign(CENTER);
  textSize(16);
  text("Rainfall Intensity", width / 2, height - 1);

  // Y-axis legend
  push();
  translate(25, height / 2); // Adjusted translation to increase left margin
  rotate(-PI / 2);
  text("Enterococcus Count", 0, 0);
  pop();
}

function getYearFromDate(dateString) {
  let date = new Date(dateString);
  return date.getFullYear();
}

function windowResized() {
  let canvasWidth = min(650, windowWidth - 20);
  resizeCanvas(canvasWidth, 500);

  let sliderX = (width - yearSlider.width) / 2;
  let sliderY = height + 40;
  yearSlider.position(sliderX, sliderY);
}

class Point {
  constructor(x, y, color, year) {
    this.x = map(x, -.02, 2, 0, width);
    this.y = map(y, 0, 320, height, 0);
    this.color = color;
    this.year = year;
  }

  display(selectedYear) {
    if (this.year == selectedYear) {
      noStroke();
      fill(this.color);
      ellipse(this.x, this.y, 10, 10);
    }
  }

  displayTooltip() {
    fill(0);
    textAlign(CENTER);
    textSize(14);
    text(`Year: ${this.year}\nRainfall Intensity: ${this.x}\nEnterococcus Count: ${this.y}`, this.x, this.y - 20);
  }
}

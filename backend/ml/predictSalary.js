const { SimpleLinearRegression } =
require("ml-regression");

const x = [1, 2, 3, 4, 5, 6];
const y = [
  600000,
  1200000,
  1800000,
  2500000,
  3200000,
  4000000
];

const regression =
new SimpleLinearRegression(x, y);

function predictSalary(experience) {

  return Math.floor(
    regression.predict(experience)
  );

}

module.exports = predictSalary;
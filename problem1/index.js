var sum_to_n_a = function (n) {
  var sum = 0;
  for (var i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  if (n <= 0) return 0;
  return n * (n + 1) / 2;
};



var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return n + sum_to_n_c(n - 1);
};
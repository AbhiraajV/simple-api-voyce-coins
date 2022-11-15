var A = [3, "a", "a", "a", 2, 3, "a", 3, "a", 2, 4, 9, 3];
var mf = 1;
var ans;
for (var i = 0; i < A.length; i++) {
  var m = 0;
  for (var j = i; j < A.length; j++) if (A[i] == A[j]) m++;
  if (mf < m) {
    mf = m;
    ans = A[i];
  }
}
console.log(ans + " ( " + mf + " times ) ");

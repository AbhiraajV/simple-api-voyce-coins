const isPalindrome = (n) =>
  n === parseInt(n.toString().split("").reverse().join("")) * Math.sign(n);
console.log(isPalindrome(121));
console.log(isPalindrome(1212));

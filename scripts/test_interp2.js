const tok = 'weekend?'; 
const str = `thêm "${tok.replace(/[?]/g, '\\$&')}"`; 
console.log(str); 
console.log(new RegExp(str, 'i'));

const tok = 'weekend?'; 
const str = `thêm "${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`; 
const regex = new RegExp(str, 'i');
console.log(regex.test('thêm "weekend"'));
console.log(regex.test('thêm "weekend?"'));

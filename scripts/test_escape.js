const tok = 'weekend?'; 
const escaped = tok.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'); 
console.log(escaped); 
console.log(new RegExp('thêm "' + escaped + '"', 'i'));

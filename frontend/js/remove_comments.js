const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\hadi\\OneDrive\\Desktop\\college selection system\\pak-admissions';

function walk(d) {
  let res = [];
  fs.readdirSync(d).forEach(f => {
    const fullPath = path.join(d, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git')) {
      res = res.concat(walk(fullPath));
    } else if (stat.isFile()) {
      res.push(fullPath);
    }
  });
  return res;
}

const files = walk(dir);

files.forEach(file => {
  if(!file.match(/\.(js|css|html)$/)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let orig = content;

  if (file.endsWith('.html')) {
    // Remove HTML comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');
  } else if (file.endsWith('.css')) {
    // Remove CSS block comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  } else if (file.endsWith('.js')) {
    // Remove JS block comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove single line comments (except URLs)
    content = content.replace(/(?<!https?:)\/\/.*/g, '');
  }

  if (content !== orig) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned: ${file}`);
  }
});
console.log('Finished removing comments.');

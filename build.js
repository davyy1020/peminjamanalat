const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'style.css');
const jsPath = path.join(__dirname, 'app.js');
const outPath = path.join(__dirname, 'index_compiled.html');

const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>PEMINJAMAN ALAT EVENT – PECC POLINES</title>
  <meta name="description" content="Sistem Reservasi & Cek Ketersediaan Alat Event PECC Politeknik Negeri Semarang secara Real-Time. Desain Neobrutalism cepat, responsif, dan mudah."/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800;900&family=Public+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
${css}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
${js}
  <\/script>
</body>
</html>`;

fs.writeFileSync(outPath, html, 'utf8');
console.log('Compiled index_compiled.html successfully!');


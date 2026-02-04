const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiI0MjM3ZDZmYi0zOTA1LTQwNzQtOTVkNS1jNTBhNDgzNGVlYWQiLCJpYXQiOjE3NzAxOTgxNDUsImV4cCI6MTc3MDIwMTc0NX0.UHeiaT2gsuT5T78Qe8u3C7ryQeuZZehlF1u1a92lhuk';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/profile',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Profile Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();

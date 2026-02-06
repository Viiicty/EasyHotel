const http = require('http');

console.log('Testing API connection...');

const testRegister = () => {
  const data = JSON.stringify({
    email: 'merchant@example.com',
    password: '123456',
    name: 'Merchant User',
    role: 'merchant'
  });

  const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('Register Response Status:', res.statusCode);
      console.log('Register Response:', body);
      if (res.statusCode === 201 || res.statusCode === 200) {
        testLogin();
      }
    });
  });

  req.on('error', (e) => {
    console.error('Register Error:', e.message);
  });

  req.write(data);
  req.end();
};

const testLogin = () => {
  console.log('\nTesting login...');
  const data = JSON.stringify({
    email: 'merchant@example.com',
    password: '123456'
  });

  const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('Login Response Status:', res.statusCode);
      console.log('Login Response:', body);
    });
  });

  req.on('error', (e) => {
    console.error('Login Error:', e.message);
  });

  req.write(data);
  req.end();
};

testRegister();

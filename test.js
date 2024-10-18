import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
  cloud: {
    // Project: Testing
    projectID: 3717591,
    // Test runs with the same name groups test runs together.
    name: 'Test2'
  },
  threshold: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200']
  },
  // stages: [
  //   {duration: '1m', target: 100},
  //   {duration: '30s', target: 0},
  // ]
};

export default function() {
  http.get('http://localhost:8080/api/v1/product/allproducts');
  sleep(1);
}
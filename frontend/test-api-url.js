// Quick test to verify API URL configuration
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('Expected:', 'https://namastep-irod.onrender.com/api');

// Test axios instance
import('./lib/api.ts').then(module => {
  const api = module.default;
  console.log('API Base URL:', api.defaults.baseURL);
}).catch(err => {
  console.error('Error loading api:', err);
});

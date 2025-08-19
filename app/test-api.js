// Test script for financial analysis API
// Run this in the browser console after logging in

async function testFinancialAnalysisAPI() {
  try {
    // Get Firebase auth token
    const auth = getFirebaseAuth();
    if (!auth || !auth.currentUser) {
      console.error('User not authenticated');
      return;
    }

    const token = await auth.currentUser.getIdToken();
    
    // Test GET request
    const response = await fetch('/api/financial-analysis?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('API Response:', data);

    if (!response.ok) {
      console.error('API Error:', data);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testFinancialAnalysisAPI();

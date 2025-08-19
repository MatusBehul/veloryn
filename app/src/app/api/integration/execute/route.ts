import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

// Integration platform configuration
const INTEGRATION_ENABLED = process.env.ENABLE_INTEGRATION === 'true';
const INTEGRATION_BASE_URL = 'https://can686f6c6f1c22e3c16e9c2ae9.wadby.cloud';
const WORKFLOW_ENDPOINT = '6857adca5512b6bcae0ff18e/workflow/execute/689d9d2c81cb8c1187b231ff';
const INTEGRATION_HEADERS = {
  'instance': '686f6c6f1c22e3c16e9c2ae9',
  'AuthEntityType': 'service',
  'AuthKey': '689d91f2195fdb96927e5811',
  'Authorization': 'a19a38c753474cd4831ea492316ec2ce5b839959e80b4d3eb692799a1b732c24274bf4e6c78445e68f6e1b4ccbb301d6dc455129383d4e5cb80f9878e9d4c8b9eb9c000a55c34eb5ac0d20fee01e2c69',
  'Content-Type': 'application/json'
};

export async function POST(request: NextRequest) {
  try {
    // Check if integration is enabled
    if (!INTEGRATION_ENABLED) {
      return NextResponse.json({ 
        success: false,
        message: 'Integration disabled',
        data: null 
      });
    }

    // Verify authentication (optional - depending on if you want this to be protected)
    const authHeader = request.headers.get('Authorization');
    let userEmail: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        userEmail = decodedToken.email || null;
      } catch (error) {
        console.error('Error verifying token:', error);
        // Continue without authentication if token is invalid
      }
    }

    const body = await request.json();
    console.log('Integration request body:', JSON.stringify(body, null, 2));
    const { email, audience = 'customer', origin = 'default', keyName = 'ckey' } = body;

    // Use provided email or authenticated user's email, or use a default for anonymous users
    const targetEmail = email || userEmail || 'anonymous@visitor.com';

    console.log('Using email for integration:', targetEmail);

    // Prepare the payload for the integration platform
    const integrationPayload = {
      profile: {
        audience,
        origin,
        key_name: keyName,
        key_value: targetEmail
      }
    };

    // Call the integration platform
    try {
      const integrationUrl = `${INTEGRATION_BASE_URL}/${WORKFLOW_ENDPOINT}`;
      const response = await fetch(integrationUrl, {
        method: 'POST',
        headers: INTEGRATION_HEADERS,
        body: JSON.stringify(integrationPayload),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { rawResponse: responseText };
      }

      if (!response.ok) {
        console.error('Integration platform error:', response.status, responseData);
        return NextResponse.json({
          error: 'Integration platform request failed',
          status: response.status,
          details: responseData
        }, { status: 502 });
      }

      return NextResponse.json({
        success: true,
        message: 'Integration executed successfully',
        email: targetEmail,
        data: responseData
      });

    } catch (integrationError) {
      console.error('Error calling integration platform:', integrationError);
      return NextResponse.json({
        error: 'Failed to call integration platform',
        details: integrationError instanceof Error ? integrationError.message : 'Unknown error'
      }, { status: 502 });
    }

  } catch (error) {
    console.error('Error in integration endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

// Integration platform configuration
const INTEGRATION_ENABLED = process.env.ENABLE_INTEGRATION === 'true';
const INTEGRATION_BASE_URL = 'https://can686f6c6f1c22e3c16e9c2ae9.wadby.cloud';
const TENANT_ID = '6857adca5512b6bcae0ff18e';
const INTEGRATION_HEADERS = {
  'instance': '686f6c6f1c22e3c16e9c2ae9',
  'AuthEntityType': 'service',
  'AuthKey': '689d91f2195fdb96927e5811',
  'Authorization': 'a19a38c753474cd4831ea492316ec2ce5b839959e80b4d3eb692799a1b732c24274bf4e6c78445e68f6e1b4ccbb301d6dc455129383d4e5cb80f9878e9d4c8b9eb9c000a55c34eb5ac0d20fee01e2c69',
  'Content-Type': 'application/json'
};

interface ProfileRequest {
  email?: string;
  audience?: string;
  origin?: string;
  keyName?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if integration is enabled
    if (!INTEGRATION_ENABLED) {
      return NextResponse.json({ 
        action: 'skipped', 
        message: 'Integration disabled' 
      });
    }

    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    let userEmail: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        userEmail = decodedToken.email || null;
      } catch (error) {
        console.error('Error verifying token:', error);
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { email, audience = 'customer', origin = 'default', keyName = 'ckey' } = body as ProfileRequest;

    // Use provided email or authenticated user's email
    const targetEmail = email || userEmail;

    if (!targetEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Profile management for email:', targetEmail);

    // First, try to get existing profile using POST method
    const getProfileUrl = `${INTEGRATION_BASE_URL}/${TENANT_ID}/profile/get`;
    const profileQuery = {
      audience,
      origin,
      key_name: keyName,
      key_value: targetEmail
    };

    console.log('Checking for existing profile:', profileQuery);

    try {
      const getResponse = await fetch(getProfileUrl, {
        method: 'POST',
        headers: INTEGRATION_HEADERS,
        body: JSON.stringify(profileQuery),
      });

      if (getResponse.ok) {
        const existingProfile = await getResponse.json();
        console.log('Found existing profile:', existingProfile);
        
        return NextResponse.json({
          success: true,
          message: 'Profile found',
          profile: existingProfile,
          action: 'found'
        });
      } else {
        console.log('Profile not found, status:', getResponse.status);
        // Profile doesn't exist, create new one
      }
    } catch (getError) {
      console.log('Error checking for profile (will try to create):', getError);
      // Continue to create profile
    }

    // Create new profile
    const createProfileUrl = `${INTEGRATION_BASE_URL}/${TENANT_ID}/profile/create`;
    const createPayload = [
      {
        profile: {
          audience,
          origin,
          key_name: keyName,
          key_value: targetEmail
        }
      }
    ];

    console.log('Creating new profile:', createPayload);

    const createResponse = await fetch(createProfileUrl, {
      method: 'POST',
      headers: INTEGRATION_HEADERS,
      body: JSON.stringify(createPayload),
    });

    const createResponseText = await createResponse.text();
    let createResponseData;
    
    try {
      createResponseData = JSON.parse(createResponseText);
    } catch {
      createResponseData = { rawResponse: createResponseText };
    }

    console.log('Create profile response status:', createResponse.status);
    console.log('Create profile response:', createResponseData);

    if (!createResponse.ok) {
      // Check if the error is because profile already exists
      const isAlreadyExists = createResponseData?.length > 0 && 
        createResponseData[0]?.error === 'Profile already exists';
      
      if (isAlreadyExists) {
        console.log('ℹ️ Profile already exists, returning success');
        return NextResponse.json({
          success: true,
          message: 'Profile already exists',
          profile: createResponseData[0]?.detail?.profile || null,
          action: 'already_exists',
          email: targetEmail
        });
      } else {
        console.error('Profile creation failed:', createResponse.status, createResponseData);
        return NextResponse.json({
          error: 'Failed to create profile',
          status: createResponse.status,
          details: createResponseData
        }, { status: 502 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile: createResponseData,
      action: 'created',
      email: targetEmail
    });

  } catch (error) {
    console.error('Error in profile management:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

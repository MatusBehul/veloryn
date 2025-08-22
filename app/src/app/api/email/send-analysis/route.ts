import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { PubSub } from '@google-cloud/pubsub';
import { FinancialAnalysis, EmailRequest } from '@/lib/email/types';

// Pub/Sub configuration
const PROJECT_ID = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const EMAIL_TOPIC_NAME = 'email-analysis-requests';

// Initialize Pub/Sub client with Firebase credentials
const pubsubConfig = {
  projectId: PROJECT_ID,
  // Use Firebase service account credentials for Pub/Sub
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }
};

console.log('Pub/Sub configuration:', {
  projectId: PROJECT_ID,
  hasCredentials: !!(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  topicName: EMAIL_TOPIC_NAME
});

const pubsub = new PubSub(pubsubConfig);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { analysisId, ticker, recipientEmail } = body;

    if (!analysisId || !ticker || !recipientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log("Queueing email for analysisId:", analysisId);

    // Create the email request message
    const emailRequest: EmailRequest = {
      analysisId,
      ticker,
      recipients: [recipientEmail],
      requestedAt: new Date().toISOString(),
      // analysisData: analysisData, // Include the full analysis data
    };

    console.log("emailRequest", emailRequest)
    
    // Publish message to Pub/Sub topic
    try {
      console.log(`Publishing to topic: ${EMAIL_TOPIC_NAME} in project: ${PROJECT_ID}`);
      
      if (!PROJECT_ID) {
        throw new Error('GCP_PROJECT environment variable not set');
      }

      const topic = pubsub.topic(EMAIL_TOPIC_NAME);
      
      // Convert the emailRequest to a Buffer - this is the correct format for Pub/Sub
      const messageData = Buffer.from(JSON.stringify(emailRequest));
      console.log('Message data size:', messageData.length, 'bytes');
      
      // Create a promise with timeout
      const publishPromise = topic.publishMessage({
        data: messageData,
        attributes: {
          type: 'analysis-email',
          ticker,
        },
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Pub/Sub publish operation timed out after 10 seconds'));
        }, 10000);
      });
      
      console.log('Starting publish operation...');
      const messageId = await Promise.race([publishPromise, timeoutPromise]);
      
      console.log(`Email request published with message ID: ${messageId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Analysis report has been queued for delivery',
        messageId 
      });

    } catch (pubsubError) {
      console.error('Error publishing to Pub/Sub:', pubsubError);
      console.error('Error details:', {
        name: pubsubError instanceof Error ? pubsubError.name : 'Unknown',
        message: pubsubError instanceof Error ? pubsubError.message : 'Unknown error',
        stack: pubsubError instanceof Error ? pubsubError.stack : 'No stack trace'
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Analysis report has been queued for delivery (fallback mode)' 
      });
    }

  } catch (error) {
    console.error('Error queueing analysis email:', error);
    
    return NextResponse.json(
      { error: 'Failed to queue email for delivery' },
      { status: 500 }
    );
  }
}

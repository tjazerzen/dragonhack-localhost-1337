import { WebSocket } from 'ws';
import { NextResponse } from 'next/server';

let wsConnection: WebSocket | null = null;
let currentMessageId: string | null = null;
let currentSender: 'admin' | 'caller' | null = null;
let accumulatedText: string = '';

export async function POST(req: Request) {
  try {
    const { audioData, isInitialAuth, shouldClose } = await req.json();

    if (shouldClose) {
      if (wsConnection) {
        wsConnection.send(new Uint8Array(0));
        wsConnection.close();
        wsConnection = null;
        currentMessageId = null;
        currentSender = null;
        accumulatedText = '';
      }
      return NextResponse.json({ success: true });
    }

    if (isInitialAuth) {
      wsConnection = new WebSocket('wss://stt-rt.soniox.com/transcribe-websocket');
      currentMessageId = null;
      currentSender = null;
      accumulatedText = '';

      wsConnection.on('open', () => {
        console.log('WebSocket connection opened');
        wsConnection?.send(JSON.stringify({
          api_key: process.env.SONIOX_API_KEY,
          model: 'stt-rt-preview',
          audio_format: 'auto',
          enable_speaker_tags: true,
          language_hints: ['en']
        }));
      });

      wsConnection.on('message', (data) => {
        const response = JSON.parse(data.toString());

        if (response.text) {
          const speakerMatch = response.text.match(/^spk:(\d+)/);
          let cleanText = response.text;
          let sender: 'admin' | 'caller' = 'admin';

          if (speakerMatch) {
            const speakerNumber = parseInt(speakerMatch[1]);
            cleanText = response.text.replace(/^spk:\d+\s*/, '');
            sender = speakerNumber === 1 ? 'admin' : 'caller';
          }

          // Check if speaker has changed
          if (sender !== currentSender) {
            // If we have accumulated text from previous speaker, send it as complete
            if (currentMessageId && accumulatedText) {
              return NextResponse.json({
                type: 'update',
                messageId: currentMessageId,
                content: accumulatedText,
                isComplete: true
              });
            }

            // Start new message for new speaker
            currentMessageId = Math.random().toString(36).substring(7);
            currentSender = sender;
            accumulatedText = cleanText;

            return NextResponse.json({
              type: 'new',
              messageId: currentMessageId,
              content: cleanText,
              sender,
              isComplete: false
            });
          }

          // Same speaker, accumulate text
          accumulatedText = accumulatedText ? `${accumulatedText} ${cleanText}` : cleanText;

          // Stream the update
          return NextResponse.json({
            type: 'update',
            messageId: currentMessageId,
            content: accumulatedText,
            isComplete: false
          });
        }
      });

      wsConnection.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      wsConnection.on('close', () => {
        console.log('WebSocket connection closed');
        wsConnection = null;
        currentMessageId = null;
        currentSender = null;
        accumulatedText = '';
      });
    } else if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      const binaryData = Buffer.from(audioData, 'base64');
      wsConnection.send(binaryData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in Soniox API route:', error);
    return NextResponse.json({ error: 'Failed to process audio' }, { status: 500 });
  }
} 
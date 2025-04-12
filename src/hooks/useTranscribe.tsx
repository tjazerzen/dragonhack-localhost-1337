'use client';

import { RecorderState, RecordTranscribe } from '@soniox/speech-to-text-web';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TranscriptionResult {
  text: string;
  speaker?: number;
}

export default function useTranscribe() {
  const recordTranscribe = useRef<RecordTranscribe | null>(null);
  const [state, setState] = useState<RecorderState>('Init');
  const [text, setText] = useState<string>('');

  useEffect(() => {
    // Initialize the recorder only on the client side
    if (typeof window !== 'undefined') {
      recordTranscribe.current = new RecordTranscribe({
        webSocketUri: 'wss://stt-rt.soniox.com/transcribe-websocket',
        apiKey: process.env.NEXT_PUBLIC_SONIOX_API_KEY!,
      });
    }

    return () => {
      recordTranscribe.current?.cancel();
    };
  }, []);

  const startTranscription = useCallback(async () => {
    if (!recordTranscribe.current) return;
    
    setText('');

    recordTranscribe.current.start({
      model: 'stt-rt-preview',
      languageHints: ['en'],
      enableSpeakerTags: true,
      onFinished: () => {
        console.log('transcription finished');
      },
      onStarted: () => {
        console.log('transcription started');
      },
      onError: (status, message, code) => {
        console.error(status, message, code);
      },
      onStateChange({ newState }) {
        setState(newState);
      },
      onPartialResult(result: TranscriptionResult) {
        // Add speaker tag to the text in the format spk:NUMBER
        const speakerNumber = result.speaker || 2; // Default to 2 (caller) if no speaker
        setText((text) => {
          // If we have existing text, check if it has a speaker tag
          if (text && text.startsWith('spk:')) {
            // Extract current speaker number
            const currentMatch = text.match(/^spk:(\d+)/);
            if (currentMatch && currentMatch[1] === speakerNumber.toString()) {
              // Same speaker, append text
              return text + result.text;
            }
            // Different speaker, start new text
            return `spk:${speakerNumber}:${result.text}`;
          }
          // No existing text, start with speaker tag
          return `spk:${speakerNumber}:${result.text}`;
        });
      },
    });
  }, []);

  const stopTranscription = useCallback(() => {
    recordTranscribe.current?.stop();
  }, []);

  return {
    startTranscription,
    stopTranscription,
    state,
    text,
  };
}
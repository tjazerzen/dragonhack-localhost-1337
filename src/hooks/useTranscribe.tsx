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
      languageHints: ['en', 'sl'],
      enableSpeakerTags: true,
      context: `
        ## Instructions

        You will transcribe a conversation between a caller in distress and an emergency operator. 
        The caller will be speaking in English. The operator will be speaking in English. 
        The locations the caller will mention will be in Slovenia.

        ## Cities 
        
        Following cities will possibly be mentioned:
        Ljubljana.
        Maribor.
        Celje.
        Kranj.

        ## Important words to keep in context

        You should always adhere and try to match the following words:
        - ulica
        - požar
        - Slovenija
        - slovenska
        - avtocesta
        - Čopova

        ## Important roads

        - Slovenska cesta
        - Trubarjeva cesta
        - Copova cesta
      `,
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
        setText(result.text);
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
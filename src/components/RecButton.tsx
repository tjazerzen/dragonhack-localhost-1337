'use client';

import { Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useTranscribe from '@/hooks/useTranscribe';
import { useChatStore } from '@/store/chatStore';
import { useIncidentStore } from '@/store/incidentStore';

export default function RecButton() {
  const [isRecording, setIsRecording] = useState(false);
  const { text, startTranscription, stopTranscription } = useTranscribe();
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToMessage = useChatStore((state) => state.appendToMessage);
  const [currentSpeaker, setCurrentSpeaker] = useState<'admin' | 'caller' | undefined>(undefined);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const setExtractedCoordinates = useIncidentStore((state) => state.setExtractedCoordinates);
  const [coordinatesFoundThisSession, setCoordinatesFoundThisSession] = useState(false);

  const callGeocodeAgent = async () => {
    if (coordinatesFoundThisSession) {
      console.log("Coordinates already found this session, skipping API call.");
      return;
    }

    console.log("Speaker changed, calling geocode agent API...");
    const currentMessages = useChatStore.getState().messages;
    const transcript = currentMessages
      .map(msg => `${msg.sender}: ${msg.content}`)
      .join("\n");

    if (!transcript) {
      console.log("No transcript to process, skipping API call.");
      return;
    }

    try {
      const response = await fetch('/api/geocode-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      const coordinates = data.coordinates;

      if (coordinates) {
        console.log("Geocode agent coordinates received:", coordinates);
        setExtractedCoordinates(coordinates);
        setCoordinatesFoundThisSession(true);
      } else {
        console.log("Geocode agent returned no coordinates.");
      }

    } catch (error) {
      console.error("Error calling geocode agent API:", error);
    }
  };

  useEffect(() => {
    if (isRecording) {
      setCoordinatesFoundThisSession(false);
      startTranscription();
    } else {
      stopTranscription();
    }
  }, [isRecording, startTranscription, stopTranscription]);

  useEffect(() => {
    if (text) {
      const match = text.match(/spk:(\d+)([\s\S]*)/);
      if (match) {
        const [, speakerNumber, content] = match;
        const newSpeaker = speakerNumber === '1' ? 'admin' : 'caller';

        if (newSpeaker !== currentSpeaker) {
          setCurrentSpeaker(newSpeaker);
          const newMessageId = addMessage(content.trim(), newSpeaker);
          setCurrentMessageId(newMessageId);
          callGeocodeAgent();
        } else if (currentMessageId) {
          appendToMessage(currentMessageId, content);
        }
      } else if (currentMessageId) {
        appendToMessage(currentMessageId, text);
      }
    }
  }, [text, addMessage, currentSpeaker, currentMessageId, appendToMessage, setExtractedCoordinates, coordinatesFoundThisSession]);

  return (
    <Button
      variant={isRecording ? 'destructive' : 'ghost'}
      className='w-[130px] flex flex-row justify-start items-center gap-2 hover:cursor-pointer transition-all duration-300 ease-in-out'
      onClick={() => setIsRecording(!isRecording)}
    >
      <motion.div
        layout
        animate={{
          scale: isRecording ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isRecording ? Infinity : 0,
          ease: 'easeInOut',
          layout: { duration: 0.3 }
        }}
      >
        <Circle
          color={isRecording ? 'white' : 'red'}
          fill={isRecording ? 'white' : 'red'}
          className='w-4 h-4 transition-colors duration-300'
        />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          layout
          key={isRecording ? 'recording' : 'record'}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{
            duration: 0.3,
            layout: { duration: 0.3 }
          }}
          className='text-medium w-fit text-center'
        >
          {isRecording ? 'Recording...' : 'Record'}
        </motion.p>
      </AnimatePresence>
    </Button>
  );
} 
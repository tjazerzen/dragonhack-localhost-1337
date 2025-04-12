'use client';

import { Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useTranscribe from '@/hooks/useTranscribe';
import { useChatStore } from '@/store/chatStore';

export default function RecButton() {
  const [isRecording, setIsRecording] = useState(false);
  const { text, startTranscription, stopTranscription } = useTranscribe();
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const [currentSpeaker, setCurrentSpeaker] = useState<'admin' | 'caller'>('caller');

  useEffect(() => {
    if (isRecording) {
      startTranscription();
    } else {
      stopTranscription();
    }
  }, [isRecording, startTranscription, stopTranscription]);

  useEffect(() => {
    if (text) {
      if (text.startsWith('spk:')) {
        const match = text.match(/^spk:(\d+)(.*)/);
        console.log(match);
        if (match) {
          const [, speakerNumber, content] = match;
          setCurrentSpeaker(speakerNumber === '1' ? 'admin' : 'caller');

          updateMessage(content.trim(), currentSpeaker, true);
          addMessage(content.trim(), currentSpeaker, true);
        }
      } else {
        addMessage(text.trim(), currentSpeaker, true);
      }
    } 
  }, [text, addMessage, currentSpeaker, updateMessage]);

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
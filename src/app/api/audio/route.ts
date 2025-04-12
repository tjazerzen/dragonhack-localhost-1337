import { spawn } from 'child_process';
import { Writable } from 'stream';
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function POST(req: Request) {
  const audioStream = new Writable({
    write(chunk, encoding, callback) {
      // Write the audio chunk to a Python script for transcription
      const pythonProcess = spawn('python3', ['path/to/transcribe.py']);

      pythonProcess.stdin.write(chunk);
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => {
        console.log('Transcription:', data.toString());
        // TODO: Push transcription to the client (e.g., via WebSocket or SSE)
      });

      pythonProcess.stderr.on('data', (err) => {
        console.error('Error:', err.toString());
      });

      pythonProcess.on('close', () => {
        callback();
      });
    },
  });

  if (!req.body) {
    return new Response('No audio data received', { status: 400 });
  }

  const reader = req.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    audioStream.write(value);
  }
  audioStream.end();
  return new Response('Audio received', { status: 200 });
}
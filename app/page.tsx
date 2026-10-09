'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'temporizador_cocina_minutos';

type TimerState = 'idle' | 'running' | 'paused' | 'finished';

function playBeep() {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 880;
  oscillator.type = 'sine';
  gainNode.gain.value = 0.3;

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    audioContext.close();
  }, 500);
}

export default function Home() {
  const [minutes, setMinutes] = useState<number>(1);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 999) {
        setMinutes(parsed);
        setSecondsRemaining(parsed * 60);
      }
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setMinutes(0);
      return;
    }

    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;

    const clamped = Math.min(999, Math.max(0, parsed));
    setMinutes(clamped);

    if (clamped >= 1) {
      localStorage.setItem(STORAGE_KEY, clamped.toString());
      clearTimer();
      setSecondsRemaining(clamped * 60);
      setTimerState('idle');
    }
  };

  const handleMinutesBlur = () => {
    if (minutes < 1) {
      setMinutes(1);
      localStorage.setItem(STORAGE_KEY, '1');
      setSecondsRemaining(60);
    }
  };

  const startTimer = () => {
    if (minutes < 1) return;

    setTimerState('running');

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setTimerState('finished');
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearTimer();
    setTimerState('paused');
  };

  const resumeTimer = () => {
    setTimerState('running');

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setTimerState('finished');
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    clearTimer();
    const validMinutes = minutes >= 1 ? minutes : 1;
    setSecondsRemaining(validMinutes * 60);
    setTimerState('idle');
  };

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isInputDisabled = timerState === 'running';
  const showStart = timerState === 'idle' || timerState === 'finished';
  const showPause = timerState === 'running';
  const showResume = timerState === 'paused';

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <h1 className="text-[28px] font-semibold text-[#222] text-center mb-8">
          Temporizador de Cocina
        </h1>

        <div className="mb-6">
          <label htmlFor="minutes" className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Minutos
          </label>
          <Input
            id="minutes"
            type="number"
            min={1}
            max={999}
            value={minutes === 0 ? '' : minutes}
            onChange={handleMinutesChange}
            onBlur={handleMinutesBlur}
            disabled={isInputDisabled}
            className="w-20 px-3 py-2 text-center border border-[#ddd] rounded-[0.25rem] disabled:bg-gray-100"
          />
        </div>

        <div className="bg-[#f5f5f5] rounded-[0.25rem] p-5 mb-6 h-20 flex items-center justify-center">
          <span
            className="text-[64px] leading-none text-[#1a1a1a]"
            style={{ fontFamily: 'Monaco, "Courier New", monospace' }}
          >
            {formatTime(secondsRemaining)}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {showStart && (
            <Button
              onClick={startTimer}
              disabled={minutes < 1}
              className="flex-1 h-12 text-base font-medium bg-[#007AFF] hover:bg-[#0051D5] active:bg-[#003F99] text-white rounded-[0.25rem]"
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar
            </Button>
          )}

          {showPause && (
            <Button
              onClick={pauseTimer}
              className="flex-1 h-12 text-base font-medium bg-[#007AFF] hover:bg-[#0051D5] active:bg-[#003F99] text-white rounded-[0.25rem]"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pausar
            </Button>
          )}

          {showResume && (
            <Button
              onClick={resumeTimer}
              className="flex-1 h-12 text-base font-medium bg-[#007AFF] hover:bg-[#0051D5] active:bg-[#003F99] text-white rounded-[0.25rem]"
            >
              <Play className="w-5 h-5 mr-2" />
              Reanudar
            </Button>
          )}

          <Button
            onClick={resetTimer}
            variant="secondary"
            className="flex-1 h-12 text-base font-medium bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#333] rounded-[0.25rem]"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar
          </Button>
        </div>
      </div>
    </main>
  );
}

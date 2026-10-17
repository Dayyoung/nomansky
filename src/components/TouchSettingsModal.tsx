import React, { useState } from 'react';
import { X, Sliders, Smartphone, Move, RotateCcw, Vibrate, Check, HelpCircle, Sparkles, Flame, Eye, Lock } from 'lucide-react';
import { game, TouchSettings } from '../gameEngine';
import { AudioSys } from '../audio';

interface TouchSettingsModalProps {
  onClose: () => void;
}

export const TouchSettingsModal: React.FC<TouchSettingsModalProps> = ({ onClose }) => {
  const currentSettings = game.data.touchSettings || {
    joystickMode: 'DYNAMIC',
    joystickRadius: 50,
    lookSensitivity: 1.0,
    invertPitch: false,
    autoSprintLock: true,
    hapticFeedback: true,
    buttonScale: 'NORMAL',
    doubleTapAction: 'TARGET_ALIGN'
  };

  const [settings, setSettings] = useState<TouchSettings>({ ...currentSettings });
  const [activeTab, setActiveTab] = useState<'settings' | 'guide'>('settings');

  const updateSetting = <K extends keyof TouchSettings>(key: K, value: TouchSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    game.updateTouchSettings({ [key]: value });
    if (key === 'hapticFeedback' && value) {
      game.triggerHaptic(20);
    }
  };

  const handleResetDefaults = () => {
    const defaults: TouchSettings = {
      joystickMode: 'DYNAMIC',
      joystickRadius: 50,
      lookSensitivity: 1.0,
      invertPitch: false,
      autoSprintLock: true,
      hapticFeedback: true,
      buttonScale: 'NORMAL',
      doubleTapAction: 'TARGET_ALIGN'
    };
    setSettings(defaults);
    game.updateTouchSettings(defaults);
    game.triggerHaptic(30);
    AudioSys.playRecharge();
    game.spawnFloatText('🔄 터치 조작 설정이 기본값으로 초기화되었습니다', undefined, undefined, '#38bdf8');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 bg-black/80 backdrop-blur-md pointer-events-auto select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-950/95 border-2 border-cyan-400/80 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.4)] text-white font-mono flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-sm xs:text-base font-extrabold text-white tracking-wider nms-header-font">
                모바일 터치 조작 설정 // CONTROLS
              </h2>
              <span className="text-[9px] text-cyan-300/80">터치 가상 조이스틱, 시점 감도 & 제스처 체계</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-400 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-slate-900/60 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 font-bold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-slate-950 text-cyan-300 border-t border-x border-cyan-400/60'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>조작 세부 설정</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 font-bold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-slate-950 text-cyan-300 border-t border-x border-cyan-400/60'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>제스처 & 핑거 조작 가이드</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {activeTab === 'settings' ? (
            <>
              {/* 1. Joystick Mode Selection */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Move className="w-4 h-4 text-cyan-400" />
                    <span>가상 조이스틱 모드</span>
                  </span>
                  <span className="text-[10px] text-gray-400">화면 좌측 영역</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSetting('joystickMode', 'DYNAMIC')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      settings.joystickMode === 'DYNAMIC'
                        ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                        : 'bg-slate-950 border-white/10 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between text-xs mb-1">
                      <span>💫 동적 플로팅 (추천)</span>
                      {settings.joystickMode === 'DYNAMIC' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[9.5px] text-gray-300 block">
                      화면 왼쪽 어디든 엄지를 대면 그 위치에 조이스틱이 즉각 생성됩니다.
                    </span>
                  </button>

                  <button
                    onClick={() => updateSetting('joystickMode', 'FIXED')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      settings.joystickMode === 'FIXED'
                        ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                        : 'bg-slate-950 border-white/10 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between text-xs mb-1">
                      <span>📍 고정형 베이스</span>
                      {settings.joystickMode === 'FIXED' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[9.5px] text-gray-300 block">
                      좌측 하단 항상 정해진 위치에 원형 가상 스틱이 고정 표시됩니다.
                    </span>
                  </button>
                </div>

                {/* Auto Sprint Lock Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <span className="font-bold text-gray-200 block text-[11px]">
                      스프린트 / 펄스 부스트 고정 락 (Sprint Lock)
                    </span>
                    <span className="text-[9.5px] text-gray-400">
                      스틱을 위쪽 게이트(▲)로 밀면 엄지를 떼지 않고 계속 질주/부스트 유지
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSprintLock}
                    onChange={(e) => updateSetting('autoSprintLock', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Look Sensitivity & Camera */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>시점 회전 & 조준 감도 (Sensitivity)</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-cyan-200 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400/40">
                    {settings.lookSensitivity.toFixed(1)}x
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400">0.5x</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={settings.lookSensitivity}
                    onChange={(e) => updateSetting('lookSensitivity', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400">2.5x</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-200 block text-[11px]">상하 시점 반전 (Invert Y)</span>
                      <span className="text-[9.5px] text-gray-400">피치 상하 조작 방향 반전</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.invertPitch}
                      onChange={(e) => updateSetting('invertPitch', e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-200 block text-[11px]">더블 탭 제스처 (Double Tap)</span>
                      <span className="text-[9.5px] text-gray-400">우주: 행성 정렬 / 지상: 전방 시점</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.doubleTapAction !== 'NONE'}
                      onChange={(e) => updateSetting('doubleTapAction', e.target.checked ? 'TARGET_ALIGN' : 'NONE')}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Button Layout & Haptic Feedback */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Vibrate className="w-4 h-4 text-cyan-400" />
                    <span>버튼 크기 & 햅틱 진동 피드백</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-200">액션 버튼 크기 (Button Scale):</span>
                  <div className="flex items-center gap-1">
                    {(['SMALL', 'NORMAL', 'LARGE'] as const).map((scale) => (
                      <button
                        key={scale}
                        onClick={() => updateSetting('buttonScale', scale)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          settings.buttonScale === scale
                            ? 'bg-cyan-500 text-black border-cyan-300 font-extrabold shadow'
                            : 'bg-slate-950 border-white/10 text-gray-300 hover:text-white'
                        }`}
                      >
                        {scale === 'SMALL' ? '소 (88%)' : scale === 'NORMAL' ? '보통 (100%)' : '대 (115%)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <span className="font-bold text-gray-200 block text-[11px]">터치 햅틱 진동 (Haptics)</span>
                    <span className="text-[9.5px] text-gray-400">버튼 터치, 락 걸림 시 물리 진동 피드백</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => game.triggerHaptic(30)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[9.5px] text-cyan-300 border border-white/10 active:scale-95 cursor-pointer"
                    >
                      진동 테스트
                    </button>
                    <input
                      type="checkbox"
                      checked={settings.hapticFeedback}
                      onChange={(e) => updateSetting('hapticFeedback', e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* 4. Gesture & Finger Controls Guide */
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-cyan-400/40 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Move className="w-4 h-4 text-cyan-400" />
                  <span>1. 좌측 화면: 360° 가상 조이스틱 이동 & 조향</span>
                </div>
                <p className="text-[10px] text-gray-300 pl-6">
                  화면 왼쪽 45% 영역을 터치하여 원하는 방향으로 드래그하면 엑소슈트 보행 또는 우주선 3D 비행 조향이 정밀하게 작동합니다.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-amber-400/40 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>2. 조이스틱 상단 밀기: 스프린트 / 부스트 고정 (Lock)</span>
                </div>
                <p className="text-[10px] text-gray-300 pl-6">
                  조이스틱을 위쪽으로 힘껏 밀어올리면 <strong className="text-amber-300">[부스트/달리기 락]</strong>이 걸려 손을 피로하게 뻗고 있지 않아도 최고 속력으로 순항합니다.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-blue-400/40 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>3. 우측 화면: 360° 시점 회전 & 크로스헤어 조준</span>
                </div>
                <p className="text-[10px] text-gray-300 pl-6">
                  화면 우측 빈 공간을 한 손가락으로 가볍게 스와이프하면 3D 카메라가 자연스러운 관성으로 부드럽게 회전하여 시야를 확보합니다.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-teal-400/40 space-y-1.5">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>4. 두 손가락 핀치 줌 & 더블 탭 제스처</span>
                </div>
                <p className="text-[10px] text-gray-300 pl-6">
                  • <strong>두 손가락 핀치</strong>: 화면을 모으거나 벌리면 카메라 줌 인/아웃(0.4x ~ 3.0x) 지원<br />
                  • <strong>더블 탭</strong>: 우주에서는 인근 행성으로 방향 즉시 자동 정렬, 지상에서는 정면 시점으로 즉시 재배치
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-emerald-400/40 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>5. 인체공학적 엄지 액션 버튼 클러스터</span>
                </div>
                <p className="text-[10px] text-gray-300 pl-6">
                  우측 하단의 큰 원형 버튼으로 레이저 채광 및 함포 사격, 제트팩 도약, 우주선 탑승/착륙 [E] 상호작용 및 퀵 리차지 다이얼을 한 손으로 원활하게 조작할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cyan-500/30 bg-slate-900/90">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본값 초기화</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer active:scale-95"
          >
            설정 완료 // CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Settings,
  Mic,
  Key,
  Shield,
  Keyboard,
  TestTube,
  Sparkles,
  X,
} from "lucide-react";
import TitleBar from "./TitleBar";
import ApiKeyInput from "./ui/ApiKeyInput";
import PermissionCard from "./ui/PermissionCard";
import StepProgress from "./ui/StepProgress";
import { AlertDialog } from "./ui/dialog";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useDialogs } from "../hooks/useDialogs";
import { usePermissions } from "../hooks/usePermissions";
import { useClipboard } from "../hooks/useClipboard";
import { useSettings } from "../hooks/useSettings";
import { getLanguageLabel, getReasoningModelLabel } from "../utils/languages";
import LanguageSelector from "./ui/LanguageSelector";
const InteractiveKeyboard = React.lazy(() => import("./ui/Keyboard"));
import { formatHotkeyLabel } from "../utils/hotkeys";

interface OnboardingFlowProps {
  onComplete: () => void;
}


export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep, removeCurrentStep] = useLocalStorage(
    "onboardingCurrentStep",
    0,
    {
      serialize: String,
      deserialize: (value) => parseInt(value, 10),
    }
  );

  const {
    preferredLanguage,
    useReasoningModel,
    reasoningModel,
    ppqApiKey,
    dictationKey,
    setDictationKey,
    updateTranscriptionSettings,
    updateReasoningSettings,
    updateApiKeys,
  } = useSettings();

  const [apiKey, setApiKey] = useState(ppqApiKey);
  const [hotkey, setHotkey] = useState(dictationKey || "`");
  const readableHotkey = formatHotkeyLabel(hotkey);
  const { alertDialog, showAlertDialog, hideAlertDialog } = useDialogs();
  const practiceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activeReasoningModelLabel = useMemo(
    () => getReasoningModelLabel(reasoningModel),
    [reasoningModel]
  );

  const permissionsHook = usePermissions(showAlertDialog);
  const { pasteFromClipboard } = useClipboard(showAlertDialog);

  const steps = [
    { title: "Welcome", icon: Sparkles },
    { title: "Setup", icon: Settings },
    { title: "Permissions", icon: Shield },
    { title: "Hotkey", icon: Keyboard },
    { title: "Practice", icon: TestTube },
    { title: "Finish", icon: Check },
  ];

  useEffect(() => {
    if (currentStep === 4 && practiceTextareaRef.current) {
      practiceTextareaRef.current.focus();
    }
  }, [currentStep]);

  const saveSettings = useCallback(async () => {
    updateTranscriptionSettings({
      preferredLanguage,
    });
    updateReasoningSettings({
      useReasoningModel,
      reasoningModel,
    });
    setDictationKey(hotkey);
    try {
      const result = await window.electronAPI?.updateHotkey?.(hotkey);
      if (result && !result.success) {
        showAlertDialog({
          title: "Hotkey Not Registered",
          description:
            result.message ||
            "We couldn't register that key. Please choose another hotkey.",
        });
      }
    } catch (error) {
      console.error("Failed to register onboarding hotkey", error);
      showAlertDialog({
        title: "Hotkey Error",
        description: "We couldn't register that key. Please choose another hotkey.",
      });
    }

    localStorage.setItem(
      "micPermissionGranted",
      permissionsHook.micPermissionGranted.toString()
    );
    localStorage.setItem(
      "accessibilityPermissionGranted",
      permissionsHook.accessibilityPermissionGranted.toString()
    );
    localStorage.setItem("onboardingCompleted", "true");

    const trimmedKey = apiKey.trim();
    if (trimmedKey) {
      await window.electronAPI.savePPQKey(trimmedKey);
      updateApiKeys({ ppqApiKey: trimmedKey });
    }
  }, [
    hotkey,
    preferredLanguage,
    permissionsHook.micPermissionGranted,
    permissionsHook.accessibilityPermissionGranted,
    apiKey,
    updateTranscriptionSettings,
    updateReasoningSettings,
    updateApiKeys,
    setDictationKey,
    useReasoningModel,
    reasoningModel,
    showAlertDialog,
  ]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);

      // Show dictation panel when moving from permissions step (2) to hotkey step (3)
      if (currentStep === 2 && newStep === 3) {
        if (window.electronAPI?.showDictationPanel) {
          window.electronAPI.showDictationPanel();
        }
      }
    }
  }, [currentStep, setCurrentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
    }
  }, [currentStep, setCurrentStep]);

  const finishOnboarding = useCallback(async () => {
    await saveSettings();
    // Clear the onboarding step since we're done
    removeCurrentStep();
    onComplete();
  }, [saveSettings, removeCurrentStep, onComplete]);

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div
            className="text-center space-y-6"
            style={{ fontFamily: "Noto Sans, sans-serif" }}
          >
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2
                className="text-2xl font-bold text-stone-900 mb-2"
                style={{ fontFamily: "Noto Sans, sans-serif" }}
              >
                Welcome to PPQ Voice
              </h2>
              <p
                className="text-stone-600"
                style={{ fontFamily: "Noto Sans, sans-serif" }}
              >
                Let's set up your voice dictation in just a few simple steps.
              </p>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200/60">
              <p
                className="text-sm text-blue-800"
                style={{ fontFamily: "Noto Sans, sans-serif" }}
              >
                🎤 Turn your voice into text instantly
                <br />
                ⚡ Works anywhere on your computer
                <br />
                🔒 Your privacy is protected
              </p>
            </div>
          </div>
        );

      case 1: // Setup
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect to PPQ Cloud
              </h2>
              <p className="text-gray-600">
                Use your PPQ API key (powered by Groq) and choose the language you primarily speak.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <Key className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">PPQ API Key</h3>
                    <p className="text-sm text-blue-700">
                      This single key powers Groq Whisper for transcription and Llama/Mixtral for clean-up.
                    </p>
                  </div>
                </div>
                <ApiKeyInput
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  label="PPQ API Key"
                  helpText="Generate one from console.groq.com/keys using your ppq.ai login."
                />
                <p className="text-xs text-blue-800">
                  Keys stay on your device and are sent directly to Groq&apos;s APIs over HTTPS—never to PPQ servers.
                </p>
              </div>

              <div className="space-y-4 p-6 bg-white border border-stone-200 rounded-2xl shadow-sm">
                <h3 className="font-semibold text-stone-900">Preferred Language</h3>
                <p className="text-sm text-stone-600">
                  Whisper is fastest when it knows what to expect. You can change this later in Settings.
                </p>
                <LanguageSelector
                  value={preferredLanguage}
                  onChange={(value) => updateTranscriptionSettings({ preferredLanguage: value })}
                />
                <p className="text-xs text-stone-500">
                  Leave on Auto-detect if you frequently switch languages mid-dictation.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-900">
                PPQ Voice is now fully cloud-only—no local installers or custom URLs. Just plug in your key and start speaking.
              </p>
            </div>
          </div>
        );

      case 2: // Permissions
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Grant Permissions
              </h2>
              <p className="text-gray-600">
                PPQ Voice needs a couple of permissions to work properly
              </p>
            </div>

            <div className="space-y-4">
              <PermissionCard
                icon={Mic}
                title="Microphone Access"
                description="Required to record your voice"
                granted={permissionsHook.micPermissionGranted}
                onRequest={permissionsHook.requestMicPermission}
                buttonText="Grant Access"
              />

              <PermissionCard
                icon={Shield}
                title="Accessibility Permission"
                description="Required to paste text automatically"
                granted={permissionsHook.accessibilityPermissionGranted}
                onRequest={permissionsHook.testAccessibilityPermission}
                buttonText="Test & Grant"
              />
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">
                🔒 Privacy Note
              </h4>
              <p className="text-sm text-amber-800">
                PPQ Voice only uses these permissions for dictation. Audio is encrypted and sent straight to Groq&apos;s PPQ Cloud—nothing is stored on PPQ servers.
              </p>
            </div>
          </div>
        );

      case 3: // Choose Hotkey
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Hotkey
              </h2>
              <p className="text-gray-600">
                Select which key you want to press to start/stop dictation
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activation Key
                </label>
                <Input
                  placeholder="Default: ` (backtick)"
                  value={hotkey}
                  onChange={(e) => setHotkey(e.target.value)}
                  className="text-center text-lg font-mono"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Press this key from anywhere to start/stop dictation
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Click any key to select it:
                </h4>
                <React.Suspense fallback={<div>Loading keyboard...</div>}>
                  <InteractiveKeyboard selectedKey={hotkey} setSelectedKey={setHotkey} />
                </React.Suspense>
              </div>
            </div>
          </div>
        );

      case 4: // Test & Practice
        return (
          <div
            className="space-y-6"
            style={{ fontFamily: "Noto Sans, sans-serif" }}
          >
            <div className="text-center">
              <h2
                className="text-2xl font-bold text-stone-900 mb-2"
                style={{ fontFamily: "Noto Sans, sans-serif" }}
              >
                Test & Practice
              </h2>
              <p
                className="text-stone-600"
                style={{ fontFamily: "Noto Sans, sans-serif" }}
              >
                Let's test your setup and practice using PPQ Voice
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-200/60">
                <h3
                  className="font-semibold text-blue-900 mb-3"
                  style={{ fontFamily: "Noto Sans, sans-serif" }}
                >
                  Practice with Your Hotkey
                </h3>
                <p
                  className="text-sm text-blue-800 mb-4"
                  style={{ fontFamily: "Noto Sans, sans-serif" }}
                >
                  <strong>Step 1:</strong> Click in the text area below to place
                  your cursor there.
                  <br />
                  <strong>Step 2:</strong> Press{" "}
                  <kbd className="bg-white px-2 py-1 rounded text-xs font-mono border border-blue-200">
                    {readableHotkey}
                  </kbd>{" "}
                  to start recording, then speak something.
                  <br />
                  <strong>Step 3:</strong> Press{" "}
                  <kbd className="bg-white px-2 py-1 rounded text-xs font-mono border border-blue-200">
                    {readableHotkey}
                  </kbd>{" "}
                  again to stop and see your transcribed text appear where your
                  cursor is!
                </p>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-stone-600">
                      <Mic className="w-4 h-4" />
                      <span style={{ fontFamily: "Noto Sans, sans-serif" }}>
                        Click in the text area below, then press{" "}
                        <kbd className="bg-white px-1 py-0.5 rounded text-xs font-mono border">
                          {readableHotkey}
                        </kbd>{" "}
                        to start dictation
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-stone-700 mb-2"
                      style={{ fontFamily: "Noto Sans, sans-serif" }}
                    >
                      Transcribed Text:
                    </label>
                    <Textarea
                      ref={practiceTextareaRef}
                      rows={4}
                      placeholder="Click here to place your cursor, then use your hotkey to start dictation..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50/50 p-4 rounded-lg border border-green-200/60">
                <h4
                  className="font-medium text-green-900 mb-2"
                  style={{ fontFamily: "Noto Sans, sans-serif" }}
                >
                  💡 How to use PPQ Voice:
                </h4>
                <ol
                  className="text-sm text-green-800 space-y-1"
                  style={{ fontFamily: "Noto Sans, sans-serif" }}
                >
                  <li>1. Click in any text field (email, document, etc.)</li>
                  <li>
                    2. Press{" "}
                    <kbd className="bg-white px-2 py-1 rounded text-xs font-mono border border-green-200">
                      {readableHotkey}
                    </kbd>{" "}
                    to start recording
                  </li>
                  <li>3. Speak your text clearly</li>
                  <li>
                    4. Press{" "}
                    <kbd className="bg-white px-2 py-1 rounded text-xs font-mono border border-green-200">
                      {readableHotkey}
                    </kbd>{" "}
                    again to stop
                  </li>
                  <li>
                    5. Your text will automatically appear where you were
                    typing!
                  </li>
                </ol>
              </div>
            </div>
          </div>
        );


      case 5: // Complete
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're All Set!
              </h2>
              <p className="text-gray-600">
                PPQ Voice is now configured and ready to use.
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Your Setup Summary:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cloud Provider:</span>
                  <span className="font-medium">PPQ Cloud (Groq)</span>
                </div>
                <div className="flex justify-between">
                  <span>Reasoning Model:</span>
                  <span className="font-medium">{activeReasoningModelLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hotkey:</span>
                  <kbd className="bg-white px-2 py-1 rounded text-xs font-mono">
                    {hotkey}
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span className="font-medium">
                    {getLanguageLabel(preferredLanguage)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Permissions:</span>
                  <span className="font-medium text-green-600">
                    {permissionsHook.micPermissionGranted &&
                    permissionsHook.accessibilityPermissionGranted
                      ? "✓ Granted"
                      : "⚠ Review needed"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Pro tip:</strong> You can always change these settings
                later in the Control Panel.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return apiKey.trim().length > 0;
      case 2:
        return (
          permissionsHook.micPermissionGranted &&
          permissionsHook.accessibilityPermissionGranted
        );
      case 3:
        return hotkey.trim() !== "";
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Load Google Font only in the browser
  React.useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div
      className="h-screen flex flex-col bg-stone-50"
      style={{
        fontFamily: "Noto Sans, sans-serif",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => !open && hideAlertDialog()}
        title={alertDialog.title}
        description={alertDialog.description}
        onOk={() => {}}
      />
      {/* Title Bar */}
      <div className="flex-shrink-0 z-10">
        <TitleBar
          showTitle={true}
          className="bg-white/95 backdrop-blur-xl border-b border-stone-200/60 shadow-sm"
        ></TitleBar>
      </div>

      {/* Progress Bar */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-xl border-b border-stone-200/60 p-6 md:px-16 z-10">
        <div className="max-w-4xl mx-auto">
          <StepProgress steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Content - This will grow to fill available space */}
      <div className="flex-1 px-6 md:pl-16 md:pr-6 py-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-xl border border-stone-200/60 shadow-lg rounded-2xl overflow-hidden">
            <CardContent
              className="p-12 md:p-16"
              style={{ fontFamily: "Noto Sans, sans-serif" }}
            >
              <div className="space-y-8">{renderStep()}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer - This will stick to the bottom */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-t border-stone-200/60 px-6 md:pl-16 md:pr-6 py-8 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={prevStep}
            variant="outline"
            disabled={currentStep === 0}
            className="px-8 py-3 h-12 text-sm font-medium"
            style={{ fontFamily: "Noto Sans, sans-serif" }}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={finishOnboarding}
                className="bg-green-600 hover:bg-green-700 px-8 py-3 h-12 text-sm font-medium"
                style={{ fontFamily: "Noto Sans, sans-serif" }}
              >
                <Check className="w-4 h-4 mr-2" />
                Finish Setup
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-8 py-3 h-12 text-sm font-medium"
                style={{ fontFamily: "Noto Sans, sans-serif" }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

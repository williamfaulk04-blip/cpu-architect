import { useEffect, useRef, type ReactNode } from 'react';
import './assembly-ui.css';

export type AssemblyChoice<Id extends string> = {
  id: Id;
  name: string;
  shortName: string;
  categoryLabel: string;
  color: string;
  disabled: boolean;
  rejected: boolean;
};

type AssemblyUIProps<Id extends string> = {
  stageIndex: number;
  stageCount: number;
  stageName: string;
  score: number;
  installedTotal: number;
  totalComponentCount: number;
  choices: readonly AssemblyChoice<Id>[];
  feedback: string;
  activeSocketLabel: string;
  clue: string;
  selectedComponentId: Id | null;
  selectedDefinition?: string;
  inputLocked: boolean;
  muted: boolean;
  reducedMotion: boolean;
  canvas: ReactNode;
  hint?: { title: string; message: string; actionLabel?: string; dismissible?: boolean };
  phaseAction?: { label: string; run: () => void; disabled?: boolean };
  canDropAt?: (clientX: number, clientY: number) => boolean;
  onSelectComponent: (id: Id) => void;
  onInstallSelected: () => void;
  onDropComponent: (id: Id) => void;
  onDismissHint: () => void;
  onToggleMute: () => void;
};

const pieceType = 'application/x-gpu-architect-component';

function PlacementHint({ title, message, actionLabel = 'Try again', dismissible = true, onDismiss }: {
  title: string;
  message: string;
  actionLabel?: string;
  dismissible?: boolean;
  onDismiss: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog
      className="assembly-hint"
      ref={dialog}
      aria-labelledby="assembly-hint-title"
      aria-describedby="assembly-hint-message"
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onDismiss();
      }}
    >
      <h2 id="assembly-hint-title">{title}</h2>
      <p id="assembly-hint-message">{message}</p>
      <button type="button" autoFocus onClick={onDismiss}>{actionLabel}</button>
    </dialog>
  );
}

export default function AssemblyUI<Id extends string>(props: AssemblyUIProps<Id>) {
  const installButton = useRef<HTMLButtonElement>(null);
  const phaseButton = useRef<HTMLButtonElement>(null);
  const phaseLabel = props.phaseAction?.label;
  const phaseDisabled = props.phaseAction?.disabled;
  const tray = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  const selected = props.choices.find((choice) => choice.id === props.selectedComponentId);
  const canInstall = !props.inputLocked && selected && !selected.disabled;

  useEffect(() => {
    if (props.hint) {
      restoreFocus.current = true;
    } else if (restoreFocus.current) {
      restoreFocus.current = false;
      (phaseButton.current ?? installButton.current)?.focus();
    }
  }, [props.hint]);

  useEffect(() => {
    if (phaseLabel && !phaseDisabled) phaseButton.current?.focus();
    if (!phaseLabel && !props.inputLocked && document.activeElement === document.body) {
      tray.current?.querySelector<HTMLButtonElement>('button:enabled')?.focus();
    }
  }, [phaseDisabled, phaseLabel, props.inputLocked]);

  return (
    <div className="assembly-ui" data-reduced-motion={props.reducedMotion}>
      <header className="assembly-header">
        <h1>GPU Architect</h1>
        <p>Stage {props.stageIndex + 1} / {props.stageCount} - {props.stageName}</p>
        <p>Score <strong>{props.score.toLocaleString()}</strong></p>
        <button type="button" aria-pressed={props.muted} onClick={props.onToggleMute}>Mute</button>
      </header>

      <main className="assembly-layout">
        <div
          className="assembly-board"
          onDragOver={(event) => {
            if (!props.inputLocked && event.dataTransfer.types.includes(pieceType)
              && (props.canDropAt?.(event.clientX, event.clientY) ?? true)) {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }
          }}
          onDrop={(event) => {
            if (props.inputLocked || !event.dataTransfer.types.includes(pieceType)
              || props.canDropAt?.(event.clientX, event.clientY) === false) return;
            event.preventDefault();
            const id = event.dataTransfer.getData(pieceType);
            const choice = props.choices.find((item) => item.id === id && !item.disabled);
            if (choice) props.onDropComponent(choice.id);
          }}
        >
          {props.canvas}
        </div>

        <section className="assembly-info" aria-labelledby="assembly-socket-title">
          <h2 id="assembly-socket-title">{props.activeSocketLabel}</h2>
          <p>{props.clue}</p>
          <label className="assembly-progress">
            GPU progress - {props.installedTotal} / {props.totalComponentCount} installed
            <progress value={props.installedTotal} max={props.totalComponentCount} />
          </label>
          {props.phaseAction && (
            <button type="button" className="assembly-phase-action" ref={phaseButton} disabled={phaseDisabled} onClick={props.phaseAction.run}>
              {props.phaseAction.label}
            </button>
          )}
        </section>

        <section className="assembly-tray-section" aria-labelledby="assembly-tray-title">
          <h2 id="assembly-tray-title">Component tray</h2>
          <div className="assembly-tray" ref={tray}>
            {props.choices.map((choice) => (
              <button
                className="assembly-piece"
                key={choice.id}
                type="button"
                aria-pressed={selected?.id === choice.id}
                disabled={props.inputLocked || choice.disabled}
                draggable={!props.inputLocked && !choice.disabled}
                onClick={() => props.onSelectComponent(choice.id)}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData(pieceType, choice.id);
                }}
              >
                <span className="assembly-piece-code" style={{ color: choice.color }}>{choice.shortName}</span>
                <strong>{choice.name}</strong>
                <span>{choice.categoryLabel}</span>
                {choice.disabled ? <span>Installed</span> : choice.rejected && <span>Rejected</span>}
              </button>
            ))}
          </div>
          {selected && (
            <div className="assembly-definition">
              <h3>{selected.name}</h3>
              <p>{props.selectedDefinition}</p>
            </div>
          )}
          {!props.phaseAction && <button
            ref={installButton}
            type="button"
            aria-disabled={!canInstall}
            onClick={() => { if (canInstall) props.onInstallSelected(); }}
          >
            Install selected component
          </button>}
        </section>

        <section className="assembly-log" aria-labelledby="assembly-log-title">
          <h2 id="assembly-log-title">Architect Log</h2>
          <p aria-live="polite" aria-atomic="true">{props.feedback}</p>
        </section>
      </main>
      {props.hint && <PlacementHint {...props.hint} onDismiss={props.onDismissHint} />}
    </div>
  );
}
